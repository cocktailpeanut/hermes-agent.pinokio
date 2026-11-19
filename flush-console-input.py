"""Discard console input that is already waiting when an interactive CLI starts.

Pinokio writes the shell command into the Windows console, and the console input
buffer can still hold pending key events (notably a lone line feed) when the
interactive command starts. A plain cooked-mode read (``input()``) never sees
those events, but the moment a TUI flips the console into virtual-terminal input
mode (prompt_toolkit does this, which Hermes' setup wizard and chat use) the
buffered line feed is delivered as Return and confirms the first prompt with its
default answer.

Flushing the buffer before Hermes starts leaves the prompt untouched. On every
platform without a console input buffer this is a no-op.
"""

import sys


def flush_console_input():
    if sys.platform != "win32":
        return
    try:
        import ctypes

        kernel32 = ctypes.windll.kernel32
        handle = kernel32.GetStdHandle(-10)  # STD_INPUT_HANDLE
        if handle and handle != ctypes.c_void_p(-1).value:
            kernel32.FlushConsoleInputBuffer(handle)
    except Exception:
        pass


if __name__ == "__main__":
    flush_console_input()
