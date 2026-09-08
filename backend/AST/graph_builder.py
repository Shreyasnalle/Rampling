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

    def detect_language(self, filepath: str) -> Optional[str]:
        ext = os.path.splitext(filepath)[1].lower()
        if ext in (".py", ".pyw"):
            return "python"
        elif ext == ".go":
            return "go"
        elif ext in (".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx"):
            return "javascript"
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
            print(f"[AST Warning] Could not parse file '{file_path}': {err}")
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
        visit_key = (abs_file, func_name)

        node_info: Dict[str, Any] = {
            "name": func_name,
            "file": abs_file,
            "external": False,
            "calls": [],
        }

        file_meta = self._get_file_metadata(abs_file, lang)
        funcs = file_meta["funcs"]
        imports = file_meta["imports"]
        parser_instance: Optional[BaseLanguageParser] = file_meta.get("parser")

        func_def: Optional[FunctionDefInfo] = funcs.get(func_name)

        if not func_def:
            prefix = func_name.split(".")[0] if "." in func_name else func_name
            target_file = imports.get(prefix)
            if target_file and os.path.isfile(target_file):
                target_func_name = func_name.split(".")[-1] if "." in func_name else func_name
                return self._trace_branch(target_func_name, target_file, lang, visited, scoped_lines)

            node_info["external"] = True
            return node_info

        if visit_key in visited:
            node_info["cycle"] = True
            node_info["start_line"] = func_def.start_line
            node_info["end_line"] = func_def.end_line
            return node_info

        visited.add(visit_key)

        node_info["start_line"] = func_def.start_line
        node_info["end_line"] = func_def.end_line

        scoped_lines.append({
            "file": abs_file,
            "function": func_name,
            "start_line": func_def.start_line,
            "end_line": func_def.end_line,
        })

        if parser_instance and func_def.node:
            invocations = parser_instance.extract_calls(func_def.node, file_meta["source_bytes"])
            for call_raw, call_line in invocations:
                clean_name = call_raw.strip()
                child_branch = self._trace_branch(
                    func_name=clean_name,
                    current_file=abs_file,
                    lang=lang,
                    visited=visited,
                    scoped_lines=scoped_lines,
                )
                child_branch["invoked_at_line"] = call_line
                node_info["calls"].append(child_branch)

        return node_info

    def _discover_included_routers(
        self, root_node: Node, source_bytes: bytes, current_file: str, lang: str
    ) -> List[Tuple[str, str]]:
        if lang != "python":
            return []

        discovered: List[Tuple[str, str]] = []
        file_meta = self._get_file_metadata(current_file, lang)
        imports = file_meta.get("imports", {})

        def walk(node: Node):
            if node.type == "call":
                fn_node = node.child_by_field_name("function")
                args_node = node.child_by_field_name("arguments")
                if fn_node and fn_node.text.decode("utf-8").endswith("include_router") and args_node:
                    prefix = ""
                    router_symbol = ""
                    for arg in args_node.children:
                        if arg.type == "keyword_argument":
                            key_node = arg.child_by_field_name("name")
                            val_node = arg.child_by_field_name("value")
                            if key_node and key_node.text.decode("utf-8") == "prefix" and val_node:
                                prefix = val_node.text.decode("utf-8").strip("\"'")
                        elif arg.type in ("identifier", "attribute") and not router_symbol:
                            router_symbol = arg.text.decode("utf-8").split(".")[0]

                    target_file = imports.get(router_symbol)
                    if target_file and os.path.isfile(target_file):
                        discovered.append((target_file, prefix))

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

        parsed = self._load_and_parse_file(abs_entry, lang)
        if not parsed:
            return []

        root_node, source_bytes, parser_instance = parsed
        routes = parser_instance.extract_routes(root_node, source_bytes, abs_entry)

        sub_routers = self._discover_included_routers(root_node, source_bytes, abs_entry, lang)
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
