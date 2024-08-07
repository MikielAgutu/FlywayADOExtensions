"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tasks = require("azure-pipelines-task-lib/task");
const runFlywayCli_1 = require("../lib/runFlywayCli");
async function run() {
    try {
        const workingDirectory = tasks.getPathInput('workingDirectory', true);
        const url = tasks.getInput('url', true);
        const user = tasks.getInput('user', true);
        const password = tasks.getInput('password', true);
        const commandOptions = tasks.getInput('commandOptions', false);
        const licenseKey = tasks.getInput('licenseKey', false);
        const extraArgs = commandOptions ? commandOptions.split(' ') : [];
        const flywayOptions = [
            {
                name: 'locations',
                value: 'filesystem:' + (workingDirectory ? workingDirectory : '')
            },
            {
                name: 'url',
                value: url
            },
            {
                name: 'user',
                value: user
            },
            {
                name: 'password',
                value: password
            },
            {
                name: 'licenseKey',
                value: licenseKey
            },
            {
                name: 'cleanDisabled',
                value: 'false'
            }
        ];
        await (0, runFlywayCli_1.runFlywayCli)('info', flywayOptions, extraArgs);
        await (0, runFlywayCli_1.runFlywayCli)('clean', flywayOptions, extraArgs);
        await (0, runFlywayCli_1.runFlywayCli)('migrate', flywayOptions, extraArgs);
        if (licenseKey) {
            await (0, runFlywayCli_1.runFlywayCli)('undo', flywayOptions, extraArgs);
        }
        else {
            console.log("Undo is not available in Flyway Community Edition. Supply a license key to enable this feature.");
        }
        tasks.setResult(tasks.TaskResult.Succeeded, "");
    }
    catch (err) {
        tasks.setResult(tasks.TaskResult.Failed, err.message);
    }
}
run();
