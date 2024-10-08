import tasks = require('azure-pipelines-task-lib/task');
import * as flywayCli from './flywayCli.js';

async function run() {
  try {
    const workingDirectory = tasks.getPathInput('workingDirectory', true);
    const url = tasks.getInput('url', true);

    const user = tasks.getInput('user', false);
    const password = tasks.getInput('password', false);
    const licenseKey = tasks.getInput('licenseKey', false);

    const checkRulesLocation = tasks.getInput('checkRulesLocation', false);
    const checkMajorRules = tasks.getInput('checkMajorRules', false);
    const checkMajorTolerance = tasks.getInput('checkMajorTolerance', false);
    const checkReportName = `${tasks.getVariable(
      "Build.BuildId"
    )}-Code-Analysis`;
    const checkReportPath = `${workingDirectory}/reports/${checkReportName}`;

    const commandOptions = tasks.getInput('commandOptions', false);
    const extraArgs = commandOptions ? commandOptions.split(' ') : [];

    const flywayOptions = [
      {
        name: 'locations',
        value: 'filesystem:' + (workingDirectory ? workingDirectory : '')
      },
      {
        name: 'environment',
        value: 'target'
      },
      {
        name: 'environments.target.url',
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
      },
      {
        name: 'check.majorRules',
        value: checkMajorRules
      },
      {
        name: 'check.majorTolerance',
        value: checkMajorTolerance
      },
      {
        name: 'check.rulesLocation',
        value: checkRulesLocation
      },
      {
        name: 'reportEnabled',
        value: 'true'
      },
      {
        name: 'reportFilename',
        value: checkReportPath
      },
      {
        name: 'errorOverrides',
        value: 'S0001:0:I'
      },
      {
        name: 'baselineOnMigrate',
        value: 'true'
      },
    ];

    await flywayCli.run('clean', flywayOptions, extraArgs);

    if (licenseKey) {
      await flywayCli.run('check', flywayOptions, ['-code', ...extraArgs]);
      tasks.uploadArtifact("flyway", `${checkReportPath}.html`, checkReportName);
    } else {
      console.log("Check is not available in Flyway Community Edition. Supply a license key to enable this feature.");
    }

    await flywayCli.run('migrate', flywayOptions, extraArgs);

    if (licenseKey) {
      await flywayCli.run('undo', flywayOptions, extraArgs);
    } else {
      console.log("Undo is not available in Flyway Community Edition. Supply a license key to enable this feature.");
    }

    tasks.setResult(tasks.TaskResult.Succeeded, "");
  }
  catch (err) {
    tasks.setResult(tasks.TaskResult.Failed, (err as Error).message);
  }
}

run();