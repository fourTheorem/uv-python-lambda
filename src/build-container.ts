import sleep = require("atomic-sleep");
import { spawn, exec, spawnSync, execSync } from "node:child_process";

/**
 * Runs a Docker container in detached mode and waits for a specific log line.
 * @param image - The Docker image to run.
 * @param args - Additional arguments to pass to Docker.
 * @param logLine - The log line to wait for.
 * 
 * @returns The container ID.
 */
export function runDockerContainerAndWait(name: string, args: string[], logLine: string): string {
  // kill any old container that might be running from previous builds
  // spawnSync("docker", ["rm", "-f", name])  TODO
  // Start the container in detached mode
  console.log("Spawning Docker container...", name, args);
  const dockerRun = spawnSync("docker", args);
  if (dockerRun.error) {
    console.error(`Failed to start Docker process: ${dockerRun.error}`);
    throw new Error(`Failed to start uv-python-lambda builder container: ${dockerRun.error}`);
  }
  if (dockerRun.status !== 0) {
    const message = `Docker process exited with code ${dockerRun.status}, ${dockerRun.stderr.toString()}`;
    console.error(message);
    throw new Error(message);
  }

  const containerId = dockerRun.stdout.toString().trim()

  console.log(`Container started: ${containerId}`);

  // Wait for the container to be running
  console.log("Waiting for container to be ready...");
  waitForContainer(containerId);
  console.log("Container is ready.  Waiting for log line...");
  waitForLogLine(containerId, logLine);
  console.log("Log line found.");
  return containerId;
}

/**
 * Waits until a container is in the "running" state.
 */
function waitForContainer(containerId: string) {
  // TODO - add a timeout
  let attempts = 60;
  while (attempts > 0) {
    const stdout = execSync(`docker inspect -f '{{.State.Running}}' ${containerId}`)
    if (stdout.toString().trim() === "true") {
      console.log(`Container ${containerId} is running.`);
      return;
    }
    console.log(`Container ${containerId} is not yet running.`);
    attempts--;
    sleep(1000);
  }
  throw new Error(`Container ${containerId} did not start within the timeout.`);
}

/**
 * Waits until a specific line appears in the container logs.
 * @param containerId - The container ID.
 * @param logLine - The line to wait for.
 */
function waitForLogLine(containerId: string, logLine: string) {
  let attempts = 60;
  while (attempts > 0) {
    const logProcess = spawnSync("docker", ["logs", containerId]);
    if (logProcess.error) {
      const message = `Failed to get container logs: ${containerId} ${logProcess.error}`;
      console.error(message);
      throw new Error(message);
    }
    if (logProcess.status !== 0) {
      const message = `Docker process exited with code ${logProcess.status}, ${logProcess.stderr.toString()}`;
      console.error(message);
      throw new Error(message);
    }

    const logs = logProcess.stdout.toString();
    console.log('LOGS', logs);
    if (logs.includes(logLine)) {
      return;
    }
    attempts--;
    sleep(1000);
  }

  throw new Error(`Log line not found: ${logLine}`);
}

/**
 * Stops the container.
 * @param containerId - The container ID.
 */
export function stopContainer(containerId: string) {
  exec(`docker stop ${containerId}`, (error) => {
    if (error) {
      console.error(`Failed to stop container ${containerId}: ${error.message}`);
    } else {
      console.log(`Container ${containerId} stopped.`);
    }
  });
}

export function execCommand(containerId: string, command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const execProcess = spawn("docker", ["exec", containerId, command]);

    execProcess.stdout.on("data", (data) => {
      const logs = data.toString();
      console.log(logs);
    });

    execProcess.stderr.on("data", (data) => {
      console.error(`STDERR: ${data}`);
    });

    execProcess.on("error", (err) => {
      reject(new Error(`Failed to fetch logs: ${err.message}`));
    });

    execProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Exec ${command} for container ${containerId} failed with code ${code}`));
      }
    });
  });
}
