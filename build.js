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

// filters the content to copy
const filterResourceFiles = function (sPathToFile) {
    if (sPathToFile == './resources') {
      console.log(`checking file: ✔︎     copying '${sPathToFile}'`);
      return true;
    }
    const nIndexOfParentDirInPath = sPathToFile.indexOf('resources/');
    const sFileToCheck = nIndexOfParentDirInPath > -1 ? sPathToFile.substring(nIndexOfParentDirInPath + 10) : '';
    if (sFileToCheck.toLowerCase().includes('.png')) {
        console.log(`checking file: ✔︎     copying '${sFileToCheck}'`);
        return true;
    }
    console.log(`checking file: ✗ not copying '${sFileToCheck}'`);
    return false;
};

const oResourceToDistMoveOptions = {
    recursive: true,
    filter: filterResourceFiles
}

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

const renameFile = function(sCurrentName, sNewName) {
    return oFs.stat(sCurrentName).then((oStat) => {
        if (oStat.isFile()) {
            console.log(`[success] renamed file named ${sCurrentName} to ${sNewName}`);
            oFs.cp(sCurrentName, sNewName).then((oResult) => {
                oFs.rm(sCurrentName);
            });
        } else {
            console.log(`  [error] no file named ${sCurrentName}`);
        }
    });
}

const aFilesToRename = [{
        currentName: 'fractals-icon.png',
        newName: 'icon.png'
    }, {
        currentName: 'fractals-logo.png',
        newName: 'logo.png'
    }, {
        currentName: 'fractals-settings.png',
        newName: 'settings.png'
}];

function renameImages(aFilesToRename) {
    const aPromises = [];
    aFilesToRename.forEach((oFileToRename) => {
        const sCurrentFilename = `${sApplicationResourceSourcePath}/${oFileToRename.filename}`;
        const sNewFilename = sCurrentFilename.replace(`${sAppName}-`, '')
        aPromises.push(
            new Promise((resolve) => {
                return oFs.stat(sCurrentFilename).then((oStat) => {
                    if (oStat.isFile()) {
                        oFs.cp(sCurrentFilename, sNewFilename).then((oResult) => {
                            console.log(`[success] renamed file named ${sCurrentFilename} to ${sNewFilename}`);
                            oFs.rm(sCurrentFilename);
                            resolve();
                        });
                    } else {
                        console.log(`  [error] no file named ${sCurrentFilename}`);
                    }
                });
            })
        )
    })
    return Promise.all(aPromises);
}

function copyImages(aFilesToCopy) {
    const aPromises = [];
    aFilesToCopy.forEach((oFileToCopy) => {
        const sCurrentFilename = `${sApplicationResourceSourcePath}/${oFileToCopy.filename}`;
        const sNewPath = `${sApplicationDistributionPath}/${oFileToCopy.filename}`;
        aPromises.push(
            new Promise((resolve) => {
                return oFs.cp(
                    sCurrentFilename,
                    sNewPath,
    )
        .then((oResult) => {
                        console.log(`[success] copied files ${sCurrentFilename}`);
                        resolve();
        })
        .catch((oError) => {
                        console.log(`  [error] error while copying renamed files; details: ${oError}`);
        });
            })
        )
    })
}

const aResourceFilesToRename = [{
        filename: 'fractals-icon.png',
    }, {
        filename: 'fractals-logo.png'
    }];

const aFilesToCopy = [{
        filename: 'icon.png',
    }, {
        filename: 'logo.png',
    }, {
        filename: 'redstars.png',
    }, {
        filename: 'flower.png'
}];

const buildImages = oPromisify(oChildProcess.execFile);
buildImages('scripts/build-images.sh')
    .then((oResult) => {
        console.log(`[success] building images finished with result ${oResult.stdout}`)
        renameImages(aResourceFilesToRename)
    })
    .then((oResult) => copyImages(aFilesToCopy))
    .catch((oError) => {
        console.log(`  [error] error while building images; details: ${JSON.stringify(oError)}`)
    });