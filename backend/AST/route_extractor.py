import ast

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
