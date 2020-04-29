const CANVAS_WIDTH = 1520;
const CANVAS_HEIGHT = 600;

const SMALL_VALUE = 5;
const MAX_ITERATIONS = 100;
const MAGNIFICATION_FACTOR = 200;
const HORIZONTAL_PAN = 4;
const VERTICAL_PAN = 1.5;

const degreeInMandelbrotSet = function (x, y) {

    let iRealComponent = x;
    let iImaginaryComponent = y;

    let j = 0;
    for (j = 0; j < MAX_ITERATIONS; j++) {

        let iTempRealComponent = iRealComponent * iRealComponent - iImaginaryComponent * iImaginaryComponent + x;
        let iTempImaginaryComponent = 2 * iRealComponent * iImaginaryComponent + y;

        iRealComponent = iTempRealComponent;
        iImaginaryComponent = iTempImaginaryComponent;

        if (iRealComponent * iImaginaryComponent > SMALL_VALUE) {
            return j / MAX_ITERATIONS * 100;
        }

    }

    return 0;

};

const draw = function (oCanvas) {

    const oContext = oCanvas.getContext('2d');

    const iMagnification = MAGNIFICATION_FACTOR;
    const iHorizontalPan = HORIZONTAL_PAN;
    const iVerticalPan = VERTICAL_PAN;

    let x = 0;
    let y = 0;
    for (x = 0; x < oCanvas.width; x++) {
        for (y = 0; y < oCanvas.height; y++) {
            const iTransformedX = x / iMagnification - iHorizontalPan;
            const iTransformedY = y / iMagnification - iVerticalPan;
            const nDegreeInSet = degreeInMandelbrotSet(iTransformedX, iTransformedY);
            if (nDegreeInSet == 0) {
                oContext.fillStyle = '#000';
                oContext.fillRect(x, y, 1, 1);
            } else {
                oContext.fillStyle = `hsl(0, 100%, ${nDegreeInSet}%)`;
                oContext.fillRect(x, y, 1, 1);
            }
        }
    }

}

const main = function () {

    const oCanvas = document.createElement('canvas');
    oCanvas.width = CANVAS_WIDTH;
    oCanvas.height = CANVAS_HEIGHT;
    document.body.appendChild(oCanvas);

    draw(oCanvas);

};

main();