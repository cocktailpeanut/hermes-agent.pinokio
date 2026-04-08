module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: "python -c \"import sys, getpass; getpass.getpass=lambda p='', stream=None: input(p); sys.argv=['hermes', 'setup']; from hermes_cli.main import main; main()\"",
        input: true,
        onprompt: (shell) => {
          shell.kill("Done")
        }
      }
    }
  ]
}
