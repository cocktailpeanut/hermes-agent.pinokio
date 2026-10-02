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
        ]
      }
    },
    {
      when: "{{!exists('app/conda_env')}}",
      method: "shell.run",
      params: {
        conda: {
          path: "conda_env",
          python: "python=3.14"
        },
        path: "app",
        message: "conda install -y -c conda-forge nodejs=26.10.0",
      }
    },
    {
      
      when: "{{exists('app/conda_env')}}",
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
      // Hindi output in the Hermes TUI. Reinstalled here since update.js
      // wipes and recreates app/env above.
      when: "{{exists('app/.git')}}",
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
      when: "{{exists('app/.git') && exists('app/package-lock.json')}}",
      method: "shell.run",
      params: {
        conda: "conda_env",
        path: "app",
        message: [
          "npm ci",
        ]
      }
    },
    {
      when: "{{exists('app/.git') && !exists('app/package-lock.json')}}",
      method: "shell.run",
      params: {
        conda: "conda_env",
        path: "app",
        message: "npm install",
      }
    }
  ]
}
