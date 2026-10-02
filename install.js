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
        path: "app",
        conda: {
          path: "conda_env",
          python: "python=3.14"
        },
        message: "conda install -y -c conda-forge nodejs=26.10.0",
      }
    },
    {
      method: "shell.run",
      params: {
        conda: "conda_env",
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
        conda: "conda_env",
        path: "app",
        message: [
          "npm install",
        ]
      }
    }
  ]
}
