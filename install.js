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
          "uv pip install -e \"{{platform === 'win32' ? '.[modal,daytona,messaging,cron,cli,dev,tts-premium,slack,pty,honcho,mcp,homeassistant,sms,acp,voice,dingtalk,feishu]' : '.[all]'}}\"",
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
