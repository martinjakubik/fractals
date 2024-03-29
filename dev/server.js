import * as oHttp from 'http';
import * as oUrl from 'url';
import * as oFs from 'fs';
import * as oPath from 'path';

let sBaseDirectory = './app';

let nPort = 1997;

let getDefaultIfBlankPath = function (sPath) {
    let sResponsePath = sPath;

    if (process.platform === 'win32') {
        if (sPath === '\\') {
            sResponsePath = sBaseDirectory + '\\index.html';
        } else {
            sResponsePath = sBaseDirectory + sPath;
        }
    } else {
        if (sPath === '/') {
            sResponsePath = sBaseDirectory + '/index.html';
        } else {
            sResponsePath = sBaseDirectory + sPath;
        }
    }

    return sResponsePath;
};

let getContentType = function (sPath) {
    let sContentType = 'text/plain';

    if (process.platform === 'win32' && sPath === sBaseDirectory + '\\index.html') {
        sContentType = 'text/html';
    } else if (sPath === sBaseDirectory + '/index.html') {
        sContentType = 'text/html';
    } else if (sPath.includes('.css')) {
        sContentType = 'text/css';
    } else if (sPath.includes('.html')) {
        sContentType = 'text/html';
    } else if (sPath.includes('/resources/')) {
        sContentType = 'image/png';
    } else if (process.platform === 'win32' && sPath.includes('\\resources\\')) {
        sContentType = 'image/png';
    } else if (sPath.includes('.js') || sPath.includes('.mjs')) {
        sContentType = 'application/javascript';
    }

    return sContentType;
};

oHttp.createServer(function (oRequest, oResponse) {
    try {
        let oRequestUrl = oUrl.parse(oRequest.url);

        let sPath = oRequestUrl.pathname;

        // need to use oPath.normalize so people can't access directories underneath sBaseDirectory
        let sFSPath = oPath.normalize(sPath);

        let sFinalPath = getDefaultIfBlankPath(sFSPath);
        let sContentType = getContentType(sFinalPath);

        let oHeaders =  {
            'Content-Type': sContentType
        };

        oResponse.writeHead(200, oHeaders);
        let oFileStream = oFs.createReadStream(sFinalPath);
        oFileStream.pipe(oResponse);
        oFileStream.on('error', function (e) {
            // assumes the file doesn't exist
            oResponse.writeHead(404);
            oResponse.end();
        });
    } catch(e) {
        oResponse.writeHead(500);

        // ends the oResponse so browsers don't hang
        oResponse.end();
        console.log(e.stack);
    }

}).listen(process.env.PORT || nPort);

console.log(`listening on port '${nPort}'`);
