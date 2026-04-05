module.exports = {
  title: "Hermes Agent",
  description: "Start Hermes Agent in any folder",
  icon: "../../icon.png",
  launch_type: "terminal",
  run: [
    {
      method: "shell.run",
      params: {
        venv: "{{path.resolve(dirname, '../../app/env')}}",
        path: "{{args.cwd}}",
        env: {
          PYTHONUTF8: "1",
          PYTHONIOENCODING: "utf-8"
        },
        message: "hermes",
        input: true
      }
    }
  ]
}
