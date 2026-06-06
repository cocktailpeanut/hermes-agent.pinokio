const os = require("os")
const path = require("path")

module.exports = {
  version: "5.0",
  title: "Hermes Agent",
  description: "A self-improving AI agent with terminal, memory, skills, and messaging workflows.",
  icon: "icon.png",
  plugins: [
    "plugins/no-gateway/pinokio.js"
  ],
  menu: async (kernel, info) => {
    let hermesHome = path.join(os.homedir(), ".hermes")
    let hasHermesHome = info.exists(hermesHome)
    let installed = info.exists("app/env")
    let configured = info.exists(path.join(hermesHome, "config.yaml")) ||
      info.exists(path.join(hermesHome, "auth.json")) ||
      info.exists(path.join(hermesHome, "state.db"))
    let uninstallItem = {
      icon: "fa-solid fa-trash",
      text: "Uninstall",
      href: "uninstall.js",
      confirm: "Uninstall Hermes Agent? This removes app/ and ~/.hermes, including config, auth, sessions, logs, memories, and skills."
    }
    let resetItem = {
      icon: "fa-regular fa-circle-xmark",
      text: "Reset",
      href: "reset.js",
      confirm: "Reset Hermes Agent? This stops any Hermes gateway and removes app/, but keeps ~/.hermes."
    }
    let running = {
      install: info.running("install.js"),
      start: info.running("start.js"),
      startNoGateway: info.running("start-no-gateway.js"),
      gateway: info.running("gateway.js"),
      setup: info.running("setup.js"),
      update: info.running("update.js"),
      reset: info.running("reset.js"),
      uninstall: info.running("uninstall.js"),
    }
    if (running.uninstall) {
      return [{
        default: true,
        icon: "fa-solid fa-trash",
        text: "Uninstalling",
        href: "uninstall.js",
      }]
    } else if (running.install) {
      return [{
        default: true,
        icon: "fa-solid fa-plug",
        text: "Installing",
        href: "install.js",
      }]
    } else if (installed) {
      if (running.start) {
        return [{
          default: true,
          icon: "fa-solid fa-rocket",
          text: "Launch",
          href: "start.js",
        }]
      } else if (running.startNoGateway) {
        return [{
          default: true,
          icon: "fa-solid fa-terminal",
          text: "Launch Without Gateway",
          href: "start-no-gateway.js",
        }]
      } else if (running.gateway) {
        return [{
          default: true,
          icon: "fa-solid fa-share-nodes",
          text: "Gateway",
          href: "gateway.js",
        }, {
          icon: "fa-solid fa-rocket",
          text: "Launch",
          href: "start.js",
        }, {
          icon: "fa-solid fa-terminal",
          text: "Launch Without Gateway",
          href: "start-no-gateway.js",
        }, {
          icon: "fa-solid fa-sliders",
          text: "Setup",
          href: "setup.js",
        }, {
          icon: "fa-solid fa-rotate",
          text: "Update",
          href: "update.js",
        }, {
          icon: "fa-solid fa-plug",
          text: "Install",
          href: "install.js",
        }, resetItem, uninstallItem]
      } else if (running.setup) {
        return [{
          default: true,
          icon: "fa-solid fa-sliders",
          text: "Configuring",
          href: "setup.js",
        }]
      } else if (running.update) {
        return [{
          default: true,
          icon: "fa-solid fa-terminal",
          text: "Updating",
          href: "update.js",
        }]
      } else if (running.reset) {
        return [{
          default: true,
          icon: "fa-solid fa-terminal",
          text: "Resetting",
          href: "reset.js",
        }]
      } else {
        return [{
          default: !configured,
          icon: "fa-solid fa-sliders",
          text: "Setup",
          href: "setup.js",
        }, {
          icon: "fa-solid fa-rocket",
          text: "Launch",
          href: "start.js",
        }, {
          icon: "fa-solid fa-terminal",
          text: "Launch Without Gateway",
          href: "start-no-gateway.js",
        }, {
          icon: "fa-solid fa-rotate",
          text: "Update",
          href: "update.js",
        }, {
          icon: "fa-solid fa-plug",
          text: "Install",
          href: "install.js",
        }, resetItem, uninstallItem]
      }
    } else {
      let items = [{
        default: true,
        icon: "fa-solid fa-plug",
        text: "Install",
        href: "install.js",
      }]
      if (hasHermesHome) {
        items.push(uninstallItem)
      }
      return items
    }
  }
}
