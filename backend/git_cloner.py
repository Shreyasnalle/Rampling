import os
import shutil
import tempfile
import subprocess
import uuid
from typing import Optional, Tuple


def clone_repo(
    repo_url: str,
    backend_folder: str,
    target_dir: Optional[str] = None,
    branch: Optional[str] = None,
    depth: int = 1,
) -> str:
    if not repo_url or not isinstance(repo_url, str):
        raise ValueError("A valid repository URL must be provided.")

    repo_url = repo_url.strip()
    valid_prefixes = ("https://", "http://", "git@", "file://", "ssh://")
    if not (repo_url.startswith(valid_prefixes) or os.path.isdir(repo_url)):
        raise ValueError(f"Invalid repository URL format: '{repo_url}'")

    if not backend_folder or not isinstance(backend_folder, str) or not backend_folder.strip():
        raise ValueError("A valid backend folder name must be specified.")

    clean_folder = backend_folder.strip("/").strip("\\").strip()

    if not target_dir:
        scan_id = str(uuid.uuid4())[:8]
        target_dir = os.path.join(tempfile.gettempdir(), f"rampling_repo_{scan_id}")

    os.makedirs(target_dir, exist_ok=True)

    cmd = ["git", "clone"]
    if depth > 0:
        cmd.extend(["--depth", str(depth)])
    if branch:
        cmd.extend(["--branch", branch])

    cmd.extend(["--filter=blob:none", "--sparse", repo_url, target_dir])

    try:
        subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )

        subprocess.run(
            ["git", "-C", target_dir, "sparse-checkout", "set", clean_folder],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )

        expected_backend_path = os.path.join(target_dir, clean_folder)
        if not os.path.isdir(expected_backend_path):
            shutil.rmtree(target_dir, ignore_errors=True)
            raise FileNotFoundError(
                f"Specified backend folder '{clean_folder}' does not exist in repository '{repo_url}'."
            )

        return os.path.abspath(target_dir)

    except subprocess.CalledProcessError as e:
        shutil.rmtree(target_dir, ignore_errors=True)
        error_msg = e.stderr.strip() or e.stdout.strip()
        raise RuntimeError(f"Failed to clone repository '{repo_url}': {error_msg}") from e


def cleanup_repo(target_dir: str) -> None:
    if target_dir and os.path.isdir(target_dir):
        shutil.rmtree(target_dir, ignore_errors=True)


def resolve_paths(
    cloned_repo_path: str,
    backend_folder: str,
    entrypoint_file: str = "main.py",
) -> Tuple[str, str]:
    if not backend_folder or not isinstance(backend_folder, str) or not backend_folder.strip():
        raise ValueError("A valid backend folder name must be provided.")

    clean_folder = backend_folder.strip("/").strip("\\").strip()
    backend_path = os.path.join(cloned_repo_path, clean_folder)

    if not os.path.isdir(backend_path):
        raise FileNotFoundError(f"Backend directory not found: '{backend_path}'")

    entrypoint_path = os.path.join(backend_path, entrypoint_file)
    if not os.path.isfile(entrypoint_path):
        raise FileNotFoundError(f"Entrypoint file '{entrypoint_file}' not found in '{backend_path}'")

    return os.path.abspath(backend_path), os.path.abspath(entrypoint_path)
