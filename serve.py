#!/usr/bin/env python3
"""Serve this folder for local preview:  python3 serve.py [port]

Why not `python3 -m http.server`? That CLI evaluates os.getcwd() while building
its argument parser, before any argument is read. If the launching process has
an inaccessible working directory — which happens under some sandboxes — it
dies with `PermissionError: [Errno 1] Operation not permitted` and no
`--directory` flag can prevent it. This script pins the document root to its
own location instead, so it never depends on the inherited cwd.
"""
import functools
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

# __file__ is absolute when launched by absolute path; fall back to the
# literal dirname rather than abspath() so we never touch getcwd().
ROOT = os.path.dirname(__file__) or "."
if not os.path.isabs(ROOT):
    ROOT = os.path.abspath(ROOT)

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123


class NoCacheHandler(SimpleHTTPRequestHandler):
    """Never let the browser cache during development.

    Without this, an edit to a partial or to data/*.json can sit invisible behind
    a cached copy, and you end up verifying the previous version of the page.
    """

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


os.chdir(ROOT)
handler = functools.partial(NoCacheHandler, directory=ROOT)
server = HTTPServer(("127.0.0.1", PORT), handler)
print(f"serving {ROOT} at http://127.0.0.1:{PORT}", flush=True)
server.serve_forever()
