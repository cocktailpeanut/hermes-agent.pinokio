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
        path: "app",
        message: [
          "npm install",
        ]
      }
    }
  ]
}
