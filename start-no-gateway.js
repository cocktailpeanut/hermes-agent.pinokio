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
        conda: "conda_env",
        path: "app",
        env: {
          PYTHONUTF8: "1",
          PYTHONIOENCODING: "utf-8"
        },
        message: "python ../flush-console-input.py && hermes",
        input: true
      }
    }
  ]
}
