const CANVAS_WIDTH = 1520;
const CANVAS_HEIGHT = 600;
const VERTICAL_MARGIN = 36;

const SMALL_VALUE = 5;

const degreeInMandelbrotSet = function (x, y) {

    let iRealComponent = x;
    let iImaginaryComponent = y;

    let j = 0;
    for (j = 0; j < nPrecision; j++) {

        let iTempRealComponent = iRealComponent * iRealComponent - iImaginaryComponent * iImaginaryComponent + x;
        let iTempImaginaryComponent = 2 * iRealComponent * iImaginaryComponent + y;

        iRealComponent = iTempRealComponent;
        iImaginaryComponent = iTempImaginaryComponent;

        if (iRealComponent * iImaginaryComponent > SMALL_VALUE) {
            return j / nPrecision * 100;
        }

    }

    return 0;

};

const draw = function () {

    const oContext = oCanvas.getContext('2d');

    let x = 0;
    let y = 0;
    for (x = 0; x < oCanvas.width; x++) {
        for (y = 0; y < oCanvas.height; y++) {
            const iTransformedX = x / nZoom - nHorizontalPan;
            const iTransformedY = y / nZoom - nVerticalPan;
            const nDegreeInSet = degreeInMandelbrotSet(iTransformedX, iTransformedY);
            if (nDegreeInSet == 0) {
                oContext.fillStyle = '#000';
                oContext.fillRect(x, y, 1, 1);
            } else {
                oContext.fillStyle = `hsl(${nHue}, 100%, ${nDegreeInSet}%)`;
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

const createSlider = function (sId, sMin, sMax, nValue, sLabel) {

    const sName = sId;

    const oInput = document.createElement('input');
    oInput.type = 'range';
    oInput.id = sId;
    oInput.name = sName;
    oInput.min = sMin;
    oInput.max = sMax;
    oInput.value = nValue;
    
    const oLabel = document.createElement('label');
    oLabel.for = sId;
    oLabel.innerText = sLabel;

    document.body.appendChild(oLabel);
    document.body.appendChild(oInput);

    return oInput;

};

const createControls = function () {

    const oMaxIterationSlider = createSlider('precision', '0', '100', nPrecision, 'Precision');
    oMaxIterationSlider.onchange = () => {
        nPrecision = oMaxIterationSlider.value;
        draw();
    };

    const oHueSlider = createSlider('hue', '0', '359', nHue, 'Hue');
    oHueSlider.onchange = () => {
        nHue = oHueSlider.value;
        draw();
    };

    const oZoomSlider = createSlider('zoom', '180', '1000', nZoom, 'Zoom');
    oZoomSlider.onchange = () => {
        nZoom = oZoomSlider.value;
        draw();
    };

    const oHorizontalPanSlider = createSlider('horizontalPan', '1', '5', nHorizontalPan, 'Pan X');
    oHorizontalPanSlider.onchange = () => {
        nHorizontalPan = oHorizontalPanSlider.value;
        draw();
    };

    const oVerticalPanSlider = createSlider('verticalPan', '1', '5', nVerticalPan, 'Pan Y');
    oVerticalPanSlider.onchange = () => {
        nVerticalPan = oVerticalPanSlider.value;
        draw();
    };

};

let nPrecision = 4;
let nHue = 0;
let nZoom = 200;
let nHorizontalPan = 4;
let nVerticalPan = 0.5;

const oCanvas = createCanvas();

const main = function () {

    createControls();
    draw();

};

main();