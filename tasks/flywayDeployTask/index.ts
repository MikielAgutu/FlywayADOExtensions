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

    const checkChanges = tasks.getBoolInput('checkChanges', false);

    const checkDrift = tasks.getBoolInput('checkDrift', false);
    const checkUrl = tasks.getInput('checkUrl', false);
    const checkFailOnDrift = tasks.getBoolInput('checkFailOnDrift', false);

    const checkDryRun = tasks.getBoolInput('checkDryRun', false);
    const checkCode = tasks.getBoolInput('checkCode', false);

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

    if (licenseKey) {
      const checkArgs = [];

      if (checkChanges) {
        checkArgs.push('-changes');
      }

      if (checkCode) {
        checkArgs.push('-code');
      }

      if (checkDrift) {
        checkArgs.push('-drift');
        checkArgs.push('-environments.check.url=' + checkUrl);
        checkArgs.push('-check.buildEnvironment=check');
        checkArgs.push('-check.failOnDrift=' + checkFailOnDrift);
      }

      if (checkDryRun) {
        checkArgs.push('-dryrun');
      }

      await flywayCli.run('check', flywayOptions, [...extraArgs, ...checkArgs]);
      tasks.uploadArtifact("flyway", `${checkReportPath}.html`, checkReportName);
    } else {
      console.log("Check is not available in Flyway Community Edition. Supply a license key to enable this feature.");
    }

    await flywayCli.run('repair', flywayOptions, ['-outOfOrder=true', ...extraArgs]);
    await flywayCli.run('migrate', flywayOptions, ['-outOfOrder=true', ...extraArgs]);

    tasks.setResult(tasks.TaskResult.Succeeded, "");
  }
  catch (err) {
    tasks.setResult(tasks.TaskResult.Failed, (err as Error).message);
  }
}

run();