const fs = require("fs")
const os = require("os")
const path = require("path")
const start = require("./start.js")

// Same detection as pinokio.js: Hermes is configured once a config.yaml exists
// in %LOCALAPPDATA%\hermes (Windows) or ~/.hermes.
const configured = (() => {
  let homes = []
  if (process.env.LOCALAPPDATA) {
    homes.push(path.join(process.env.LOCALAPPDATA, "hermes"))
  }
  homes.push(path.join(os.homedir(), ".hermes"))
  return homes.some((home) => {
    try {
      return fs.existsSync(path.join(home, "config.yaml"))
    } catch (e) {
      return false
    }
  })
})()

let wizard = [
  {
    method: "shell.run",
    params: {
      conda: "conda_env",
      path: "app",
      message: "python ../flush-console-input.py && hermes setup",
      input: true,
      onprompt: (shell) => {
        shell.kill("Done")
      }
    }
  },
  {
    method: "shell.run",
    params: {
      conda: "conda_env",
      path: "app",
      env: {
        PYTHONUTF8: "1",
        PYTHONIOENCODING: "utf-8"
      },
      message: "python ../flush-console-input.py && hermes model",
      input: true,
      onprompt: (shell) => {
        shell.kill("Done")
      }
    }
  }
]

let launch = start.run

// Pinokio remembers the last selected tab and runs it again when the app is
// opened, so this script has to be safe to re-run: once Hermes is configured it
// never shows the wizard again, it simply starts Hermes.
module.exports = {
  run: configured
    ? [
        {
          method: "log",
          params: {
            raw: "\r\nHermes is already configured - starting Hermes Agent...\r\n"
          }
        },
        ...launch
      ]
    : [...wizard, ...launch]
}
