import { palette } from "./palette.mjs";

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

    static drawMandelbrotSet (oTransform, nPrecision, oTile, oGraphicContext, nHue, THEME, nPixelWidth, nPixelHeight) {
        let x;
        let y;
        let nMaxX = oTile.x + oTile.width;
        let nMaxY = oTile.y + oTile.height;

        for (x = oTile.x; x < nMaxX; x = x + nPixelWidth) {
            for (y = oTile.y; y < nMaxY; y = y + nPixelHeight) {
                const c = Mandelbrot.getComplexNumberFromXY(x, y, oTransform);

                const nDegreeInSet = Mandelbrot.degreeInMandelbrotSet(c, nPrecision);

                if (nDegreeInSet === 0) {
                    oGraphicContext.fillStyle = palette[THEME].bgColors[1];
                    oGraphicContext.fillRect(x, y, nPixelWidth, nPixelHeight);
                } else {
                    const nLightness = palette[THEME].lightMode ? 100 - nDegreeInSet : nDegreeInSet;
                    oGraphicContext.fillStyle = `hsl(${nHue}, 100%, ${nLightness}%)`;
                    oGraphicContext.fillRect(x, y, nPixelWidth, nPixelHeight);
                }
            }
        }
    }
}

export { Mandelbrot };