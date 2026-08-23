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
