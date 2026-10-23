import { palette } from "./palette.mjs";
import { TileCanvas } from "./tilecanvas.mjs";

const MANDELBROT_PRECISION_SMALL_VALUE = 5;

class Mandelbrot {
    static transformXY (x, y, oTransform) {
        const oTransformedXY = {
            x: (x - oTransform.pan.horizontal) / oTransform.zoom,
            y: (y - oTransform.pan.vertical) / oTransform.zoom
        };

        return oTransformedXY;
    }

    static getComplexNumberFromPoint (oPoint, oTransform) {
        return Mandelbrot.getComplexNumberFromXY(oPoint.x, oPoint.y, oTransform);
    }

    static getComplexNumberFromXY (x, y, oTransform) {
        const oTransformedXY = Mandelbrot.transformXY(x, y, oTransform);
        const oComplexNumber = {
            real: oTransformedXY.x,
            imaginary: oTransformedXY.y
        };

        return oComplexNumber;
    }

    static getPointFromComplexNumber (c, oCanvasCenter, oTransform) {
        const oPoint = {
            x: c.real - (oCanvasCenter.x / oTransform.zoom),
            y: c.imaginary - (oCanvasCenter.y / oTransform.zoom)
        };

        return oPoint;
    }

    static degreeInMandelbrotSet (c, nPrecision) {
        let iIncrementalRealComponent = c.real;
        let iIncrementalImaginaryComponent = c.imaginary;

        let j = 0;
        for (j = 0; j < nPrecision; j++) {

            let iTempRealComponent = iIncrementalRealComponent * iIncrementalRealComponent - iIncrementalImaginaryComponent * iIncrementalImaginaryComponent + c.real;
            let iTempImaginaryComponent = 2 * iIncrementalRealComponent * iIncrementalImaginaryComponent + c.imaginary;

            iIncrementalRealComponent = iTempRealComponent;
            iIncrementalImaginaryComponent = iTempImaginaryComponent;

            if (iIncrementalRealComponent * iIncrementalImaginaryComponent > MANDELBROT_PRECISION_SMALL_VALUE) {
                return j / nPrecision * 100;
            }
        }

        return 0;
    }

    static refreshDrawing (oTile, oTransform, oGraphicContext, oOptions, nMilliseconds) {
        return setTimeout(() => this.drawMandelbrotTile(oTile, oTransform, oGraphicContext, oOptions), nMilliseconds);
    }

    static copyDrawingOptions (oDrawingOptions) {
        return {
            precision: oDrawingOptions.precision,
            hue: oDrawingOptions.hue,
            theme: oDrawingOptions.theme,
            pixelWidth: oDrawingOptions.pixelWidth ? oDrawingOptions.pixelWidth : 1,
            pixelHeight: oDrawingOptions.pixelHeight ? oDrawingOptions.pixelHeight : 1
        };
    }

    static drawMandelbrotSet (oTransform, oGraphicCanvas, oOptions) {
        let aTiles = TileCanvas.getTiles(3, 3, oGraphicCanvas.width, oGraphicCanvas.height);
        const oGraphicContext = oGraphicCanvas.getContext('2d');
        const oInitialDrawingOptions = this.copyDrawingOptions(oOptions);
        const oRefreshDrawingOptions = this.copyDrawingOptions(oOptions);
        let nRefreshTimeoutId = -1;
        const oStartTime = Date.now();
        aTiles.forEach(oTile => {
            oInitialDrawingOptions.pixelWidth = 1;
            oInitialDrawingOptions.pixelHeight = 1;
            if (oTile.isMiddle != true) {
                nRefreshTimeoutId = this.refreshDrawing(oTile, oTransform, oGraphicContext, oRefreshDrawingOptions, 4000);
                oInitialDrawingOptions.pixelWidth = 4;
                oInitialDrawingOptions.pixelHeight = 4;
            }
            this.drawMandelbrotTile(oTile, oTransform, oGraphicContext, oInitialDrawingOptions);
        });
        const oEndTime = Date.now();
        console.log(`drawing took ${oEndTime - oStartTime} milliseconds`);
        return nRefreshTimeoutId;
    }

    static drawMandelbrotTile (oTile, oTransform, oGraphicContext, oOptions) {
        let x;
        let y;
        let nMaxX = oTile.x + oTile.width;
        let nMaxY = oTile.y + oTile.height;

        for (x = oTile.x; x < nMaxX; x = x + oOptions.pixelWidth) {
            for (y = oTile.y; y < nMaxY; y = y + oOptions.pixelHeight) {
                this.drawMandelbrotPoint(x, y, oTransform, oGraphicContext, oOptions);
            }
        }
    }

    static drawMandelbrotPoint (x, y, oTransform, oGraphicContext, oOptions) {
        const c = Mandelbrot.getComplexNumberFromXY(x, y, oTransform);

        const nDegreeInSet = Mandelbrot.degreeInMandelbrotSet(c, oOptions.precision);

        if (nDegreeInSet === 0) {
            oGraphicContext.fillStyle = palette[oOptions.theme].bgColors[1];
            oGraphicContext.fillRect(x, y, oOptions.pixelWidth, oOptions.pixelHeight);
        } else {
            const nLightness = palette[oOptions.theme].lightMode ? (100 - nDegreeInSet) : nDegreeInSet;
            oGraphicContext.fillStyle = `hsl(${oOptions.hue}, 100%, ${nLightness}%)`;
            oGraphicContext.fillRect(x, y, oOptions.pixelWidth, oOptions.pixelHeight);
        }
    }
}

export { Mandelbrot };