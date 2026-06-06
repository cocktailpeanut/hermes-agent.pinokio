const os = require("os")
const path = require("path")

const hermesHome = process.env.HERMES_HOME || path.join(os.homedir(), ".hermes")

module.exports = {
  run: [
    {
      when: "{{running('start.js')}}",
      method: "script.stop",
      params: {
        uri: "start.js"
      }
    },
    {
      when: "{{running('start-no-gateway.js')}}",
      method: "script.stop",
      params: {
        uri: "start-no-gateway.js"
      }
    },
    {
      when: "{{running('gateway.js')}}",
      method: "script.stop",
      params: {
        uri: "gateway.js"
      }
    },
    {
      when: "{{running('setup.js')}}",
      method: "script.stop",
      params: {
        uri: "setup.js"
      }
    },
    {
      when: "{{running('update.js')}}",
      method: "script.stop",
      params: {
        uri: "update.js"
      }
    },
    {
      when: "{{running('install.js')}}",
      method: "script.stop",
      params: {
        uri: "install.js"
      }
    },
    {
      when: "{{running('reset.js')}}",
      method: "script.stop",
      params: {
        uri: "reset.js"
      }
    },
    {
      method: "shell.run",
      params: {
        message: "node stop-gateway.cjs"
      }
    },
    {
      method: "fs.rm",
      params: {
        path: "app"
      }
    },
    {
      method: "fs.rm",
      params: {
        path: hermesHome
      }
    }
  ]
}
