import tasks = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import { runFlywayCli } from '../lib/runFlywayCli';

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
    )}-Code-Analysis.html'`;
    const checkReportPath = `${workingDirectory}\\reports\\${checkReportName}`;
    
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

    await runFlywayCli('clean', flywayOptions, extraArgs);

    if (licenseKey) {
      await runFlywayCli('check', flywayOptions, [ '-code', ...extraArgs]);
      tasks.uploadArtifact("flyway", checkReportPath, checkReportName);
    } else {
      console.log("Check is not available in Flyway Community Edition. Supply a license key to enable this feature.");
    }

    await runFlywayCli('migrate', flywayOptions, extraArgs);

    if (licenseKey) {
      await runFlywayCli('undo', flywayOptions, extraArgs);
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