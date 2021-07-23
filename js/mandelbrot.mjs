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

    static drawMandelbrotSet (oTransform, nPrecision, oGraphicCanvas, oDebugCanvas, sStrokeColor, nHue, oTapPoint) {

        const oGraphicContext = oGraphicCanvas.getContext('2d');
        const oDebugContext = oDebugCanvas.getContext('2d');
        const nDebugCanvasWidth = oDebugCanvas.parentNode.clientWidth;

        let x = 0;
        let y = 0;
        let sDebugText = '';
        oDebugContext.font = '8pt sans-serif';

        oDebugContext.clearRect(0, 0, nDebugCanvasWidth, oDebugCanvas.height);

        sDebugText = `precision: ${nPrecision} pan:${(oTransform.pan.horizontal)} zoom: ${oTransform.zoom} pan/zoom:${(oTransform.pan.horizontal / oTransform.zoom)} last click: (${oTapPoint.x}, ${oTapPoint.y}) center point real: ${((oGraphicCanvas.width / 2) - oTransform.pan.horizontal) / oTransform.zoom}`;
        oDebugContext.fillStyle = sStrokeColor;
        oDebugContext.fillText(sDebugText, 80, 580);

        for (x = 0; x < oGraphicCanvas.width; x++) {
            for (y = 0; y < oGraphicCanvas.height; y++) {

                const c = Mandelbrot.getComplexNumberFromXY(x, y, oTransform);

                // debug
                if (x % 200 === 0 && y % 200 === 0) {
                    const sDebugText1 = `x:${x},y:${y}`;
                    const sDebugText2 = `r:${c.real}, i:${c.imaginary}`;
                    oDebugContext.fillStyle = sStrokeColor;
                    oDebugContext.fillText(sDebugText1, x, y + 8);
                    oDebugContext.fillText(sDebugText2, x, y + 22);
                }

                const nDegreeInSet = Mandelbrot.degreeInMandelbrotSet(c, nPrecision);

                if (nDegreeInSet === 0) {
                    oGraphicContext.fillStyle = '#000';
                    oGraphicContext.fillRect(x, y, 1, 1);
                } else {
                    oGraphicContext.fillStyle = `hsl(${nHue}, 100%, ${nDegreeInSet}%)`;
                    oGraphicContext.fillRect(x, y, 1, 1);
                }
            }
        }

    }
}

export { Mandelbrot };