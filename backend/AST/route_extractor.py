import ast
import os
from typing import Any, List, Optional
from .tree_sitter_graph import build_call_graph, HAS_TREE_SITTER

def extract_routes(filepath: str, repo_root: Optional[str] = None) -> List[dict]:
    if HAS_TREE_SITTER:
        try:
            routes = build_call_graph(filepath, repo_root=repo_root)
            if routes:
                print(f"[AST/Tree-sitter] Found {len(routes)} route(s) in '{filepath}'")
                return routes
        except Exception as e:
            print(f"[AST Warning] Tree-sitter extraction failed: {e}. Trying fallback.")

    print(f"[AST] No routes extracted from '{filepath}'")
    return []