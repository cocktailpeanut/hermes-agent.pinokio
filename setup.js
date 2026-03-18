module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "hermes setup",
        input: true,
        onprompt: (shell) => {
          shell.kill("Done")
        }
      }
    }
  ]
}
