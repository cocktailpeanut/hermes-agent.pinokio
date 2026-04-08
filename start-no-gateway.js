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
        venv: "env",
        path: "app",
        env: {
          PYTHONUTF8: "1",
          PYTHONIOENCODING: "utf-8"
        },
        message: "python -c \"import sys, getpass; getpass.getpass=lambda p='', stream=None: input(p); sys.argv=['hermes']; from hermes_cli.main import main; main()\"",
        input: true
      }
    }
  ]
}
