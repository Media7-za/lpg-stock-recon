#!/usr/bin/env python3
"""Export a COF001 statement markdown to PDF with the shared exporter (export_to_pdf.py).

Cloud sessions ship Chromium at /opt/pw-browsers (not the build the Python Playwright package
expects), so this wrapper points the shared exporter at the installed binary.

Usage: python3 analysis/debtors/COF001/scripts/export_pdf.py <input.md> <output.pdf>
"""
import asyncio
import glob
import importlib.util
import os
import re
import sys
import tempfile

sys.dont_write_bytecode = True  # importing the shared exporter must not leave __pycache__ in the repo

HERE = os.path.dirname(os.path.abspath(__file__))
SHARED = os.path.abspath(os.path.join(HERE, "../../shared/scripts/export_to_pdf.py"))

spec = importlib.util.spec_from_file_location("export_to_pdf", SHARED)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

binaries = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
if binaries:
    chromium = mod.async_playwright  # keep a reference to the original factory
    real_launch = None

    class _Patched:
        def __init__(self, ctx):
            self._ctx = ctx

        def __getattr__(self, name):
            return getattr(self._ctx, name)

        @property
        def chromium(self):
            browser_type = self._ctx.chromium
            orig = browser_type.launch

            async def launch(*args, **kwargs):
                kwargs.setdefault("executable_path", binaries[-1])
                return await orig(*args, **kwargs)

            browser_type.launch = launch
            return browser_type

    class _CM:
        def __init__(self):
            self._cm = chromium()

        async def __aenter__(self):
            return _Patched(await self._cm.__aenter__())

        async def __aexit__(self, *exc):
            return await self._cm.__aexit__(*exc)

    mod.async_playwright = _CM

if len(sys.argv) < 3:
    print(__doc__)
    sys.exit(1)

src, out = sys.argv[1], sys.argv[2]
md = open(src, encoding="utf-8").read()

# The shared exporter reads its header box from "Opening Balance B/F:" and "Combined Closing Balance"
# labels. v5 uses different labels, so work on a temporary copy with those labels (the statement
# markdown itself is not changed) and without the raw HTML comment markers.
md = re.sub(
    r"\*\*Combined Opening B/F:\*\* (R-?[\d,.]+) \(ERP verified[^\n]*",
    r"**Opening Balance B/F:** \1 (combined, ERP verified)",
    md,
)
md = md.replace("**Reconstructed Balance (1A + 1B):**", "**Combined Closing Balance:**")
md = re.sub(r"^<!--.*?-->\s*$", "", md, flags=re.MULTILINE)
md = re.sub(r"\s*<!--.*?-->", "", md)

with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as tmp:
    tmp.write(md)
try:
    asyncio.run(mod.convert_md_to_pdf(tmp.name, out))
finally:
    os.unlink(tmp.name)

# The shared exporter also writes a byte-identical "_Customer" copy. It would carry the internal
# review notes, so it is removed here; make a customer version deliberately if one is needed.
customer = out[:-4] + "_Customer.pdf" if out.endswith(".pdf") else None
if customer and os.path.exists(customer):
    os.remove(customer)
