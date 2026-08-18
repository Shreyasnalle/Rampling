from re import finditer
import ast
import json
import subprocess

def extract_routes(filepath) :
    with open(filepath, "r") as f :
        string_code = f.read()
    tree_format = ast.parse(string_code)
    results = []
    for node in ast.walk(tree_format) :
        if isinstance(node, ast.FunctionDef) :
            for x in node.decorator_list :
                if isinstance(x, ast.Call) and isinstance(x.func, ast.Attribute) and isinstance(x.func.value, ast.Name) and x.func.value.id == "app" :
                    method = x.func.attr 
                    if x.args :
                        path = x.args[0].value
                        results.append({
                            "method" : method.upper(),
                            "path" : path,
                            "function" : node.name
                        })
    return results

def run_semgrep(filepath, rules_path) :
    results = subprocess.run(
        ["semgrep", "--config", rules_path, filepath, "--json"],
        capture_output = True,
        text = True
    )
    output = json.loads(results.stdout)
    finding = []
    for r in output.get("results", []) :
        finding.append({
            "rule_id" : r["check_id"],
            "file" : r["path"],
            "line" : r["start"]["line"],
            "message" : r["extra"]["message"]
        })
    return finding

if __name__ == "__main__" :
    target_file = "main.py"
    rules_file = "rules.yaml"
    routes = extract_routes(target_file)
    findings = run_semgrep(target_file, rules_file)
    report = {
        "target" : target_file,
        "routes" : routes,
        "semgrep_findings" : findings
    }
    print(json.dumps(report, indent = 2))