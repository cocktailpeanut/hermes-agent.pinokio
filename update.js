module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        message: "git pull"
      }
    },
    {
      when: "{{exists('app/.git')}}",
      method: "shell.run",
      params: {
        path: "app",
        message: [
          "git pull",
          "git submodule update --init --recursive",
        ]
      }
    },
    {
      when: "{{exists('app/.git')}}",
      method: "shell.run",
      params: {
        venv: "env",
        venv_python: "3.11",
        path: "app",
        message: [
          "uv pip install -e \".[all]\"",
          "uv pip install -e ./mini-swe-agent",
        ]
      }
    },
    {
      when: "{{exists('app/.git')}}",
      method: "shell.run",
      params: {
        path: "app",
        message: [
          "npm install",
        ]
      }
    }
  ]
}
