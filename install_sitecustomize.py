"""
Copies sitecustomize.py (the Rich Devanagari cell-width patch, see that
file for why) into app/env's site-packages, so it auto-loads on every
Python process started from that venv. Run via install.js / update.js
with cwd=app and the env venv active, e.g.:

    python ../install_sitecustomize.py
"""

import os
import shutil
import sysconfig

source = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sitecustomize.py")
destination = os.path.join(sysconfig.get_path("purelib"), "sitecustomize.py")
shutil.copy(source, destination)
print(f"Installed Devanagari cell-width patch to {destination}")
