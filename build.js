import * as oFs from 'fs/promises';
import { promisify as oPromisify } from 'node:util';
import oChildProcess from 'node:child_process';

const sApplicationSourcePath = './src';
const sApplicationResourceSourcePath = './resources';
const sApplicationDistributionPath = './app';
const sLibPath = './app';
const sAppName = 'fractals';

const oMkDirOptions = {
    recursive: true,
};

const aFilesToExcludeFromApp = [
    '.DS_Store',
    'source-file-1.js',
    'dont-include-me-2.js',
    'dont-include-me-3.html',
];

// filters the content to copy
const filterFiles = function (sSrcPath) {
    const sFileToCheck = sSrcPath.substring(sSrcPath.indexOf('src/') + 4);
    if (aFilesToExcludeFromApp.includes(sFileToCheck)) {
        console.log(`checking file: ✗ not copying ${sFileToCheck}`);
        return false;
    }
    console.log(`checking file: ✔︎     copying ${sFileToCheck}`);
    return true;
};

// copies all sources to application distribution path
const oSrcToDistCopyOptions = {
    recursive: true,
    filter: filterFiles,
};

oFs.mkdir(sApplicationDistributionPath, oMkDirOptions)
    .then((oResult) => {
        console.log(`[success] mkdir ${sApplicationDistributionPath}`);

        // copies src to app directory
        oFs.cp(
            sApplicationSourcePath,
            sApplicationDistributionPath,
            oSrcToDistCopyOptions,
        )
            .then((oResult) => {
                console.log(`[success] copied dir ${sApplicationSourcePath}`);
            })
            .catch((oError) => {
                console.log(`  [error] details: ${oError}`);
            });
    })
    .catch((oError) => {
        console.log(`  [error] details: ${oError}`);
    });

oFs.mkdir(sLibPath, oMkDirOptions)
    .then((oResult) => {
        console.log(`[success] mkdir ${sLibPath}`);

        oFs.copyFile(
            './node_modules/learnhypertext/js/index.mjs',
            `${sLibPath}/learnhypertext.mjs`,
        )
            .then((oResult) => {
                console.log(
                    `[success] copied file ${sLibPath}/learnhypertext.mjs`,
                );
            })
            .catch((oError) => {
                console.log(`  [error] details: ${oError}`);
            });
    })
    .catch((oError) => {
        console.log(`  [error] details: ${oError}`);
    });

async function renameFile(oFileToRename) {
    let sCurrentFilename, sNewFilename;
    if (oFileToRename.filename) {
        sCurrentFilename = `${sApplicationResourceSourcePath}/${oFileToRename.filename}`;
        sNewFilename = `${sApplicationResourceSourcePath}/${oFileToRename.filename.replace(`${sAppName}-`, '')}`;
    } else if (oFileToRename.currentFilename && oFileToRename.newFilename) {
        sCurrentFilename = `${sApplicationResourceSourcePath}/${oFileToRename.currentFilename}`;
        sNewFilename = `${sApplicationResourceSourcePath}/${oFileToRename.newFilename}`;
    } else {
        return;
    }

    const oStat = await oFs.stat(sCurrentFilename);
    if (!oStat.isFile) {
        throw new Error(`${sCurrentFilename} is not a file`);
    }
    await oFs.rename(sCurrentFilename, sNewFilename);
    console.log(`[success] renamed file named ${sCurrentFilename} to ${sNewFilename}`);
}

async function copyFile(oFileToCopy) {
    let sCurrentFilename, sNewFilename;
    if (oFileToCopy.filename) {
        sCurrentFilename = oFileToCopy.filename;
        sNewFilename = oFileToCopy.filename;
    } else if (oFileToCopy.currentFilename && oFileToCopy.newFilename) {
        sCurrentFilename = oFileToCopy.currentFilename;
        sNewFilename = oFileToCopy.newFilename;
    } else {
        return;
    }
    await oFs.cp(`${sApplicationResourceSourcePath}/${sCurrentFilename}`, `${sApplicationDistributionPath}/${sNewFilename}`);
    console.log(`[success] copied ${sApplicationResourceSourcePath}/${sCurrentFilename} to ${sApplicationDistributionPath}/${sNewFilename}`);
}

const aResourceFilesToRename = [{
        filename: 'fractals-icon.png',
    }, {
        filename: 'fractals-logo.png'
    }];

const aResourceFilesToCopy = [{
        filename: 'icon.png',
    }, {
        filename: 'logo.png',
    }, {
        filename: 'redstars.png',
    }, {
        filename: 'flower.png'
}];

const renameImages = (aFilesToRename) => Promise.all(aFilesToRename.map(renameFile));
const copyImages = (aFilesToCopy) => Promise.all(aFilesToCopy.map(copyFile));

const buildImages = oPromisify(oChildProcess.execFile);
try {
    const oBuildResult = await buildImages('scripts/build-images.sh');
    console.log(`[success] built images finished with result ${oBuildResult.stdout}`);

    const oRenameResult = await renameImages(aResourceFilesToRename);
    console.log(`[success] renamed images finished with result ${oRenameResult.stdout}`);

    const oCopyResult = await copyImages(aResourceFilesToCopy);
    console.log(`[success] copies images finished with result ${oCopyResult.stdout}`);
} catch (oError) {
    console.log(`  [error] error while building images; ${oError}`);
    process.exitCode = 1;
}
