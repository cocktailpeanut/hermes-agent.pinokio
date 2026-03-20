module.exports = {
  run: [
    {
      when: "{{running('gateway.js')}}",
      method: "script.stop",
      params: {
        uri: "gateway.js"
      }
    },
    {
      method: "shell.run",
      params: {
        message: "node gateway-preflight.cjs",
        on: [{
          event: "/gateway_action:(reuse|launch)/",
          kill: true
        }]
      }
    },
    {
      method: "local.set",
      params: {
        gateway_action: "{{input.event[1]}}"
      }
    },
    {
      when: "{{local.gateway_action !== 'reuse'}}",
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
          event: "/(Press Ctrl\\+C to stop|Gateway running with|Gateway will continue running|Gateway already running)/",
          done: true
        }]
      }
    },
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        env: {
          PYTHONUTF8: "1",
          PYTHONIOENCODING: "utf-8"
        },
        message: "hermes",
        input: true,
        onprompt: (shell) => {
          shell.kill("Done")
        }
      }
    },
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        env: {
          PYTHONUTF8: "1",
          PYTHONIOENCODING: "utf-8"
        },
        message: "hermes gateway stop"
      }
    }
  ]
}
