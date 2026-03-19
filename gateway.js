module.exports = {
  daemon: true,
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "hermes gateway",
        on: [{
          event: "/(Gateway running with|Gateway will continue running|Gateway already running)/",
          done: true
        }]
      }
    }
  ]
}
