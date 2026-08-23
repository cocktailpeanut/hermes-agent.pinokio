module.exports = {
  run: [
    {
      when: "{{!exists('app/.git')}}",
      method: "shell.run",
      params: {
        message: [
          "git clone https://github.com/NousResearch/hermes-agent.git app",
        ]
      }
    },
    {
      method: "shell.run",
      params: {
        venv: "env",
        venv_python: "3.11",
        path: "app",
        message: [
          "uv pip install -e \".[all]\"",
        ]
      }
    },
    {
      // see sitecustomize.py: works around an open upstream Rich bug
      // (Devanagari combining marks measured as zero-width) that garbles
      // Hindi output in the Hermes TUI
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "python ../install_sitecustomize.py",
        ]
      }
    },
    {
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
