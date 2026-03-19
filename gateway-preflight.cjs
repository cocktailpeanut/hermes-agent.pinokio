const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function getPidFile() {
  const hermesHome = process.env.HERMES_HOME || path.join(os.homedir(), ".hermes");
  return path.join(hermesHome, "gateway.pid");
}

function readPidInfo(pidFile) {
  if (!fs.existsSync(pidFile)) {
    return null;
  }

  const raw = fs.readFileSync(pidFile, "utf8").trim();
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    const pid = Number.parseInt(parsed.pid, 10);
    if (Number.isInteger(pid) && pid > 0) {
      return {
        pid,
        argv: Array.isArray(parsed.argv) ? parsed.argv : []
      };
    }
  } catch (_error) {
  }

  const pid = Number.parseInt(raw, 10);
  if (Number.isInteger(pid) && pid > 0) {
    return {
      pid,
      argv: []
    };
  }

  return null;
}

function getProcessName(pid) {
  try {
    if (process.platform === "win32") {
      const result = spawnSync("tasklist", ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"], {
        encoding: "utf8"
      });
      if (result.status !== 0) {
        return null;
      }
      const line = result.stdout.trim();
      if (!line || /^INFO:/i.test(line)) {
        return null;
      }
      const match = line.match(/^"([^"]+)"/);
      return match ? match[1] : line.split(",")[0];
    }

    const result = spawnSync("ps", ["-p", String(pid), "-o", "comm="], {
      encoding: "utf8"
    });
    if (result.status !== 0) {
      return null;
    }
    return result.stdout.trim() || null;
  } catch (_error) {
    return null;
  }
}

function looksLikeGateway(processName, argv) {
  const normalizedName = (processName || "").toLowerCase();
  const normalizedArgv = argv.join(" ").toLowerCase();
  const pidFileLooksRight = normalizedArgv.includes("hermes") && normalizedArgv.includes("gateway");
  const processLooksRight = normalizedName.includes("hermes") || normalizedName.includes("python");
  return pidFileLooksRight || processLooksRight;
}

function removePidFile(pidFile) {
  try {
    fs.rmSync(pidFile, { force: true });
  } catch (_error) {
  }
}

function main() {
  const pidFile = getPidFile();
  const pidInfo = readPidInfo(pidFile);

  if (!pidInfo) {
    removePidFile(pidFile);
    process.stdout.write("gateway_action:launch\n");
    return;
  }

  const processName = getProcessName(pidInfo.pid);
  if (processName && looksLikeGateway(processName, pidInfo.argv)) {
    process.stdout.write("gateway_action:reuse\n");
    return;
  }

  removePidFile(pidFile);
  process.stdout.write("gateway_action:launch\n");
}

if (require.main === module) {
  main();
}
