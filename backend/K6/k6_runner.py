import json
import subprocess
import os
from typing import Any

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
