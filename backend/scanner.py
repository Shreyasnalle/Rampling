import ast
import json
import subprocess
import os
from datetime import datetime, timezone
from typing import Any

def extract_routes(filepath: str) -> list[dict]:
    with open(filepath, "r") as f:
        source = f.read()
    tree = ast.parse(source)
    routes = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.FunctionDef):
            continue
        for decorator in node.decorator_list:
            if (
                isinstance(decorator, ast.Call)
                and isinstance(decorator.func, ast.Attribute)
                and isinstance(decorator.func.value, ast.Name)
                and decorator.func.value.id == "app"
                and decorator.args
            ):
                routes.append({
                    "method": decorator.func.attr.upper(),
                    "path": decorator.args[0].value,
                    "function": node.name,
                    "start_line": node.decorator_list[0].lineno if node.decorator_list else getattr(node, "lineno", 0),
                    "end_line": getattr(node, "end_lineno", getattr(node, "lineno", 0) + 50),
                })
    print(f"Found {len(routes)} route(s) in '{filepath}'")
    return routes


def run_semgrep(filepath: str, rules_path: str) -> list[dict]:
    output_file = "/tmp/semgrep_output.json"
    result = subprocess.run(
        ["semgrep", "--config", rules_path, filepath, "--json", "--output", output_file],
        capture_output=True,
        text=True,
    )

    output = {}
    try:
        if os.path.exists(output_file):
            with open(output_file, "r") as f:
                output = json.load(f)
    except Exception:
        pass
    finally:
        if os.path.exists(output_file):
            try:
                os.remove(output_file)
            except OSError:
                pass

    if not output and result.stdout:
        raw = result.stdout
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1:
            try:
                output = json.loads(raw[start:end + 1])
            except json.JSONDecodeError:
                pass

    if not output:
        print("Semgrep could not parse JSON output")
        return []

    findings = []
    for r in output.get("results", []):
        findings.append({
            "rule_id": r["check_id"],
            "file": r["path"],
            "line": r["start"]["line"],
            "message": r["extra"]["message"],
            "severity": r["extra"].get("severity", "WARNING"),
        })
    print(f"{len(findings)} finding(s) in '{filepath}'.")
    return findings


def run_k6(script_path: str) -> list[dict[str, Any]]:
    summary_file = "/tmp/k6_summary.json"
    result = subprocess.run(
        ["k6", "run", "--summary-export", summary_file, script_path],
        capture_output=True,
        text=True,
    )
    metrics = {}
    try:
        if os.path.exists(summary_file):
            with open(summary_file, "r") as f:
                summary = json.load(f)
                metrics = summary.get("metrics", {})
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        print(f"k6 Could not read summary: {exc}")
        return []
    finally:
        if os.path.exists(summary_file):
            try:
                os.remove(summary_file)
            except OSError:
                pass

    def _val(metric_name: str, *keys: str) -> float:
        m = metrics.get(metric_name, {})
        for k in keys:
            if k in m:
                return float(m[k])
            if "values" in m and isinstance(m["values"], dict) and k in m["values"]:
                return float(m["values"][k])
        return 0.0

    tag_names = set()
    for key in metrics.keys():
        if "{name:" in key and key.endswith("}"):
            tag = key.split("{name:")[1].rstrip("}")
            tag_names.add(tag)

    parsed = []
    for tag in sorted(tag_names):
        item = {
            "route_path": tag,
            "avg_duration": _val(f"http_req_duration{{name:{tag}}}", "avg"),
            "p90_duration": _val(f"http_req_duration{{name:{tag}}}", "p(90)"),
            "p95_duration": _val(f"http_req_duration{{name:{tag}}}", "p(95)"),
            "req_failed": _val(f"http_req_failed{{name:{tag}}}", "value", "rate"),
            "rps": _val(f"http_reqs{{name:{tag}}}", "rate"),
        }
        parsed.append(item)
        print(f"[k6] {tag}: avg={item['avg_duration']:.1f}ms p90={item['p90_duration']:.1f}ms p95={item['p95_duration']:.1f}ms fail={item['req_failed']:.2%} rps={item['rps']:.1f}")

    return parsed


def build_report(target_file: str, routes: list[dict], findings: list[dict], k6_metrics: list[dict[str, Any]] | dict[str, Any]) -> list[dict]:
    finding_map: dict[str, dict] = {}
    for f in findings:
        matched = False
        for route in routes:
            func_name = route["function"]
            route_path = route["path"]
            start_line = route.get("start_line", 0)
            end_line = route.get("end_line", 0)

            if (func_name in f["message"] or route_path in f["message"] or (start_line <= f["line"] <= end_line)):
                finding_map[func_name] = f
                matched = True
                break

    k6_map: dict[str, dict] = {}
    if isinstance(k6_metrics, list):
        for k in k6_metrics:
            if k.get("route_path"):
                k6_map[k["route_path"]] = k
    elif isinstance(k6_metrics, dict):
        k6_map = {r["path"]: k6_metrics for r in routes}

    scanned_at = datetime.now(timezone.utc).isoformat()
    rows = []
    for route in routes:
        finding = finding_map.get(route["function"])
        k6_m = k6_map.get(route["path"], {})
        rows.append({
            "scanned_at": scanned_at,
            "target_file": target_file,
            "route_method": route["method"],
            "route_path": route["path"],
            "route_function": route["function"],
            "semgrep_rule_id": finding["rule_id"] if finding else None,
            "semgrep_file": finding["file"] if finding else None,
            "semgrep_line": finding["line"] if finding else None,
            "semgrep_message": finding["message"] if finding else None,
            "severity": finding["severity"] if finding else "INFO",
            "k6_avg_duration": k6_m.get("avg_duration"),
            "k6_p90_duration": k6_m.get("p90_duration"),
            "k6_p95_duration": k6_m.get("p95_duration"),
            "k6_req_failed": k6_m.get("req_failed"),
            "k6_rps": k6_m.get("rps"),
        })
    print(f"[Report] Built {len(rows)} row(s).")
    return rows