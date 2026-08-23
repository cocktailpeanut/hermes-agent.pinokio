module.exports = {
  daemon: true,
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
        message: "hermes gateway",
        on: [{
          event: "/(Gateway running with|Gateway will continue running|Gateway already running)/",
          done: true
        }]
      }
    }
  ]
}
