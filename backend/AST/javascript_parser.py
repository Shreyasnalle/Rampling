import os
from typing import Any, Dict, List, Optional, Tuple

try:
    from tree_sitter import Language, Parser, Node
    import tree_sitter_javascript

    JS_LANG = Language(tree_sitter_javascript.language())
except Exception:
    JS_LANG = None

try:
    from .tree_sitter_graph import BaseLanguageParser, FunctionDefInfo, RouteNode, HTTP_METHODS
except ImportError:
    from tree_sitter_graph import BaseLanguageParser, FunctionDefInfo, RouteNode, HTTP_METHODS


class JavascriptParser(BaseLanguageParser):
    def __init__(self):
        if not JS_LANG:
            raise RuntimeError("tree-sitter or tree-sitter-javascript is not available")
        self.parser = Parser(JS_LANG)

    def get_parser(self) -> Parser:
        return self.parser

    def _strip_quotes(self, s: str) -> str:
        s = s.strip()
        if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")) or (s.startswith("`") and s.endswith("`")):
            return s[1:-1]
        return s

    def extract_routes(self, root_node: Node, source_bytes: bytes, file_path: str) -> List[RouteNode]:
        routes: List[RouteNode] = []

        def walk(node: Node):
            if node.type == "call_expression":
                fn_node = node.child_by_field_name("function")
                args_node = node.child_by_field_name("arguments")
                if fn_node and args_node and fn_node.type == "member_expression":
                    prop = fn_node.child_by_field_name("property")
                    if prop:
                        method_name = prop.text.decode("utf-8").upper()
                        if method_name in HTTP_METHODS or method_name == "ALL":
                            method = method_name
                            path = "/"
                            handler_name = "<anonymous>"
                            handler_node = None

                            for arg in args_node.children:
                                if arg.type in ("string", "template_string"):
                                    path = self._strip_quotes(arg.text.decode("utf-8"))
                                elif arg.type == "identifier":
                                    handler_name = arg.text.decode("utf-8")
                                elif arg.type in ("arrow_function", "function_expression"):
                                    handler_name = f"<inline_{method.lower()}_{path.replace('/', '_').strip('_')}>"
                                    handler_node = arg

                            routes.append(
                                RouteNode(
                                    method=method,
                                    path=path,
                                    function=handler_name,
                                    file=file_path,
                                    start_line=node.start_point[0] + 1,
                                    end_line=node.end_point[0] + 1,
                                    handler_node=handler_node,
                                )
                            )

            for child in node.children:
                walk(child)

        walk(root_node)
        return routes

    def extract_function_defs(self, root_node: Node, source_bytes: bytes, file_path: str) -> Dict[str, FunctionDefInfo]:
        funcs: Dict[str, FunctionDefInfo] = {}

        def walk(node: Node, current_class: Optional[str] = None):
            if node.type == "class_declaration":
                c_name_node = node.child_by_field_name("name")
                c_name = c_name_node.text.decode("utf-8") if c_name_node else None
                for child in node.children:
                    walk(child, current_class=c_name)
                return

            if node.type in ("function_declaration", "function"):
                name_node = node.child_by_field_name("name")
                if name_node:
                    fn_name = name_node.text.decode("utf-8")
                    start_line = node.start_point[0] + 1
                    end_line = node.end_point[0] + 1
                    info = FunctionDefInfo(
                        name=fn_name,
                        file=file_path,
                        start_line=start_line,
                        end_line=end_line,
                        node=node,
                    )
                    funcs[fn_name] = info
                    if current_class:
                        funcs[f"{current_class}.{fn_name}"] = info

            elif node.type == "method_definition":
                name_node = node.child_by_field_name("name")
                if name_node:
                    fn_name = name_node.text.decode("utf-8")
                    start_line = node.start_point[0] + 1
                    end_line = node.end_point[0] + 1
                    info = FunctionDefInfo(
                        name=fn_name,
                        file=file_path,
                        start_line=start_line,
                        end_line=end_line,
                        node=node,
                    )
                    funcs[fn_name] = info
                    if current_class:
                        funcs[f"{current_class}.{fn_name}"] = info

            elif node.type == "variable_declarator":
                name_node = node.child_by_field_name("name")
                value_node = node.child_by_field_name("value")
                if name_node and value_node and value_node.type in ("arrow_function", "function_expression"):
                    fn_name = name_node.text.decode("utf-8")
                    start_line = node.start_point[0] + 1
                    end_line = node.end_point[0] + 1
                    funcs[fn_name] = FunctionDefInfo(
                        name=fn_name,
                        file=file_path,
                        start_line=start_line,
                        end_line=end_line,
                        node=value_node,
                    )

            for child in node.children:
                walk(child, current_class)

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
        current_dir = os.path.dirname(os.path.abspath(current_file))
        repo_root_abs = os.path.abspath(repo_root) if repo_root else current_dir

        def find_js_file(import_rel: str) -> Optional[str]:
            import_clean = import_rel.strip()
            bases = [current_dir, repo_root_abs]
            for base in bases:
                candidates = [
                    os.path.join(base, import_clean),
                    os.path.join(base, import_clean + ".js"),
                    os.path.join(base, import_clean + ".ts"),
                    os.path.join(base, import_clean + ".jsx"),
                    os.path.join(base, import_clean + ".tsx"),
                    os.path.join(base, import_clean + ".mjs"),
                    os.path.join(base, import_clean, "index.js"),
                    os.path.join(base, import_clean, "index.ts"),
                ]
                for c in candidates:
                    if os.path.isfile(c):
                        return os.path.abspath(c)
            return None

        def walk(node: Node):
            # ES6 Imports: import ... from './path'
            if node.type == "import_statement":
                source_node = node.child_by_field_name("source")
                raw_path = self._strip_quotes(source_node.text.decode("utf-8")) if source_node else ""
                resolved = find_js_file(raw_path) if raw_path else None
                if resolved:
                    for child in node.children:
                        if child.type == "import_clause":
                            for clause_child in child.children:
                                if clause_child.type == "identifier":
                                    # Default import: import router from './routes'
                                    imports[clause_child.text.decode("utf-8")] = resolved
                                elif clause_child.type == "named_imports":
                                    # Named imports: import { a, b as c } from './routes'
                                    for spec in clause_child.children:
                                        if spec.type == "import_specifier":
                                            alias_node = spec.child_by_field_name("alias")
                                            name_node = spec.child_by_field_name("name")
                                            sym = alias_node.text.decode("utf-8") if alias_node else (name_node.text.decode("utf-8") if name_node else "")
                                            if sym:
                                                imports[sym] = resolved
                                elif clause_child.type == "namespace_import":
                                    # Namespace: import * as auth from './auth'
                                    for ns_child in clause_child.children:
                                        if ns_child.type == "identifier":
                                            imports[ns_child.text.decode("utf-8")] = resolved

            # CommonJS: const x = require('./path') or const { a } = require('./path')
            elif node.type == "variable_declarator":
                name_node = node.child_by_field_name("name")
                value_node = node.child_by_field_name("value")
                if (
                    name_node
                    and value_node
                    and value_node.type == "call_expression"
                    and value_node.child_by_field_name("function")
                    and value_node.child_by_field_name("function").text.decode("utf-8") == "require"
                ):
                    args = value_node.child_by_field_name("arguments")
                    if args and args.children:
                        for arg in args.children:
                            if arg.type in ("string", "template_string"):
                                raw_path = self._strip_quotes(arg.text.decode("utf-8"))
                                resolved = find_js_file(raw_path)
                                if resolved:
                                    if name_node.type == "identifier":
                                        imports[name_node.text.decode("utf-8")] = resolved
                                    elif name_node.type == "object_pattern":
                                        for prop in name_node.children:
                                            if prop.type == "shorthand_property_identifier_pattern":
                                                imports[prop.text.decode("utf-8")] = resolved
                                            elif prop.type == "pair_pattern":
                                                val = prop.child_by_field_name("value")
                                                if val and val.type == "identifier":
                                                    imports[val.text.decode("utf-8")] = resolved

            for child in node.children:
                walk(child)

        walk(root_node)
        return imports
