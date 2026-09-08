from datetime import datetime, timezone
from typing import Any

def build_report(target_file: str, routes: list[dict], findings: list[dict], k6_metrics: list[dict[str, Any]] | dict[str, Any]) -> list[dict]:
    finding_map: dict[str, dict] = {}
    for f in findings:
        matched = False
        for route in routes:
            func_name = route["function"]
            route_path = route["path"]
            start_line = route.get("start_line", 0)
            end_line = route.get("end_line", 0)

            # Check direct match or message match
            direct_match = (func_name in f["message"] or route_path in f["message"] or (start_line <= f["line"] <= end_line))
            
            # Check call-graph scoped lines across helper functions
            branch_match = False
            if not direct_match and "scoped_lines" in route:
                for scope in route["scoped_lines"]:
                    if scope.get("start_line", 0) <= f["line"] <= scope.get("end_line", 0):
                        branch_match = True
                        break

            if direct_match or branch_match:
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