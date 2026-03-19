# Hermes Agent for Pinokio

This project adds a 1-click Pinokio launcher for [Hermes Agent](https://github.com/NousResearch/hermes-agent), the terminal-first AI agent from Nous Research. The launcher installs Hermes into `app/`, uses Hermes' default home directory at `~/.hermes`, and exposes setup plus multiple launch modes directly from the Pinokio UI.

## What This Launcher Does

- Clones the Hermes Agent repository with its required submodules into `app/`
- Creates a Pinokio-managed Python 3.11 virtual environment at `app/env`
- Installs the main Hermes package plus the required `mini-swe-agent` backend
- Runs `npm install` in the app root for browser tooling support
- Uses Hermes' default config, auth, memory, and session storage under `~/.hermes`

## How To Use

1. Click `Install` to clone and install Hermes Agent.
2. Click `Setup` to run `hermes setup` and configure your provider, model, tools, and optional messaging integrations.
3. Click `Launch` to start Hermes Gateway and then open the Hermes interactive terminal inside the same Pinokio launcher session.
4. Click `Launch Without Gateway` to open the Hermes interactive terminal only.
5. If an older standalone `Gateway` helper is still running from a previous launcher version, you can stop it or click `Launch` to fold gateway ownership back into the main launch flow.
6. Use `Update` to pull the latest launcher and app changes.
7. Use `Reset` to remove the cloned app.

Hermes stores its state here:

- `app/`: cloned Hermes Agent source
- `~/.hermes/`: Hermes home with `.env`, `config.yaml`, sessions, logs, memories, and skills

## Notes

- Native Windows is not supported upstream by Hermes itself. This launcher now forces UTF-8 console I/O for `hermes` and `hermes gateway` to avoid the Windows Unicode crashes shown in the launcher logs, but upstream Windows edge cases may still remain.
- This launcher installs the main package, `mini-swe-agent`, and Node dependencies. The optional `tinker-atropos` RL backend is not installed by default.
- The launcher uses Pinokio `venv` / `venv_python` handling for the Python environment instead of manual shell activation logic.
- This launcher intentionally uses Hermes' default `~/.hermes` instead of overriding `HERMES_HOME`.
- `Launch` now uses a plain Pinokio multi-step flow in [start.js](./start.js): first `hermes gateway`, then `hermes` in a second shell under the same launcher tab.
- Because `start.js` is not a daemon script, closing the `Launch` session lets Pinokio tear down the gateway shell that was started for that same launch.
- If an older standalone `gateway.js` session is still running, both launch modes stop that helper first so Pinokio does not keep two launcher sessions active.
- `Reset` does not remove `~/.hermes`, since that is the user's global Hermes home.
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
