module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "hermes",
        input: true
      }
    }
  ]
}
