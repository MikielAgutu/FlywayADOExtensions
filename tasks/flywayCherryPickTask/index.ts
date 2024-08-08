import tasks = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import { run as runFlywayCli } from '../lib/flywayCli';

async function run() {
  try {
    const cherryPickVersions = tasks.getPathInput('cherryPickVersions', true);
    const workingDirectory = tasks.getPathInput('workingDirectory', true);
    const url = tasks.getInput('url', true);
    const user = tasks.getInput('user', true);
    const password = tasks.getInput('password', true);
    const commandOptions = tasks.getInput('commandOptions', false);
    const extraArgs = commandOptions ? commandOptions.split(' ') : [];

    const flywayOptions = [
      {
        name: 'locations',
        value: 'filesystem:' + (workingDirectory ? workingDirectory : '')
      },
      {
        name: 'cherryPick',
        value: cherryPickVersions
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
      }
    ];

    await runFlywayCli('migrate', flywayOptions, extraArgs);

    tasks.setResult(tasks.TaskResult.Succeeded, "");
  }
  catch (err) {
    tasks.setResult(tasks.TaskResult.Failed, (err as Error).message);
  }
}

run();