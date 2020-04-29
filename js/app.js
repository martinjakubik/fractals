const CANVAS_WIDTH = 1520;
const CANVAS_HEIGHT = 600;
const VERTICAL_MARGIN = 36;

const SMALL_VALUE = 5;
const MAGNIFICATION_FACTOR = 200;
const HORIZONTAL_PAN = 4;
const VERTICAL_PAN = 1.5;

const degreeInMandelbrotSet = function (x, y) {

    let iRealComponent = x;
    let iImaginaryComponent = y;

    let j = 0;
    for (j = 0; j < nMaxIterations; j++) {

        let iTempRealComponent = iRealComponent * iRealComponent - iImaginaryComponent * iImaginaryComponent + x;
        let iTempImaginaryComponent = 2 * iRealComponent * iImaginaryComponent + y;

        iRealComponent = iTempRealComponent;
        iImaginaryComponent = iTempImaginaryComponent;

        if (iRealComponent * iImaginaryComponent > SMALL_VALUE) {
            return j / nMaxIterations * 100;
        }

    }

    return 0;

};

const draw = function () {

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

const createCanvas = function () {

    const oCanvas = document.createElement('canvas');
    document.body.appendChild(oCanvas);

    const nParentWidth = oCanvas.parentNode.clientWidth ;

    oCanvas.width = nParentWidth;
    oCanvas.height = CANVAS_HEIGHT;

    const nMarginSide = Math.floor(( nParentWidth - oCanvas.width ) / 2 ) ;
    const sMarginSide = nMarginSide + "px" ;
    const sMarginVertical = VERTICAL_MARGIN + "px" ;

    oCanvas.style.marginLeft = sMarginSide ;
    oCanvas.style.marginRight = sMarginSide ;
    oCanvas.style.marginTop = sMarginVertical ;
    oCanvas.style.marginBottom = sMarginVertical ;

    return oCanvas;

};

const createControls = function () {

    const oInput = document.createElement('input');
    oInput.type = 'range';
    oInput.id = 'maxIterations';
    oInput.name = 'maxIterations';
    oInput.min = '1';
    oInput.max = '100';
    oInput.value = nMaxIterations;
    oInput.onchange = () => {
        nMaxIterations = oInput.value;
        draw();
    };

    const oLabel = document.createElement('label');
    oLabel.for = 'maxIterations';
    oLabel.innerText = 'Max Iterations';
    document.body.appendChild(oLabel);
    document.body.appendChild(oInput);

};

let nMaxIterations = 4;
const oCanvas = createCanvas();

const main = function () {

    createControls();
    draw();

};

main();