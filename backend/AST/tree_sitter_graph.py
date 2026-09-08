"""
Tree-sitter Multi-Language AST Route Extractor & Call-Graph Builder
Supports Python (FastAPI/Flask), Go (Gin/Chi/net/http), and JavaScript (Express).
Traces route handlers down to internal functions, services, and local dependencies.
"""

import os
import re
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple

# Try importing Tree-sitter modules
try:
    from tree_sitter import Language, Parser, Node
    import tree_sitter_python
    import tree_sitter_go
    import tree_sitter_javascript

    HAS_TREE_SITTER = True
    PY_LANG = Language(tree_sitter_python.language())
    GO_LANG = Language(tree_sitter_go.language())
    JS_LANG = Language(tree_sitter_javascript.language())
except Exception as e:
    HAS_TREE_SITTER = False
    PY_LANG = None
    GO_LANG = None
    JS_LANG = None


HTTP_METHODS = {"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"}


@dataclass
class FunctionDefInfo:
    name: str
    file: str
    start_line: int
    end_line: int
    node: Any = None
    calls: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class RouteNode:
    method: str
    path: str
    function: str
    file: str
    start_line: int
    end_line: int
    call_graph: Dict[str, Any] = field(default_factory=dict)
    scoped_lines: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "method": self.method,
            "path": self.path,
            "function": self.function,
            "file": self.file,
            "start_line": self.start_line,
            "end_line": self.end_line,
            "call_graph": self.call_graph,
            "scoped_lines": self.scoped_lines,
        }


class BaseLanguageParser(ABC):
    """Abstract base parser for language-specific AST and route extraction."""

    @abstractmethod
    def get_parser(self) -> Parser:
        pass

    @abstractmethod
    def extract_routes(self, root_node: Node, source_bytes: bytes, file_path: str) -> List[RouteNode]:
        pass

    @abstractmethod
    def extract_function_defs(self, root_node: Node, source_bytes: bytes, file_path: str) -> Dict[str, FunctionDefInfo]:
        pass

    @abstractmethod
    def extract_calls(self, body_node: Node, source_bytes: bytes) -> List[Tuple[str, int]]:
        pass

    @abstractmethod
    def resolve_local_imports(self, root_node: Node, source_bytes: bytes, current_file: str, repo_root: str) -> Dict[str, str]:
        """Maps imported symbol names -> target local file paths."""
        pass


class PythonParser(BaseLanguageParser):
    def __init__(self):
        if not HAS_TREE_SITTER or not PY_LANG:
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


class GoParser(BaseLanguageParser):
    def __init__(self):
        if not HAS_TREE_SITTER or not GO_LANG:
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


class JavascriptParser(BaseLanguageParser):
    def __init__(self):
        if not HAS_TREE_SITTER or not JS_LANG:
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
                        if method_name in HTTP_METHODS or method_name == "USE":
                            method = "ALL" if method_name == "USE" else method_name
                            path = "/"
                            handler_name = "<anonymous>"

                            for arg in args_node.children:
                                if arg.type in ("string", "template_string"):
                                    path = self._strip_quotes(arg.text.decode("utf-8"))
                                elif arg.type == "identifier":
                                    handler_name = arg.text.decode("utf-8")
                                elif arg.type in ("arrow_function", "function_expression"):
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
            if node.type in ("function_declaration", "function"):
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
            elif node.type == "variable_declarator":
                name_node = node.child_by_field_name("name")
                value_node = node.child_by_field_name("value")
                if name_node and value_node and value_node.type in ("arrow_function", "function_expression"):
                    fn_name = name_node.text.decode("utf-8")
                    start_line = node.start_point[0] + 1
                    end_line = node.end_point[0] + 1
                    body_node = value_node.child_by_field_name("body")
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
        current_dir = os.path.dirname(os.path.abspath(current_file))

        def find_js_file(import_rel: str) -> Optional[str]:
            candidates = [
                os.path.join(current_dir, import_rel),
                os.path.join(current_dir, import_rel + ".js"),
                os.path.join(current_dir, import_rel + ".ts"),
                os.path.join(current_dir, import_rel, "index.js"),
                os.path.join(current_dir, import_rel, "index.ts"),
            ]
            for c in candidates:
                if os.path.isfile(c):
                    return os.path.abspath(c)
            return None

        def walk(node: Node):
            if node.type == "variable_declarator":
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
                            if arg.type == "string":
                                raw_path = self._strip_quotes(arg.text.decode("utf-8"))
                                resolved = find_js_file(raw_path)
                                if resolved:
                                    imports[name_node.text.decode("utf-8")] = resolved
            for child in node.children:
                walk(child)

        walk(root_node)
        return imports


class CallGraphBuilder:
    """Orchestrates multi-language route extraction and recursive call-graph construction."""

    def __init__(self, repo_root: Optional[str] = None):
        self.repo_root = os.path.abspath(repo_root) if repo_root else None
        self.parsers: Dict[str, BaseLanguageParser] = {}
        if HAS_TREE_SITTER:
            if PY_LANG:
                self.parsers["python"] = PythonParser()
            if GO_LANG:
                self.parsers["go"] = GoParser()
            if JS_LANG:
                self.parsers["javascript"] = JavascriptParser()

        # Cache of parsed file info: filepath -> { 'funcs': dict, 'imports': dict }
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
        """Recursively builds the call-graph tree for a function."""
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

        # Check if this is a known local function in the current file
        func_def: Optional[FunctionDefInfo] = funcs.get(func_name)

        if not func_def:
            # Check if function came from an imported local file
            prefix = func_name.split(".")[0] if "." in func_name else func_name
            target_file = imports.get(prefix)
            if target_file and os.path.isfile(target_file):
                target_func_name = func_name.split(".")[-1] if "." in func_name else func_name
                return self._trace_branch(target_func_name, target_file, lang, visited, scoped_lines)

            # Not defined locally -> external / stdlib leaf call
            node_info["external"] = True
            return node_info

        # It is a local function definition: apply cycle detection
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
        """
        Discovers FastAPI `app.include_router(router, prefix="/...")`
        Returns a list of (target_file_path, route_prefix).
        """
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
        """Main entrypoint: parses the entrypoint file and returns route trees with full call graphs."""
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

        # Check for multi-file sub-routers (e.g. app.include_router)
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

        # Build execution call graphs for each route
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


def build_call_graph(entrypoint: str, repo_root: Optional[str] = None) -> List[Dict[str, Any]]:
    """Public helper function to build call graph from an entrypoint file."""
    builder = CallGraphBuilder(repo_root=repo_root)
    return builder.build(entrypoint)
