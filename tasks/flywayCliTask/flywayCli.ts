import tasks = require('azure-pipelines-task-lib/task');

export type FlywayCliArgument = {
    name: string,
    value: string | undefined
}

export async function run(command: string, cliArguments: FlywayCliArgument[], extraCliArguments: string[]) {
    if (!command) {
        throw new Error("Command is required");
    }

    const flywayPath = tasks.which("flyway", true);
    const args = cliArguments.filter(option => option.value !== undefined).map(option => `-${option.name}=${option.value}`);
    const flyway = tasks.tool(flywayPath).arg([ command, '-n', '-color=always', ...args, ...extraCliArguments ]);
    const exitCode = await flyway.execAsync();

    if (exitCode !== 0) {
        throw new Error("Flyway CLI failed with exit code " + exitCode);
    }
}

