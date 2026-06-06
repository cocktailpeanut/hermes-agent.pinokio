# Hermes Agent for Pinokio

This project adds a 1-click Pinokio launcher for [Hermes Agent](https://github.com/NousResearch/hermes-agent), the terminal-first AI agent from Nous Research. The launcher installs Hermes into `app/`, uses Hermes' default home directory at `~/.hermes`, and exposes setup plus multiple launch modes directly from the Pinokio UI.

## What This Launcher Does

- Clones the Hermes Agent repository into `app/`
- Creates a Pinokio-managed Python 3.11 virtual environment at `app/env`
- Installs the main Hermes package from the repository root with Hermes' current `.[all]` extras set
- Runs `npm install` in the app root for browser tooling support
- Uses Hermes' default config, auth, memory, and session storage under `~/.hermes`

## How To Use

1. Click `Install` to clone and install Hermes Agent.
2. Click `Setup` to run `hermes setup` and configure your provider, model, tools, and optional messaging integrations.
3. Click `Launch` to start Hermes Gateway and then open the Hermes interactive terminal inside the same Pinokio launcher session.
4. Click `Launch Without Gateway` to open the Hermes interactive terminal only.
5. If an older standalone `Gateway` helper is still running from a previous launcher version, you can stop it or click `Launch` to fold gateway ownership back into the main launch flow.
6. Use `Update` to pull the latest launcher and app changes, then rebuild Python and Node dependencies from a clean state.
7. Use `Reset` to stop Hermes Gateway and remove the cloned app while keeping your Hermes configuration and data.
8. Use `Uninstall` to stop Hermes Gateway and remove both the cloned app and Hermes' home directory.

Hermes stores its state here:

- `app/`: cloned Hermes Agent source
- `~/.hermes/`: Hermes home with `.env`, `config.yaml`, sessions, logs, memories, and skills

## Notes

- Native Windows is not supported upstream by Hermes itself. This launcher now forces UTF-8 console I/O for `hermes` and `hermes gateway` to avoid the Windows Unicode crashes shown in the launcher logs, but upstream Windows edge cases may still remain.
- The launcher uses Pinokio `venv` / `venv_python` handling for the Python environment instead of manual shell activation logic.
- This launcher intentionally uses Hermes' default `~/.hermes` instead of overriding `HERMES_HOME`.
- `Launch` now uses a plain Pinokio multi-step flow in [start.js](./start.js): first `hermes gateway`, then `hermes` in a second shell under the same launcher tab.
- When the `Launch` terminal returns to the shell prompt, `start.js` now runs `hermes gateway stop` as a cleanup step so the gateway is always shut down at the end of that launch flow.
- If an older standalone `gateway.js` session is still running, both launch modes stop that helper first so Pinokio does not keep two launcher sessions active.
- `Reset` stops any running Hermes Gateway before removing `app/`, but it does not remove `~/.hermes`, since that is the user's global Hermes home.
- `Uninstall` removes `~/.hermes`, including provider config, auth, sessions, logs, memories, and skills. It does not remove shared package-manager caches such as uv, pip, npm, or Pinokio's own launcher metadata.
- I avoided Unix-only setup snippets in the launcher scripts; the remaining platform limitations come from Hermes upstream, not from the launcher shell glue.

## Programmatic Usage

Hermes is primarily a CLI and stdio-based tool, so the simplest automation path is to call the `hermes` executable inside `app/env` and let Hermes use its default `~/.hermes`.

### JavaScript

```javascript
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

const { stdout } = await run(
  "/path/to/launcher/app/env/bin/hermes",
  ["chat", "-q", "Summarize the current repository."],
  { cwd: "/path/to/launcher/app" }
);

console.log(stdout);
```

### Python

```python
import subprocess

result = subprocess.run(
    ["/path/to/launcher/app/env/bin/hermes", "chat", "-q", "List the enabled tools."],
    cwd="/path/to/launcher/app",
    text=True,
    capture_output=True,
    check=True,
)

print(result.stdout)
```

### Curl

Hermes does not expose an HTTP API by default, so there is no direct `curl` interface for the main chat workflow. Use the CLI examples above, or launch Hermes as an ACP server (`hermes acp`) for editor integrations over stdio.
