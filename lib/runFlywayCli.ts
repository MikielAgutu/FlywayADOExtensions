import tasks = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');

export type FlywayOption = {
    name: string,
    value: string | undefined
}

export async function runFlywayCli(command: string, options: FlywayOption[], extraArgs: string[]) {
    let flyway: trm.ToolRunner;

    if (!command) {
        return tasks.setResult(tasks.TaskResult.Failed, "Command is required");
    }

    console.log("Flyway command: " + command);

    let cmdPath = tasks.which("flyway", true);

    let args: string[] = [];
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

