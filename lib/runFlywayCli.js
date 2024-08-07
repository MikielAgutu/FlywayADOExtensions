"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFlywayCli = void 0;
const tasks = require("azure-pipelines-task-lib/task");
async function runFlywayCli(command, options, extraArgs) {
    let flyway;
    if (!command) {
        return tasks.setResult(tasks.TaskResult.Failed, "Command is required");
    }
    console.log("Flyway command: " + command);
    let cmdPath = tasks.which("flyway", true);
    let args = [];
    args.push('-n');
    args.push('-color=always');
    options.filter(option => option.value !== undefined).forEach(option => args.push(`-${option.name}=${option.value}`));
    extraArgs.forEach(arg => args.push(arg));
    args.push(command);
    console.log("Executing Flyway CLI");
    console.log(args.join(" "));
    flyway = tasks.tool(cmdPath).arg(args);
    const exitCode = await flyway.execAsync();
    if (exitCode !== 0) {
        throw new Error("Flyway CLI failed with exit code " + exitCode);
    }
}
exports.runFlywayCli = runFlywayCli;
