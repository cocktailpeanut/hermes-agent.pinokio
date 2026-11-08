module.exports = {
  run: [
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
}
