module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        env: {
          PYTHONUTF8: "1",
          PYTHONIOENCODING: "utf-8"
        },
        message: "hermes setup",
        input: true,
        onprompt: (shell) => {
          shell.kill("Done")
        }
      }
    }
  ]
}
