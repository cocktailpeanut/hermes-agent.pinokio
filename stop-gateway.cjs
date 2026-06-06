const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = __dirname;
const appDir = path.join(rootDir, "app");
const hermesHome = process.env.HERMES_HOME || path.join(os.homedir(), ".hermes");
const pidFile = path.join(hermesHome, "gateway.pid");

function writeBufferedOutput(result) {
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
}

function hermesCandidates() {
  const venvDir = path.join(appDir, "env");
  if (process.platform === "win32") {
    const scriptsDir = path.join(venvDir, "Scripts");
    return ["hermes.exe", "hermes.cmd", "hermes.bat", "hermes"].map((name) => path.join(scriptsDir, name));
  }

  return [path.join(venvDir, "bin", "hermes")];
}

function runHermesGatewayStop() {
  let foundHermes = false;

  for (const candidate of hermesCandidates()) {
    if (!fs.existsSync(candidate)) {
      continue;
    }

    foundHermes = true;
    const result = spawnSync(candidate, ["gateway", "stop"], {
      cwd: appDir,
      env: {
        ...process.env,
        PYTHONUTF8: "1",
        PYTHONIOENCODING: "utf-8"
      },
      encoding: "utf8"
    });

    writeBufferedOutput(result);

    if (!result.error && result.status === 0) {
      return true;
    }
  }

  if (!foundHermes) {
    process.stdout.write("Hermes executable was not found; checking the gateway PID file.\n");
  }

  return false;
}

function removePidFile() {
  try {
    fs.rmSync(pidFile, { force: true });
  } catch (_error) {
  }
}

function readPidInfo() {
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

function spawnText(command, args) {
  try {
    const result = spawnSync(command, args, {
      encoding: "utf8"
    });
    if (result.status === 0) {
      return result.stdout.trim();
    }
  } catch (_error) {
  }

  return "";
}

function getProcessDetails(pid) {
  if (process.platform === "win32") {
    const commandLine = spawnText("powershell.exe", [
      "-NoProfile",
      "-Command",
      `Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}" | Select-Object -ExpandProperty CommandLine`
    ]);
    const taskList = spawnText("tasklist", ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"]);
    const nameMatch = taskList.match(/^"([^"]+)"/);

    return {
      name: nameMatch ? nameMatch[1] : "",
      commandLine
    };
  }

  return {
    name: spawnText("ps", ["-p", String(pid), "-o", "comm="]),
    commandLine: spawnText("ps", ["-p", String(pid), "-o", "args="])
  };
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error && error.code === "EPERM";
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function waitForExit(pid, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (!isProcessAlive(pid)) {
      return true;
    }
    sleep(100);
  }

  return !isProcessAlive(pid);
}

function terminateProcess(pid, force) {
  if (process.platform === "win32") {
    const args = ["/PID", String(pid), "/T"];
    if (force) {
      args.push("/F");
    }

    const result = spawnSync("taskkill", args, {
      encoding: "utf8"
    });
    writeBufferedOutput(result);
    return !result.error && result.status === 0;
  }

  try {
    process.kill(pid, force ? "SIGKILL" : "SIGTERM");
    return true;
  } catch (error) {
    process.stderr.write(`Failed to stop Hermes Gateway PID ${pid}: ${error.message}\n`);
    return false;
  }
}

function looksLikeHermesGateway(pidInfo, details) {
  const commandText = [pidInfo.argv.join(" "), details.commandLine].join(" ").toLowerCase();
  const processName = details.name.toLowerCase();

  return (commandText.includes("hermes") && commandText.includes("gateway")) ||
    processName.includes("hermes");
}

function stopFromPidFile() {
  const pidInfo = readPidInfo();
  if (!pidInfo) {
    removePidFile();
    return true;
  }

  if (!isProcessAlive(pidInfo.pid)) {
    removePidFile();
    return true;
  }

  const details = getProcessDetails(pidInfo.pid);
  if (!looksLikeHermesGateway(pidInfo, details)) {
    process.stderr.write(`Gateway PID file points to PID ${pidInfo.pid}, but that process does not look like Hermes Gateway.\n`);
    return false;
  }

  if (!terminateProcess(pidInfo.pid, false)) {
    return false;
  }

  if (!waitForExit(pidInfo.pid, 2000)) {
    terminateProcess(pidInfo.pid, true);
  }

  if (waitForExit(pidInfo.pid, 1000)) {
    removePidFile();
    process.stdout.write(`Stopped Hermes Gateway PID ${pidInfo.pid}.\n`);
    return true;
  }

  process.stderr.write(`Hermes Gateway PID ${pidInfo.pid} is still running.\n`);
  return false;
}

function main() {
  if (runHermesGatewayStop()) {
    return;
  }

  if (!stopFromPidFile()) {
    process.exitCode = 1;
  }
}

main();
