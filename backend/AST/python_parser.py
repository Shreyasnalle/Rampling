"""
Python AST & Route Parser using Tree-sitter.
Extracts FastAPI / Flask routes, function definitions, calls, and local module imports.
"""

import os
from typing import Any, Dict, List, Optional, Tuple

try:
    from tree_sitter import Language, Parser, Node
    import tree_sitter_python

    PY_LANG = Language(tree_sitter_python.language())
except Exception:
    PY_LANG = None

try:
    from .tree_sitter_graph import BaseLanguageParser, FunctionDefInfo, RouteNode, HTTP_METHODS
except ImportError:
    from tree_sitter_graph import BaseLanguageParser, FunctionDefInfo, RouteNode, HTTP_METHODS


class PythonParser(BaseLanguageParser):
    def __init__(self):
        if not PY_LANG:
            raise RuntimeError("tree-sitter or tree-sitter-python is not available")
        self.parser = Parser(PY_LANG)

    def get_parser(self) -> Parser:
        return self.parser

    def _strip_quotes(self, s: str) -> str:
        s = s.strip()
        if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
            return s[1:-1]
        return s

    def extract_routes(self, root_node: Node, source_bytes: bytes, file_path: str) -> List[RouteNode]:
        routes: List[RouteNode] = []

        def walk(node: Node):
            if node.type == "decorated_definition":
                fn_def = None
                decorator_nodes = []
                for child in node.children:
                    if child.type == "decorator":
                        decorator_nodes.append(child)
                    elif child.type in ("function_definition", "async_function_definition"):
                        fn_def = child

                if fn_def and decorator_nodes:
                    fn_name_node = fn_def.child_by_field_name("name")
                    fn_name = fn_name_node.text.decode("utf-8") if fn_name_node else "<anonymous>"
                    start_line = node.start_point[0] + 1
                    end_line = node.end_point[0] + 1

                    for dec in decorator_nodes:
                        dec_call = None
                        for c in dec.children:
                            if c.type == "call":
                                dec_call = c
                                break
                        if not dec_call:
                            continue

                        func_node = dec_call.child_by_field_name("function")
                        args_node = dec_call.child_by_field_name("arguments")
                        if not func_node or not args_node:
                            continue

                        method = None
                        func_text = func_node.text.decode("utf-8")
                        parts = func_text.split(".")
                        if len(parts) >= 2:
                            candidate_method = parts[-1].upper()
                            if candidate_method in HTTP_METHODS or candidate_method == "API_ROUTE":
                                method = candidate_method if candidate_method != "API_ROUTE" else "ALL"

                        path = "/"
                        for arg in args_node.children:
                            if arg.type == "string":
                                path = self._strip_quotes(arg.text.decode("utf-8"))
                                break

                        if method:
                            routes.append(
                                RouteNode(
                                    method=method,
                                    path=path,
                                    function=fn_name,
                                    file=file_path,
                                    start_line=start_line,
                                    end_line=end_line,
                                )
                            )

            for child in node.children:
                walk(child)

        walk(root_node)
        return routes

    def extract_function_defs(self, root_node: Node, source_bytes: bytes, file_path: str) -> Dict[str, FunctionDefInfo]:
        funcs: Dict[str, FunctionDefInfo] = {}

        def walk(node: Node):
            if node.type in ("function_definition", "async_function_definition"):
                name_node = node.child_by_field_name("name")
                if name_node:
                    fn_name = name_node.text.decode("utf-8")
                    start_line = node.start_point[0] + 1
                    end_line = node.end_point[0] + 1
                    body_node = node.child_by_field_name("body")
                    funcs[fn_name] = FunctionDefInfo(
                        name=fn_name,
                        file=file_path,
                        start_line=start_line,
                        end_line=end_line,
                        node=body_node,
                    )

            for child in node.children:
                walk(child)

        walk(root_node)
        return funcs

    def extract_calls(self, body_node: Optional[Node], source_bytes: bytes) -> List[Tuple[str, int]]:
        if not body_node:
            return []
        calls: List[Tuple[str, int]] = []

        def walk(node: Node):
            if node.type == "call":
                fn_node = node.child_by_field_name("function")
                if fn_node:
                    call_name = fn_node.text.decode("utf-8")
                    call_line = node.start_point[0] + 1
                    calls.append((call_name, call_line))
            for child in node.children:
                walk(child)

        walk(body_node)
        return calls

    def resolve_local_imports(self, root_node: Node, source_bytes: bytes, current_file: str, repo_root: str) -> Dict[str, str]:
        """Resolves Python `from x import y` and `import x` to local file paths."""
        imports: Dict[str, str] = {}
        current_dir = os.path.dirname(os.path.abspath(current_file))

        def find_python_file(module_path: str) -> Optional[str]:
            rel_path = module_path.replace(".", os.sep)
            candidates = [
                os.path.join(current_dir, rel_path + ".py"),
                os.path.join(current_dir, rel_path, "__init__.py"),
                os.path.join(repo_root, rel_path + ".py"),
                os.path.join(repo_root, rel_path, "__init__.py"),
            ]
            for c in candidates:
                if os.path.isfile(c):
                    return os.path.abspath(c)
            return None

        def walk(node: Node):
            if node.type == "import_from_statement":
                module_node = node.child_by_field_name("module_name")
                module_name = module_node.text.decode("utf-8") if module_node else ""
                target_file = find_python_file(module_name) if module_name else None

                for child in node.children:
                    if child.type == "dotted_name" and child != module_node:
                        symbol = child.text.decode("utf-8")
                        if target_file:
                            imports[symbol] = target_file
                    elif child.type == "aliased_import":
                        name_node = child.child_by_field_name("name")
                        alias_node = child.child_by_field_name("alias")
                        symbol = alias_node.text.decode("utf-8") if alias_node else (name_node.text.decode("utf-8") if name_node else "")
                        if symbol and target_file:
                            imports[symbol] = target_file

            elif node.type == "import_statement":
                for child in node.children:
                    if child.type == "dotted_name":
                        mod = child.text.decode("utf-8")
                        target_file = find_python_file(mod)
                        if target_file:
                            imports[mod] = target_file

            for child in node.children:
                walk(child)

        walk(root_node)
        return imports
