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
      // app/package.json pins npm to "<11.10.0 || >=11.17.0" (engine-strict) to avoid
      // a broken npm release range. Upgrade npm first so the install below doesn't
      // hit EBADENGINE on whatever npm ships with the machine's node install.
      method: "shell.run",
      params: {
        message: [
          "npm install -g npm@latest",
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
