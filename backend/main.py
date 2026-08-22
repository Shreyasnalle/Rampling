import argparse
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from db_inject import ensure_table_exists, inject_report
from scanner import extract_routes, run_semgrep, run_k6, build_report

DEFAULT_TARGET = "main_app.py"
DEFAULT_RULES = "../testing_k6_semgrep_ast/rules.yaml"
DEFAULT_K6_SCRIPT = "../testing_k6_semgrep_ast/test.js"


def parse_args():
    parser = argparse.ArgumentParser(description="Rampling — API Scanner")
    parser.add_argument("--target", default=DEFAULT_TARGET)
    parser.add_argument("--rules", default=DEFAULT_RULES)
    parser.add_argument("--k6-script", default=DEFAULT_K6_SCRIPT)
    parser.add_argument("--skip-k6", action="store_true")
    return parser.parse_args()


def run_pipeline(args):
    ensure_table_exists()

    routes = extract_routes(args.target)
    if not routes:
        print("[Warning] No routes found.")

    findings = run_semgrep(args.target, args.rules)

    k6_metrics = {}
    if not args.skip_k6:
        k6_metrics = run_k6(args.k6_script)

    report_rows = build_report(
        target_file=args.target,
        routes=routes,
        findings=findings,
        k6_metrics=k6_metrics,
    )

    inserted_ids = inject_report(report_rows)

    print(f"\nRoutes: {len(routes)} | Findings: {len(findings)} | Inserted: {len(inserted_ids)} -> {inserted_ids}")
    print(json.dumps(report_rows, indent=2, default=str))


if __name__ == "__main__":
    args = parse_args()
    run_pipeline(args)
