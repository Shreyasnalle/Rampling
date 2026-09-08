"""
Go AST & Route Parser using Tree-sitter.
Extracts Gin / Chi / net/http routes, function declarations, and call expressions.
"""

import os
from typing import Any, Dict, List, Optional, Tuple

try:
    from tree_sitter import Language, Parser, Node
    import tree_sitter_go

    GO_LANG = Language(tree_sitter_go.language())
except Exception:
    GO_LANG = None

try:
    from .tree_sitter_graph import BaseLanguageParser, FunctionDefInfo, RouteNode, HTTP_METHODS
except ImportError:
    from tree_sitter_graph import BaseLanguageParser, FunctionDefInfo, RouteNode, HTTP_METHODS


class GoParser(BaseLanguageParser):
    def __init__(self):
        if not GO_LANG:
            raise RuntimeError("tree-sitter or tree-sitter-go is not available")
        self.parser = Parser(GO_LANG)

    def get_parser(self) -> Parser:
        return self.parser

    def _strip_quotes(self, s: str) -> str:
        s = s.strip()
        if (s.startswith('"') and s.endswith('"')) or (s.startswith("`") and s.endswith("`")):
            return s[1:-1]
        return s

    def extract_routes(self, root_node: Node, source_bytes: bytes, file_path: str) -> List[RouteNode]:
        routes: List[RouteNode] = []

        def walk(node: Node):
            if node.type == "call_expression":
                fn_node = node.child_by_field_name("function")
                args_node = node.child_by_field_name("arguments")
                if fn_node and args_node and fn_node.type == "selector_expression":
                    field_node = fn_node.child_by_field_name("field")
                    if field_node:
                        method_name = field_node.text.decode("utf-8").upper()
                        if method_name in HTTP_METHODS or method_name in ("HANDLE", "HANDLEFUNC"):
                            method = "GET" if method_name in ("HANDLE", "HANDLEFUNC") else method_name
                            path = "/"
                            handler_name = "<anonymous>"

                            for arg in args_node.children:
                                if arg.type in ("interpreted_string_literal", "raw_string_literal"):
                                    path = self._strip_quotes(arg.text.decode("utf-8"))
                                elif arg.type == "identifier":
                                    handler_name = arg.text.decode("utf-8")
                                elif arg.type == "func_literal":
                                    handler_name = "<inline_func>"

                            routes.append(
                                RouteNode(
                                    method=method,
                                    path=path,
                                    function=handler_name,
                                    file=file_path,
                                    start_line=node.start_point[0] + 1,
                                    end_line=node.end_point[0] + 1,
                                )
                            )

            for child in node.children:
                walk(child)

        walk(root_node)
        return routes

    def extract_function_defs(self, root_node: Node, source_bytes: bytes, file_path: str) -> Dict[str, FunctionDefInfo]:
        funcs: Dict[str, FunctionDefInfo] = {}

        def walk(node: Node):
            if node.type in ("function_declaration", "method_declaration"):
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
            if node.type == "call_expression":
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
        imports: Dict[str, str] = {}
        return imports
