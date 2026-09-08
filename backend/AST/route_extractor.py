import ast
import os
from typing import Any, List, Optional
from .tree_sitter_graph import build_call_graph, HAS_TREE_SITTER


def _fallback_extract_routes_py(filepath: str) -> List[dict]:
    with open(filepath, "r", encoding="utf-8") as f:
        source = f.read()
    tree = ast.parse(source)
    routes = []
    for node in ast.walk(tree):
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        for decorator in node.decorator_list:
            if (
                isinstance(decorator, ast.Call)
                and isinstance(decorator.func, ast.Attribute)
                and isinstance(decorator.func.value, ast.Name)
                and decorator.func.value.id in ("app", "router", "api_router")
                and decorator.args
                and hasattr(decorator.args[0], "value")
            ):
                start_l = node.decorator_list[0].lineno if node.decorator_list else getattr(node, "lineno", 0)
                end_l = getattr(node, "end_lineno", getattr(node, "lineno", 0) + 50)
                routes.append({
                    "method": decorator.func.attr.upper(),
                    "path": decorator.args[0].value,
                    "function": node.name,
                    "file": os.path.abspath(filepath),
                    "start_line": start_l,
                    "end_line": end_l,
                    "call_graph": {
                        "name": node.name,
                        "file": os.path.abspath(filepath),
                        "start_line": start_l,
                        "end_line": end_l,
                        "calls": [],
                    },
                    "scoped_lines": [
                        {
                            "file": os.path.abspath(filepath),
                            "function": node.name,
                            "start_line": start_l,
                            "end_line": end_l,
                        }
                    ],
                })
    return routes


def extract_routes(filepath: str, repo_root: Optional[str] = None) -> List[dict]:
    if HAS_TREE_SITTER:
        try:
            routes = build_call_graph(filepath, repo_root=repo_root)
            if routes:
                print(f"[AST/Tree-sitter] Found {len(routes)} route(s) in '{filepath}'")
                return routes
        except Exception as e:
            print(f"[AST Warning] Tree-sitter extraction failed: {e}. Trying fallback.")

    if filepath.endswith((".py", ".pyw")):
        routes = _fallback_extract_routes_py(filepath)
        print(f"[AST/Fallback] Found {len(routes)} route(s) in '{filepath}'")
        return routes

    print(f"[AST] No routes extracted from '{filepath}'")
    return []
