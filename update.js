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
      when: "{{exists('app/env')}}",
      method: "fs.rm",
      params: {
        path: "app/env"
      }
    },
    {
      when: "{{exists('app/node_modules')}}",
      method: "fs.rm",
      params: {
        path: "app/node_modules"
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
        ]
      }
    },
    {
      when: "{{exists('app/.git') && exists('app/package-lock.json')}}",
      method: "shell.run",
      params: {
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
        path: "app",
        message: [
          "npm install",
        ]
      }
    }
  ]
}
