import ast
import json
import subprocess
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
                })
    print(f"[AST] Found {len(routes)} route(s) in '{filepath}'.")
    return routes


def run_semgrep(filepath: str, rules_path: str) -> list[dict]:
    result = subprocess.run(
        ["semgrep", "--config", rules_path, filepath, "--json"],
        capture_output=True,
        text=True,
    )
    if result.returncode not in (0, 1):
        print(f"[Semgrep] Warning: exit {result.returncode}")
        print(result.stderr[:500])
    try:
        output = json.loads(result.stdout)
    except json.JSONDecodeError:
        print("[Semgrep] Could not parse JSON output.")
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
    print(f"[Semgrep] {len(findings)} finding(s) in '{filepath}'.")
    return findings


def run_k6(script_path: str) -> dict[str, Any]:
    summary_file = "/tmp/k6_summary.json"
    result = subprocess.run(
        ["k6", "run", "--summary-export", summary_file, script_path],
        capture_output=True,
        text=True,
    )
    if result.returncode not in (0, 99):
        print(f"[k6] Warning: exit {result.returncode}")
        print(result.stderr[:500])
    try:
        with open(summary_file, "r") as f:
            summary = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        print(f"[k6] Could not read summary: {exc}")
        return {}
    metrics = summary.get("metrics", {})

    def _val(metric_name: str, stat: str) -> float:
        m = metrics.get(metric_name, {})
        return float(m.get("values", {}).get(stat, 0.0))

    parsed = {
        "avg_duration": _val("http_req_duration", "avg"),
        "p90_duration": _val("http_req_duration", "p(90)"),
        "p95_duration": _val("http_req_duration", "p(95)"),
        "req_failed": _val("http_req_failed", "rate"),
        "rps": _val("http_reqs", "rate"),
    }
    print(f"[k6] avg={parsed['avg_duration']:.1f}ms p90={parsed['p90_duration']:.1f}ms p95={parsed['p95_duration']:.1f}ms fail={parsed['req_failed']:.2%} rps={parsed['rps']:.1f}")
    return parsed


def build_report(target_file: str, routes: list[dict], findings: list[dict], k6_metrics: dict[str, Any]) -> list[dict]:
    finding_map: dict[str, dict] = {}
    for f in findings:
        for route in routes:
            if route["function"] in f["message"] or route["path"] in f["message"]:
                finding_map[route["function"]] = f
                break
        else:
            finding_map.setdefault("__unmatched__", f)

    scanned_at = datetime.now(timezone.utc).isoformat()
    rows = []
    for route in routes:
        finding = finding_map.get(route["function"], finding_map.get("__unmatched__"))
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
            "k6_avg_duration": k6_metrics.get("avg_duration"),
            "k6_p90_duration": k6_metrics.get("p90_duration"),
            "k6_p95_duration": k6_metrics.get("p95_duration"),
            "k6_req_failed": k6_metrics.get("req_failed"),
            "k6_rps": k6_metrics.get("rps"),
        })
    print(f"[Report] Built {len(rows)} row(s).")
    return rows
