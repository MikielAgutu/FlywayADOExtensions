import tasks = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import { runFlywayCli } from '../lib/runFlywayCli';

async function run() {
  try {
    const workingDirectory = tasks.getPathInput('workingDirectory', true);
    const dbUrl = tasks.getInput('url', true);
    const dbUser = tasks.getInput('user', true);
    const dbPassword = tasks.getInput('password', true);
    const commandOptions = tasks.getInput('commandOptions', false);
    const extraArgs = commandOptions ? commandOptions.split(' ') : [];

    const flywayOptions = [
      {
        name: 'locations',
        value: 'filesystem:' + (workingDirectory ? workingDirectory : '')
      },
      {
        name: 'url',
        value: dbUrl
      },
      {
        name: 'user',
        value: dbUser
      },
      {
        name: 'password',
        value: dbPassword
      }
    ];

    await runFlywayCli('info', flywayOptions, extraArgs);
    await runFlywayCli('clean', flywayOptions, extraArgs);
    await runFlywayCli('migrate', flywayOptions, extraArgs);
    await runFlywayCli('undo', flywayOptions, extraArgs);

    tasks.setResult(tasks.TaskResult.Succeeded, "");
  }
  catch (err) {
    tasks.setResult(tasks.TaskResult.Failed, (err as Error).message);
  }
}

run();