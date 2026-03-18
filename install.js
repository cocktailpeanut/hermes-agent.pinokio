module.exports = {
  run: [
    {
      when: "{{!exists('app/.git')}}",
      method: "shell.run",
      params: {
        message: [
          "git clone --recurse-submodules https://github.com/NousResearch/hermes-agent.git app",
        ]
      }
    },
    {
      method: "shell.run",
      params: {
        path: "app",
        message: [
          "git submodule update --init --recursive",
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
          "uv pip install -e ./mini-swe-agent",
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
