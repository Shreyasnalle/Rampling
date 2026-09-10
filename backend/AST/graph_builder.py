import os
from typing import Any, Dict, List, Optional, Set, Tuple

try:
    from tree_sitter import Node
except Exception:
    Node = Any

try:
    from .tree_sitter_graph import BaseLanguageParser, FunctionDefInfo, RouteNode
    from .python_parser import PythonParser
    from .go_parser import GoParser
    from .javascript_parser import JavascriptParser
except ImportError:
    from tree_sitter_graph import BaseLanguageParser, FunctionDefInfo, RouteNode
    from python_parser import PythonParser
    from go_parser import GoParser
    from javascript_parser import JavascriptParser


class CallGraphBuilder:
    def __init__(self, repo_root: Optional[str] = None):
        self.repo_root = os.path.abspath(repo_root) if repo_root else None
        self.parsers: Dict[str, BaseLanguageParser] = {}

        try:
            self.parsers["python"] = PythonParser()
        except Exception:
            pass

        try:
            self.parsers["go"] = GoParser()
        except Exception:
            pass

        try:
            self.parsers["javascript"] = JavascriptParser()
        except Exception:
            pass

        self.file_cache: Dict[str, Dict[str, Any]] = {}
        self.repo_symbols: Dict[str, List[Tuple[str, FunctionDefInfo]]] = {}

    def detect_language(self, filepath: str) -> Optional[str]:
        ext = os.path.splitext(filepath)[1].lower()
        if ext in (".py", ".pyw"):
            return "python"
        elif ext == ".go":
            return "go"
        elif ext in (".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx"):
            return "javascript"
        return None

    def _index_repo_symbols(self, lang: str) -> None:
        if not self.repo_root or not os.path.isdir(self.repo_root):
            return

        ext_map = {
            "python": (".py",),
            "javascript": (".js", ".ts", ".mjs", ".cjs", ".jsx", ".tsx"),
            "go": (".go",),
        }
        target_exts = ext_map.get(lang, ())
        if not target_exts:
            return

        skip_dirs = {".git", "__pycache__", "node_modules", "venv", ".venv", ".tox", "dist", "build", "env"}

        for root, dirs, files in os.walk(self.repo_root):
            dirs[:] = [d for d in dirs if d not in skip_dirs and not d.startswith(".")]
            for file in files:
                if any(file.endswith(ext) for ext in target_exts) and not file.endswith(("_test.go", ".spec.js", ".test.js")):
                    file_path = os.path.abspath(os.path.join(root, file))
                    meta = self._get_file_metadata(file_path, lang)
                    funcs = meta.get("funcs", {})
                    for fn_name, fn_info in funcs.items():
                        if fn_name not in self.repo_symbols:
                            self.repo_symbols[fn_name] = []
                        self.repo_symbols[fn_name].append((file_path, fn_info))

    def _resolve_target_symbol(
        self, func_name: str, current_file: str, lang: str
    ) -> Optional[Tuple[str, str, FunctionDefInfo]]:
        abs_file = os.path.abspath(current_file)
        file_meta = self._get_file_metadata(abs_file, lang)
        funcs = file_meta.get("funcs", {})
        imports = file_meta.get("imports", {})

        # 1. Exact match in current file
        if func_name in funcs:
            return abs_file, func_name, funcs[func_name]

        # 2. Local class/method self.method, this.method, cls.method
        if func_name.startswith(("self.", "this.", "cls.")):
            bare = func_name.split(".", 1)[1]
            if bare in funcs:
                return abs_file, bare, funcs[bare]

        # 3. Direct local import (e.g. from module import my_func)
        if func_name in imports:
            target_file = imports[func_name]
            if os.path.isfile(target_file):
                t_meta = self._get_file_metadata(target_file, lang)
                t_funcs = t_meta.get("funcs", {})
                if func_name in t_funcs:
                    return target_file, func_name, t_funcs[func_name]
                for k, v in t_funcs.items():
                    if k == func_name or k.endswith(f".{func_name}"):
                        return target_file, k, v

        # 4. Prefix import (e.g. module.func where module was imported)
        if "." in func_name:
            prefix = func_name.split(".")[0]
            target_method = func_name.split(".")[-1]
            if prefix in imports:
                target_file = imports[prefix]
                if os.path.isfile(target_file):
                    t_meta = self._get_file_metadata(target_file, lang)
                    t_funcs = t_meta.get("funcs", {})
                    if target_method in t_funcs:
                        return target_file, target_method, t_funcs[target_method]
                    for k, v in t_funcs.items():
                        if k == target_method or k.endswith(f".{target_method}"):
                            return target_file, k, v

        # 5. Repository Symbol Phonebook Match
        # (Matches functions across codebase even if called via higher-order functions,
        # thread pools, task queues, or unimported package-level functions)
        bare_name = func_name.split(".")[-1] if "." in func_name else func_name
        candidates = self.repo_symbols.get(bare_name, [])
        if not candidates and func_name in self.repo_symbols:
            candidates = self.repo_symbols[func_name]

        if candidates:
            cur_dir = os.path.dirname(abs_file)
            for c_path, c_info in candidates:
                if os.path.dirname(c_path) == cur_dir:
                    return c_path, c_info.name, c_info
            return candidates[0][0], candidates[0][1].name, candidates[0][1]

        return None

    def _load_and_parse_file(self, file_path: str, lang: str) -> Optional[Tuple[Node, bytes, BaseLanguageParser]]:
        parser_instance = self.parsers.get(lang)
        if not parser_instance:
            return None

        if not os.path.isfile(file_path):
            return None

        try:
            with open(file_path, "rb") as f:
                source_bytes = f.read()
            tree = parser_instance.get_parser().parse(source_bytes)
            return tree.root_node, source_bytes, parser_instance
        except Exception as err:
            print(f"Could not parse file '{file_path}': {err}")
            return None

    def _get_file_metadata(self, file_path: str, lang: str) -> Dict[str, Any]:
        abs_path = os.path.abspath(file_path)
        if abs_path in self.file_cache:
            return self.file_cache[abs_path]

        parsed = self._load_and_parse_file(abs_path, lang)
        if not parsed:
            self.file_cache[abs_path] = {"funcs": {}, "imports": {}, "parser": None}
            return self.file_cache[abs_path]

        root_node, source_bytes, parser_instance = parsed
        repo_root = self.repo_root or os.path.dirname(abs_path)
        funcs = parser_instance.extract_function_defs(root_node, source_bytes, abs_path)
        imports = parser_instance.resolve_local_imports(root_node, source_bytes, abs_path, repo_root)

        self.file_cache[abs_path] = {
            "funcs": funcs,
            "imports": imports,
            "parser": parser_instance,
            "source_bytes": source_bytes,
        }
        return self.file_cache[abs_path]

    def _trace_branch(
        self,
        func_name: str,
        current_file: str,
        lang: str,
        visited: Set[Tuple[str, str]],
        scoped_lines: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        abs_file = os.path.abspath(current_file)
        node_info: Dict[str, Any] = {
            "name": func_name,
            "file": abs_file,
            "external": False,
            "calls": [],
        }

        # Resolve where this function or symbol actually lives
        resolved = self._resolve_target_symbol(func_name, abs_file, lang)
        if not resolved:
            node_info["external"] = True
            return node_info

        target_file, target_func_name, func_def = resolved
        visit_key = (target_file, target_func_name)

        node_info["name"] = target_func_name
        node_info["file"] = target_file
        node_info["start_line"] = func_def.start_line
        node_info["end_line"] = func_def.end_line

        if visit_key in visited:
            node_info["cycle"] = True
            return node_info

        visited.add(visit_key)

        scope_entry = {
            "file": target_file,
            "function": target_func_name,
            "start_line": func_def.start_line,
            "end_line": func_def.end_line,
        }
        if scope_entry not in scoped_lines:
            scoped_lines.append(scope_entry)

        target_file_meta = self._get_file_metadata(target_file, lang)
        parser_instance: Optional[BaseLanguageParser] = target_file_meta.get("parser")

        if parser_instance and func_def.node:
            invocations = parser_instance.extract_calls(func_def.node, target_file_meta["source_bytes"])
            for call_raw, call_line in invocations:
                clean_name = call_raw.strip()
                if not clean_name:
                    continue

                # Check if this candidate symbol is part of the project
                target_cand = self._resolve_target_symbol(clean_name, target_file, lang)
                if target_cand:
                    child_branch = self._trace_branch(
                        func_name=clean_name,
                        current_file=target_file,
                        lang=lang,
                        visited=visited,
                        scoped_lines=scoped_lines,
                    )
                    child_branch["invoked_at_line"] = call_line
                    node_info["calls"].append(child_branch)
                else:
                    # External / library call
                    if "." in clean_name or clean_name[0].isupper() or "(" in clean_name:
                        node_info["calls"].append({
                            "name": clean_name,
                            "file": target_file,
                            "external": True,
                            "calls": [],
                            "invoked_at_line": call_line,
                        })

        return node_info

    def _discover_sub_routers(
        self,
        current_file: str,
        lang: str,
        visited_files: Optional[Set[str]] = None,
        base_prefix: str = "",
    ) -> List[Tuple[str, str]]:
        if visited_files is None:
            visited_files = set()

        abs_file = os.path.abspath(current_file)
        if abs_file in visited_files or not os.path.isfile(abs_file):
            return []
        visited_files.add(abs_file)

        parsed = self._load_and_parse_file(abs_file, lang)
        if not parsed:
            return []

        root_node, source_bytes, _ = parsed
        file_meta = self._get_file_metadata(abs_file, lang)
        imports = file_meta.get("imports", {})

        discovered: List[Tuple[str, str]] = []

        def strip_quotes(s: str) -> str:
            s = s.strip()
            if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")) or (s.startswith("`") and s.endswith("`")):
                return s[1:-1]
            return s

        def walk(node: Node):
            # Python: FastAPI include_router / Flask register_blueprint
            if lang == "python" and node.type == "call":
                fn_node = node.child_by_field_name("function")
                args_node = node.child_by_field_name("arguments")
                if fn_node and args_node:
                    fn_text = fn_node.text.decode("utf-8")
                    is_fastapi = fn_text.endswith("include_router")
                    is_flask = fn_text.endswith("register_blueprint")

                    if is_fastapi or is_flask:
                        prefix = ""
                        router_symbol = ""
                        for arg in args_node.children:
                            if arg.type == "keyword_argument":
                                key_node = arg.child_by_field_name("name")
                                val_node = arg.child_by_field_name("value")
                                if key_node and val_node:
                                    k_name = key_node.text.decode("utf-8")
                                    if k_name in ("prefix", "url_prefix"):
                                        prefix = strip_quotes(val_node.text.decode("utf-8"))
                                    elif k_name in ("router", "blueprint") and not router_symbol:
                                        router_symbol = val_node.text.decode("utf-8").split(".")[0]
                            elif arg.type in ("identifier", "attribute") and not router_symbol:
                                router_symbol = arg.text.decode("utf-8").split(".")[0]
                            elif arg.type == "string" and not prefix:
                                prefix = strip_quotes(arg.text.decode("utf-8"))

                        target_file = imports.get(router_symbol)
                        if target_file and os.path.isfile(target_file):
                            combined = f"{base_prefix.rstrip('/')}/{prefix.lstrip('/')}".strip("/")
                            combined_prefix = f"/{combined}" if combined else ""
                            discovered.append((target_file, combined_prefix))
                            # Recursively discover nested routers
                            nested = self._discover_sub_routers(
                                target_file, lang, visited_files=visited_files, base_prefix=combined_prefix
                            )
                            discovered.extend(nested)

            # JavaScript: Express app.use('/prefix', subRouter) or app.use(subRouter)
            elif lang == "javascript" and node.type == "call_expression":
                fn_node = node.child_by_field_name("function")
                args_node = node.child_by_field_name("arguments")
                if fn_node and args_node and fn_node.type == "member_expression":
                    prop = fn_node.child_by_field_name("property")
                    if prop and prop.text.decode("utf-8") == "use":
                        prefix = ""
                        router_sym = ""
                        for arg in args_node.children:
                            if arg.type in ("string", "template_string"):
                                prefix = strip_quotes(arg.text.decode("utf-8"))
                            elif arg.type == "identifier":
                                router_sym = arg.text.decode("utf-8")

                        if router_sym and router_sym in imports:
                            target_file = imports[router_sym]
                            if os.path.isfile(target_file):
                                combined = f"{base_prefix.rstrip('/')}/{prefix.lstrip('/')}".strip("/")
                                combined_prefix = f"/{combined}" if combined else ""
                                discovered.append((target_file, combined_prefix))
                                nested = self._discover_sub_routers(
                                    target_file, lang, visited_files=visited_files, base_prefix=combined_prefix
                                )
                                discovered.extend(nested)

            for child in node.children:
                walk(child)

        walk(root_node)
        return discovered

    def build(self, entrypoint: str) -> List[Dict[str, Any]]:
        abs_entry = os.path.abspath(entrypoint)
        if not os.path.isfile(abs_entry):
            raise FileNotFoundError(f"Entrypoint file not found: {abs_entry}")

        if not self.repo_root:
            self.repo_root = os.path.dirname(abs_entry)

        lang = self.detect_language(abs_entry)
        if not lang or lang not in self.parsers:
            print(f"[AST] Language '{lang}' not supported by Tree-sitter parsers. Falling back to native extractors.")
            return []

        # Build repository symbol phonebook index
        self._index_repo_symbols(lang)

        parsed = self._load_and_parse_file(abs_entry, lang)
        if not parsed:
            return []

        root_node, source_bytes, parser_instance = parsed
        routes = parser_instance.extract_routes(root_node, source_bytes, abs_entry)

        sub_routers = self._discover_sub_routers(abs_entry, lang)
        for sub_file, prefix in sub_routers:
            sub_parsed = self._load_and_parse_file(sub_file, lang)
            if sub_parsed:
                sub_root, sub_source, sub_parser = sub_parsed
                sub_routes = sub_parser.extract_routes(sub_root, sub_source, sub_file)
                for r in sub_routes:
                    if prefix:
                        clean_prefix = prefix.rstrip("/")
                        clean_path = r.path.lstrip("/")
                        r.path = f"{clean_prefix}/{clean_path}" if clean_path else clean_prefix
                    routes.append(r)

        result_routes: List[Dict[str, Any]] = []
        for route in routes:
            visited_set: Set[Tuple[str, str]] = set()
            route_scopes: List[Dict[str, Any]] = [
                {
                    "file": route.file,
                    "function": route.function,
                    "start_line": route.start_line,
                    "end_line": route.end_line,
                }
            ]

            # If the route has an explicit handler AST node, extract invocations from it directly
            if route.handler_node:
                call_tree = {
                    "name": route.function,
                    "file": route.file,
                    "external": False,
                    "calls": [],
                    "start_line": route.start_line,
                    "end_line": route.end_line,
                }
                visited_set.add((route.file, route.function))
                route_file_meta = self._get_file_metadata(route.file, lang)
                invocations = parser_instance.extract_calls(route.handler_node, route_file_meta["source_bytes"])
                for call_raw, call_line in invocations:
                    clean_name = call_raw.strip()
                    child_branch = self._trace_branch(
                        func_name=clean_name,
                        current_file=route.file,
                        lang=lang,
                        visited=visited_set,
                        scoped_lines=route_scopes,
                    )
                    child_branch["invoked_at_line"] = call_line
                    call_tree["calls"].append(child_branch)
            else:
                call_tree = self._trace_branch(
                    func_name=route.function,
                    current_file=route.file,
                    lang=lang,
                    visited=visited_set,
                    scoped_lines=route_scopes,
                )

            route.call_graph = call_tree
            route.scoped_lines = route_scopes
            result_routes.append(route.to_dict())

        return result_routes
