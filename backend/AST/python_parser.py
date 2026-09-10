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

                        func_text = func_node.text.decode("utf-8")
                        parts = func_text.split(".")
                        candidate = parts[-1].upper() if len(parts) >= 2 else ""

                        detected_methods: List[str] = []
                        if candidate in HTTP_METHODS:
                            detected_methods = [candidate]
                        elif candidate in ("ROUTE", "API_ROUTE"):
                            # Check keyword argument 'methods' e.g. methods=["GET", "POST"]
                            found_methods = []
                            for arg in args_node.children:
                                if arg.type == "keyword_argument":
                                    k_node = arg.child_by_field_name("name")
                                    v_node = arg.child_by_field_name("value")
                                    if k_node and k_node.text.decode("utf-8") == "methods" and v_node:
                                        for m_child in v_node.children:
                                            if m_child.type == "string":
                                                m_str = self._strip_quotes(m_child.text.decode("utf-8")).upper()
                                                if m_str in HTTP_METHODS:
                                                    found_methods.append(m_str)
                            if found_methods:
                                detected_methods = found_methods
                            elif candidate == "ROUTE":
                                detected_methods = ["GET"]  # Flask defaults @app.route to GET
                            else:
                                detected_methods = ["ALL"]

                        path = "/"
                        for arg in args_node.children:
                            if arg.type == "string":
                                path = self._strip_quotes(arg.text.decode("utf-8"))
                                break

                        for method in detected_methods:
                            routes.append(
                                RouteNode(
                                    method=method,
                                    path=path,
                                    function=fn_name,
                                    file=file_path,
                                    start_line=start_line,
                                    end_line=end_line,
                                    handler_node=fn_def,
                                )
                            )

            for child in node.children:
                walk(child)

        walk(root_node)
        return routes

    def extract_function_defs(self, root_node: Node, source_bytes: bytes, file_path: str) -> Dict[str, FunctionDefInfo]:
        funcs: Dict[str, FunctionDefInfo] = {}

        def walk(node: Node, current_class: Optional[str] = None):
            if node.type == "class_definition":
                class_name_node = node.child_by_field_name("name")
                c_name = class_name_node.text.decode("utf-8") if class_name_node else None
                for child in node.children:
                    walk(child, current_class=c_name)
                return

            if node.type in ("function_definition", "async_function_definition"):
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

            for child in node.children:
                walk(child, current_class)

        walk(root_node)
        return funcs

    def extract_calls(self, body_node: Optional[Node], source_bytes: bytes) -> List[Tuple[str, int]]:
        if not body_node:
            return []
        calls: List[Tuple[str, int]] = []
        seen = set()

        # Identify local assigned variable names in this function body
        # so primitive variables are not treated as function calls
        local_assigned_vars = set()
        def find_locals(n: Node):
            if n.type == "assignment":
                left = n.child_by_field_name("left")
                if left and left.type == "identifier":
                    local_assigned_vars.add(left.text.decode("utf-8"))
            elif n.type == "for_statement":
                left = n.child_by_field_name("left")
                if left and left.type == "identifier":
                    local_assigned_vars.add(left.text.decode("utf-8"))
            for child in n.children:
                find_locals(child)

        find_locals(body_node)

        def walk(node: Node):
            line = node.start_point[0] + 1

            if node.type == "call":
                fn_node = node.child_by_field_name("function")
                if fn_node:
                    call_name = fn_node.text.decode("utf-8")
                    if (call_name, line) not in seen:
                        seen.add((call_name, line))
                        calls.append((call_name, line))

                # Inspect arguments for passed callables (to_thread, submit, map, delay, callbacks, etc.)
                args_node = node.child_by_field_name("arguments")
                if args_node:
                    for arg in args_node.children:
                        if arg.type in ("identifier", "attribute"):
                            txt = arg.text.decode("utf-8")
                            if txt not in local_assigned_vars and (txt, line) not in seen:
                                seen.add((txt, line))
                                calls.append((txt, line))
                        elif arg.type == "keyword_argument":
                            val = arg.child_by_field_name("value")
                            if val and val.type in ("identifier", "attribute"):
                                txt = val.text.decode("utf-8")
                                if txt not in local_assigned_vars and (txt, line) not in seen:
                                    seen.add((txt, line))
                                    calls.append((txt, line))

            # Also capture yield, return, await expressions
            elif node.type in ("yield", "return_statement", "await"):
                for child in node.children:
                    if child.type in ("identifier", "attribute"):
                        txt = child.text.decode("utf-8")
                        if txt not in local_assigned_vars and (txt, line) not in seen:
                            seen.add((txt, line))
                            calls.append((txt, line))

            for child in node.children:
                walk(child)

        walk(body_node)
        return calls

    def resolve_local_imports(self, root_node: Node, source_bytes: bytes, current_file: str, repo_root: str) -> Dict[str, str]:
        imports: Dict[str, str] = {}
        current_dir = os.path.dirname(os.path.abspath(current_file))
        repo_root_abs = os.path.abspath(repo_root) if repo_root else current_dir

        def check_file_candidates(base_dir: str, rel_path: str) -> Optional[str]:
            rel_path = rel_path.strip(os.sep)
            candidates = [
                os.path.join(base_dir, rel_path + ".py"),
                os.path.join(base_dir, rel_path, "__init__.py"),
            ]
            for c in candidates:
                if os.path.isfile(c):
                    return os.path.abspath(c)
            return None

        def find_python_target(mod_name: str, dots: int = 0) -> Optional[str]:
            if dots > 0:
                base = current_dir
                for _ in range(dots - 1):
                    parent = os.path.dirname(base)
                    if parent and parent != base:
                        base = parent
                if not mod_name:
                    return os.path.abspath(base)
                rel = mod_name.replace(".", os.sep)
                return check_file_candidates(base, rel)

            rel = mod_name.replace(".", os.sep)
            for search_root in (current_dir, repo_root_abs):
                resolved = check_file_candidates(search_root, rel)
                if resolved:
                    return resolved
            return None

        def walk(node: Node):
            if node.type == "import_from_statement":
                dots = 0
                mod_name = ""

                # Locate relative_import or dotted_name
                for child in node.children:
                    if child.type == "relative_import":
                        raw_text = child.text.decode("utf-8")
                        dots = len(raw_text) - len(raw_text.lstrip("."))
                        mod_name = raw_text.lstrip(".")
                        break
                    elif child.type == "dotted_name":
                        mod_name = child.text.decode("utf-8")
                        break

                target_mod_file = find_python_target(mod_name, dots)

                is_after_import = False
                for child in node.children:
                    if child.type == "import":
                        is_after_import = True
                        continue
                    if not is_after_import:
                        continue

                    if child.type == "dotted_name":
                        symbol = child.text.decode("utf-8")
                        sub_target = find_python_target(f"{mod_name}.{symbol}" if mod_name else symbol, dots)
                        if sub_target:
                            imports[symbol] = sub_target
                        elif target_mod_file and os.path.isfile(target_mod_file):
                            imports[symbol] = target_mod_file

                    elif child.type == "aliased_import":
                        name_node = child.child_by_field_name("name")
                        alias_node = child.child_by_field_name("alias")
                        sym = name_node.text.decode("utf-8") if name_node else ""
                        alias = alias_node.text.decode("utf-8") if alias_node else sym
                        if sym:
                            sub_target = find_python_target(f"{mod_name}.{sym}" if mod_name else sym, dots)
                            if sub_target:
                                imports[alias] = sub_target
                            elif target_mod_file and os.path.isfile(target_mod_file):
                                imports[alias] = target_mod_file

            elif node.type == "import_statement":
                for child in node.children:
                    if child.type == "dotted_name":
                        mod = child.text.decode("utf-8")
                        target_file = find_python_target(mod)
                        if target_file:
                            imports[mod] = target_file
                            short_name = mod.split(".")[-1]
                            imports[short_name] = target_file
                    elif child.type == "aliased_import":
                        name_node = child.child_by_field_name("name")
                        alias_node = child.child_by_field_name("alias")
                        if name_node and alias_node:
                            mod = name_node.text.decode("utf-8")
                            alias = alias_node.text.decode("utf-8")
                            target_file = find_python_target(mod)
                            if target_file:
                                imports[alias] = target_file

            for child in node.children:
                walk(child)

        walk(root_node)
        return imports