"""
Auto-loaded by Python's site machinery for every process in app/env (installed
into env's site-packages by install.js / update.js as sitecustomize.py).

Rich's cell-width table (rich._unicode_data) marks Devanagari combining marks
(matras, virama, U+0900-U+097F) as zero-width, following the Unicode "Mn"/"Mc"
spec. Real terminals don't shape/reorder these marks -- they render every
codepoint as one column, combining mark or not. That mismatch makes Rich
under-count how many columns a Hindi line occupies, so it doesn't clear
enough of the terminal row on redraw and old text ghosts through underneath
new output. Same root cause as the still-open, upstream Thai bug report:
https://github.com/Textualize/rich/issues/3957

This patches the shared CellTable.widths list in place (rather than
replacing rich.cells.get_character_cell_size itself) because several Rich
modules (segment.py, text.py, console.py, panel.py, ...) do
`from rich.cells import get_character_cell_size`, binding their own
reference -- a function-level monkeypatch would miss those. Every caller
reads the same underlying table object, so fixing the data fixes them all.

Only touches U+0900-U+097F (Devanagari); every other script is untouched.
"""

_DEVANAGARI_START = 0x0900
_DEVANAGARI_END = 0x097F


def _patch_devanagari_widths(table):
    widths = table.widths
    new_widths = []
    changed = False

    for start, end, width in widths:
        if width != 0 or end < _DEVANAGARI_START or start > _DEVANAGARI_END:
            new_widths.append((start, end, width))
            continue

        changed = True
        if start < _DEVANAGARI_START:
            new_widths.append((start, _DEVANAGARI_START - 1, width))
        new_widths.append((max(start, _DEVANAGARI_START), min(end, _DEVANAGARI_END), 1))
        if end > _DEVANAGARI_END:
            new_widths.append((_DEVANAGARI_END + 1, end, width))

    if changed:
        new_widths.sort()
        widths[:] = new_widths  # mutate the shared list in place


try:
    from rich._unicode_data import load as _load_cell_table

    _patch_devanagari_widths(_load_cell_table("auto"))
except Exception:
    # Never let this best-effort patch break interpreter startup.
    pass


# ---------------------------------------------------------------------------
# The interactive `hermes` chat is driven through prompt_toolkit's
# patch_stdout.StdoutProxy (see agent/display.py), which is a *separate*
# rendering pipeline from Rich with its own width calculation: prompt_toolkit
# sizes every string via prompt_toolkit.utils.get_cwidth(), which is backed
# by the `wcwidth` PyPI package -- not rich._unicode_data at all. wcwidth has
# the identical bug (confirmed): U+093F, U+0940, U+0902, etc. all measure 0.
# Patching Rich alone does nothing for this path, which is why the live chat
# still ghosted after the first fix.
#
# get_cwidth()/wcwidth() can't be monkeypatched by function replacement
# either -- both prompt_toolkit.formatted_text.utils and wcwidth's own
# internals import the underlying names directly into their own module
# namespaces, so a replaced function object wouldn't be seen by callers that
# already bound the original. Instead, pre-seed prompt_toolkit's shared
# `_CHAR_SIZES_CACHE` dict (get_cwidth's single-character cache) with the
# corrected width for every Devanagari codepoint that wcwidth gets wrong.
# Since __missing__ only fires for keys not already present, every later
# get_cwidth() call -- from any module, however it imported the function --
# reads the same dict object and gets the corrected value directly.
try:
    from wcwidth import wcwidth as _wcwidth
    import prompt_toolkit.utils as _pt_utils

    for _codepoint in range(_DEVANAGARI_START, _DEVANAGARI_END + 1):
        _char = chr(_codepoint)
        if _char not in _pt_utils._CHAR_SIZES_CACHE and max(0, _wcwidth(_char)) == 0:
            _pt_utils._CHAR_SIZES_CACHE[_char] = 1
except Exception:
    pass
