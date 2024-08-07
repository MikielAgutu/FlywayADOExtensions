import tasks = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import { runFlywayCli } from '../lib/runFlywayCli';

async function run() {
  try {
    const command = tasks.getInput('command', true);

    if (!command) {
      return tasks.setResult(tasks.TaskResult.Failed, "Command is required");
    }

    const workingDirectory = tasks.getPathInput('workingDirectory', true);
    const url = tasks.getInput('url', true);
    const user = tasks.getInput('user', true);
    const password = tasks.getInput('password', true);
    const commandOptions = tasks.getInput('commandOptions', false);
    const extraArgs = commandOptions ? commandOptions.split(' ') : [];

    await runFlywayCli(command, [
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
      }
    ],
      extraArgs);

    tasks.setResult(tasks.TaskResult.Succeeded, "");
  }
  catch (err) {
    tasks.setResult(tasks.TaskResult.Failed, (err as Error).message);
  }
}

run();