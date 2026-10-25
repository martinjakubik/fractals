import * as oFs from 'fs/promises';
import * as oReadline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const sApplicationDistributionPath = './app';

const oInterface = oReadline.createInterface({
    input: stdin,
    output: stdout
});

const sPathToDelete = `${sApplicationDistributionPath}`;
const sQuestion = `Delete all files in ${sPathToDelete}? [y/n]\n`;

let sUserConfirmation = '';
sUserConfirmation = await oInterface.question(sQuestion);

console.log(`\nYou answered: "${sUserConfirmation}"\n`);

oInterface.close();

const aFilesToDelete = [
    'app/index.html',
    'app/app.js',
    'app/404.html',
    'app/screen.css',
    'app/icon.png',
    'app/logo.png',
    'app/settings.png'
]

const oStatFileOptions = {
    throwIfNoEntry: false
};

const deleteFile = async function (sFilename) {
    oFs.stat(sFilename, oStatFileOptions).then((oStat) => {
        console.log(`[success] deleted file named ${sFilename}`);
        oFs.rm(sFilename);
    }).catch((oError) => {
        console.log(`  [error] no file named ${sFilename}`);
    });
}

if (sUserConfirmation === 'y') {
    aFilesToDelete.forEach((sFileToDelete) => {
        deleteFile(sFileToDelete);
    })
}
