import json
import subprocess
import os

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
