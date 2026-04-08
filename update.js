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
          "uv pip install -e \"{{platform === 'win32' ? '.[modal,daytona,messaging,cron,cli,dev,tts-premium,slack,pty,honcho,mcp,homeassistant,sms,acp,voice,dingtalk,feishu]' : '.[all]'}}\"",
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
