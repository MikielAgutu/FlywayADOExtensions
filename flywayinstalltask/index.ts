import tasks = require('azure-pipelines-task-lib/task');
import * as tools from 'azure-pipelines-tool-lib/tool';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { format } from 'util';
import uuidV4 from 'uuid/v4';

const flywayToolName = "flyway";
const isWindows = os.type().match(/^Win/);

async function downloadFlyway(version: string): Promise<string>{
    let cachedToolPath = tools.findLocalTool(flywayToolName, version);

    if (!cachedToolPath) {        
        const url = getDownloadUrl(version);
        console.log("Flyway not installed, downloading from: ", url);
        const ext = os.type() == 'Windows_NT' ? 'zip' : 'tar.gz';
        const fileName = `${flywayToolName}-${version}-${uuidV4()}.${ext}`;
        const zipFolderName = `${flywayToolName}-${version}`;
        console.log("Flyway file name as: ", fileName);

        try {                        
            const downloadPath = await tools.downloadTool(url, fileName);
            console.log("Flyway downloaded to path: ", downloadPath);

            let unzippedPath;
            if(isWindows) {
                unzippedPath = await tools.extractZip(downloadPath);        
            } else {
                unzippedPath = await tools.extractTar(downloadPath);
            }
            console.log("Extracted flyway to dir: ", unzippedPath);
            cachedToolPath = await tools.cacheDir(unzippedPath +  '/' + zipFolderName, flywayToolName, version);
            console.log("Flyway installed in path: ", cachedToolPath);
        }
        catch (exception){            
            throw new Error(`Flyway download from url '${url}' failed with exception '${exception}'`);
        }
    }

    const flywayPath = path.join(cachedToolPath, flywayToolName + getExecutableExtension());

    if(!flywayPath){
        throw new Error(`Unable to resolve path to Flyway tool using root '${cachedToolPath}'.`)
    }

    fs.chmodSync(flywayPath, "777");

    return flywayPath;
}

function getDownloadUrl(version: string): string {
    const url = format("https://download.red-gate.com/maven/release/com/redgate/flyway/flyway-commandline/%s/flyway-commandline-%s-%s", version, version);
    switch(os.type()){
        case 'Linux':
            return format(url, "linux-x64.tar.gz");
        case 'Darwin':
            return format(url, "macosx-x64.tar.gz");        
        case 'Windows_NT':
            return format(url, "windows-x64.zip");
        default:
            throw new Error(`Operating system ${os.type()} is not supported.`);
    }
}

const getExecutableExtension = () => isWindows ? ".cmd" : "";

async function installFlyway() {
    const inputVersion: string = <string>tasks.getInput("flywayVersion", true);
    const flywayPath: string = await downloadFlyway(inputVersion);
    const envPath = process.env['PATH'];

    if(envPath && !envPath.includes(path.dirname(flywayPath))) {
        tools.prependPath(path.dirname(flywayPath));
    }
}

async function verifyFlywayInstallation() {
    console.log("Verifying Flyway installation. Executing 'flyway -v'");
    const flywayToolPath = tasks.which("flyway", true);
    const flywayTool = tasks.tool(flywayToolPath);
    flywayTool.arg("-v");
    await flywayTool.execAsync()
}

installFlyway()
    .then(() => verifyFlywayInstallation())
    .then(() => tasks.setResult(tasks.TaskResult.Succeeded, ""))
    .catch((error) => tasks.setResult(tasks.TaskResult.Failed, error))