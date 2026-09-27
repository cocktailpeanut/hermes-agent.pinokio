module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        conda: "conda_env",
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
