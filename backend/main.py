import argparse
import json
import sys
import os

BASE_DIR = os.path.dirname(__file__)
sys.path.insert(0, BASE_DIR)

from db_inject import ensure_table_exists, inject_report
from AST import extract_routes
from Semgrep import run_semgrep
from K6 import run_k6
from scanner import build_report
from git_cloner import ingest_and_extract_routes, cleanup_repo

DEFAULT_TARGET = os.path.join(BASE_DIR, "pipeline_check.py")
DEFAULT_RULES = os.path.join(BASE_DIR, "rules.yaml")
DEFAULT_K6_SCRIPT = os.path.join(BASE_DIR, "test.js")


def parse_args():
    parser = argparse.ArgumentParser(description="Rampling — API Scanner")
    parser.add_argument("--repo-url", default=None, help="Remote Git repository URL to clone")
    parser.add_argument("--backend-folder", default=None, help="Subfolder where backend code resides")
    parser.add_argument("--entrypoint", default="main.py", help="Entrypoint file inside the backend folder")
    parser.add_argument("--staging-url", default=None, help="Live staging URL for k6 load testing")
    parser.add_argument("--target", default=DEFAULT_TARGET, help="Local file target (fallback)")
    parser.add_argument("--rules", default=DEFAULT_RULES, help="Semgrep rules path")
    parser.add_argument("--k6-script", default=DEFAULT_K6_SCRIPT, help="k6 test script path")
    parser.add_argument("--skip-k6", action="store_true", help="Skip k6 load testing")
    return parser.parse_args()


def run_pipeline(args):
    ensure_table_exists()

    cloned_dir = None
    target_scan_file = args.target
    semgrep_target = args.target

    try:
        if args.repo_url:
            if not args.backend_folder:
                raise ValueError("--backend-folder must be specified when using --repo-url")

            print(f"[*] Ingesting repo '{args.repo_url}' with backend folder '{args.backend_folder}'...")
            routes, cloned_dir, backend_dir, entrypoint_path = ingest_and_extract_routes(
                repo_url=args.repo_url,
                backend_folder=args.backend_folder,
                entrypoint_file=args.entrypoint,
                output_json="/tmp/ast_graph.json",
            )
            target_scan_file = entrypoint_path
            semgrep_target = backend_dir
        else:
            routes = extract_routes(args.target)

        if not routes:
            print("No routes found")

        findings = run_semgrep(semgrep_target, args.rules)

        k6_metrics = {}
        if not args.skip_k6:
            k6_metrics = run_k6(args.k6_script)

        report_rows = build_report(
            target_file=target_scan_file,
            routes=routes,
            findings=findings,
            k6_metrics=k6_metrics,
        )

        inserted_ids = inject_report(report_rows)

        print(f"\nRoutes: {len(routes)} | Findings: {len(findings)} | Inserted: {len(inserted_ids)} -> {inserted_ids}")
        print(json.dumps(report_rows, indent=2, default=str))

    finally:
        if cloned_dir:
            cleanup_repo(cloned_dir)
            print(f"[*] Cleaned up temporary repository: {cloned_dir}")


if __name__ == "__main__":
    args = parse_args()
    run_pipeline(args)
