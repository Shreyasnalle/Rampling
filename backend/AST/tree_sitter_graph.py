"""
Tree-sitter AST & Call-Graph Engine (Main Orchestration File)

Contains the foundational BaseLanguageParser interface, route/function data structures,
and runs the multi-language call graph construction from entrypoint to execution branches.
"""

import os
import sys
import json
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

if __name__ == "__main__":
    sys.modules["tree_sitter_graph"] = sys.modules[__name__]

try:
    from tree_sitter import Parser, Node
    HAS_TREE_SITTER = True
except Exception:
    HAS_TREE_SITTER = False
    Parser = Any
    Node = Any

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
    """Abstract base parser blueprint for language-specific AST and route extraction."""

    @abstractmethod
    def get_parser(self) -> Parser:
        """Returns the initialized Tree-sitter Parser loaded with language grammar."""
        pass

    @abstractmethod
    def extract_routes(self, root_node: Node, source_bytes: bytes, file_path: str) -> List[RouteNode]:
        """Discovers all API endpoints declared in the file."""
        pass

    @abstractmethod
    def extract_function_defs(self, root_node: Node, source_bytes: bytes, file_path: str) -> Dict[str, FunctionDefInfo]:
        """Indexes all functions/methods declared in the file."""
        pass

    @abstractmethod
    def extract_calls(self, body_node: Node, source_bytes: bytes) -> List[Tuple[str, int]]:
        """Finds all function/method invocations made inside a function's body."""
        pass

    @abstractmethod
    def resolve_local_imports(self, root_node: Node, source_bytes: bytes, current_file: str, repo_root: str) -> Dict[str, str]:
        """Maps imported symbol names to their local file paths in the repo."""
        pass


# ---------------------------------------------------------------------------
# Import Language-Specific Parsers & Graph Builder
# ---------------------------------------------------------------------------
_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if _CURRENT_DIR not in sys.path:
    sys.path.insert(0, _CURRENT_DIR)

try:
    from .python_parser import PythonParser
    from .go_parser import GoParser
    from .javascript_parser import JavascriptParser
    from .graph_builder import CallGraphBuilder
except ImportError:
    from python_parser import PythonParser
    from go_parser import GoParser
    from javascript_parser import JavascriptParser
    from graph_builder import CallGraphBuilder


def build_call_graph(entrypoint: str, repo_root: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Main calling function:
    Takes a user entrypoint file (Python, Go, or JS) and builds the full call graph tree.
    """
    builder = CallGraphBuilder(repo_root=repo_root)
    return builder.build(entrypoint)


# ---------------------------------------------------------------------------
# Direct CLI Runner (Main file to run)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_entrypoint = sys.argv[1]
    else:
        # Default to demo app in parent folder
        current_dir = os.path.dirname(os.path.abspath(__file__))
        target_entrypoint = os.path.join(os.path.dirname(current_dir), "demo_pipeline_check.py")

    print(f"[*] Running Tree-sitter AST Graph Engine on: {target_entrypoint}")
    graph_results = build_call_graph(target_entrypoint)

    print(f"\n[+] Found {len(graph_results)} API route(s):")
    for r in graph_results:
        print(f"\n==========================================")
        print(f"ROUTE: {r['method']} {r['path']} -> {r['function']}()")
        print(f"File:  {r['file']} (Lines {r['start_line']}-{r['end_line']})")
        print(f"Call Graph Tree:")
        print(json.dumps(r["call_graph"], indent=2))
        print(f"Scoped Lines ({len(r['scoped_lines'])} range(s)):")
        for sc in r["scoped_lines"]:
            print(f"  - {os.path.basename(sc['file'])}:{sc['function']} (lines {sc['start_line']}-{sc['end_line']})")
