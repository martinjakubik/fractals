const CANVAS_HEIGHT = 600;
const VERTICAL_MARGIN = 36;
const ZOOM_LENS_RADIUS = 50;
const ZOOM_BUTTON_RADIUS = ZOOM_LENS_RADIUS / 4;

const SMALL_VALUE = 5;
const STROKE_NORMAL = '#aaa';

const CONTROL_STATE = {
    VIEW: 0,
    CHOOSE_ZOOM: 1
};

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

const drawMandelbrotSet = function () {

    const oContext = oGraphicCanvas.getContext('2d');

    let x = 0;
    let y = 0;
    for (x = 0; x < oGraphicCanvas.width; x++) {
        for (y = 0; y < oGraphicCanvas.height; y++) {

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

const drawZoomOutButton = function (x, y) {

    const oContext = oControlCanvas.getContext('2d');

    oContext.beginPath();
    oContext.arc(x, y, ZOOM_BUTTON_RADIUS, 0, Math.PI * 2);
    oContext.stroke();

    oContext.beginPath();
    oContext.moveTo(x - ZOOM_BUTTON_RADIUS * 0.66, y);
    oContext.lineTo(x + ZOOM_BUTTON_RADIUS * 0.66, y);
    oContext.stroke();

};

const showZoomButtons = function (x, y) {

    const oContext = oControlCanvas.getContext('2d');
    oContext.strokeStyle = STROKE_NORMAL;
    oContext.lineWidth = 5;

    // draws circle
    oContext.beginPath();
    oContext.arc(x, y, ZOOM_LENS_RADIUS, 0, Math.PI * 2);
    oContext.stroke();

    // draws zoom in button
    oContext.lineWidth = 3;
    oContext.beginPath();
    oContext.arc(x, y, ZOOM_BUTTON_RADIUS, 0, Math.PI * 2);
    oContext.stroke();

    oContext.beginPath();
    oContext.moveTo(x, y - ZOOM_BUTTON_RADIUS * 0.66);
    oContext.lineTo(x, y + ZOOM_BUTTON_RADIUS * 0.66);
    oContext.stroke();
    oContext.moveTo(x - ZOOM_BUTTON_RADIUS * 0.66, y);
    oContext.lineTo(x + ZOOM_BUTTON_RADIUS * 0.66, y);
    oContext.stroke();

    // draws zoom out buttons
    const nZoomOutButtonDistance = 120;
    const x1 = x - nZoomOutButtonDistance;
    const x2 = x + nZoomOutButtonDistance;
    const y1 = y - nZoomOutButtonDistance;
    const y2 = y + nZoomOutButtonDistance;

    drawZoomOutButton(x1, y);
    drawZoomOutButton(x2, y);
    drawZoomOutButton(x, y1);
    drawZoomOutButton(x, y2);

};

const hideZoomControl = function () {

    const oContext = oControlCanvas.getContext('2d');
    const nParentWidth = oControlCanvas.parentNode.clientWidth;
    oContext.clearRect(0, 0, nParentWidth, CANVAS_HEIGHT);

};

const updateControlState = function (sTransition) {

    switch (sControlState) {
        case CONTROL_STATE.VIEW:
            sControlState = CONTROL_STATE.CHOOSE_ZOOM;
            return;
        case CONTROL_STATE.CHOOSE_ZOOM:
        default:
            sControlState = CONTROL_STATE.VIEW;
            return;
    };

};

const isTapInZoomInButton = function (nTapX, nTapY) {

    return (Math.sqrt((nTapX - oZoomPoint.x) ** 2 + (nTapY - oZoomPoint.y) ** 2) < ZOOM_LENS_RADIUS);

};

const onTapCanvas = function (oEvent) {

    const nZoomToX = oEvent.x;
    const nZoomToY = oEvent.y - VERTICAL_MARGIN;

    const sTransition = 'tap';
    const bIsTapInZoomInButton = isTapInZoomInButton(nZoomToX, nZoomToY);
    updateControlState();
    
    if (sControlState === CONTROL_STATE.VIEW) {
        hideZoomControl();
        console.log(`is tap in zoom button: ${bIsTapInZoomInButton}`);
    } else if (sControlState === CONTROL_STATE.CHOOSE_ZOOM) {
        showZoomButtons(nZoomToX, nZoomToY);
        oZoomPoint = {
            x: nZoomToX,
            y: nZoomToY
        }
    }

};

const createCanvas = function (sCanvasId, nZindex, oPage) {

    const oCanvas = document.createElement('canvas');
    oCanvas.id = sCanvasId;
    oPage.appendChild(oCanvas);

    const nParentWidth = oCanvas.parentNode.clientWidth;

    oCanvas.width = nParentWidth;
    oCanvas.height = CANVAS_HEIGHT;

    oCanvas.style.position = 'absolute';
    oCanvas.style.zindex = nZindex;

    return oCanvas;

};

const createControlCanvas = function (oPage) {
    
    const nZindex = 1;
    const oCanvas = createCanvas('controlCanvas', nZindex, oPage);
    oCanvas.onclick = onTapCanvas;

    return oCanvas;

};

const createGraphicCanvas = function (oPage) {

    const nZindex = 0;
    const oCanvas = createCanvas('graphicCanvas', nZindex, oPage);
    return oCanvas;

};

const createSlider = function (sId, sMin, sMax, nValue, sLabel, nStep) {

    const sName = sId;

    const oInput = document.createElement('input');
    oInput.type = 'range';
    oInput.id = sId;
    oInput.name = sName;
    oInput.min = sMin;
    oInput.max = sMax;
    oInput.value = nValue;
    if (nStep) {
        oInput.step = nStep;
    }

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
        drawMandelbrotSet();
    };

    const oHueSlider = createSlider('hue', '0', '359', nHue, 'Hue');
    oHueSlider.onchange = () => {
        nHue = oHueSlider.value;
        drawMandelbrotSet();
    };

    const oZoomSlider = createSlider('zoom', '180', '10000', nZoom, 'Zoom');
    oZoomSlider.onchange = () => {
        nZoom = oZoomSlider.value;
        drawMandelbrotSet();
    };

    const oHorizontalPanSlider = createSlider('horizontalPan', '1', '5', nHorizontalPan, 'Pan X', 0.1);
    oHorizontalPanSlider.onchange = () => {
        nHorizontalPan = oHorizontalPanSlider.value;
        drawMandelbrotSet();
    };

    const oVerticalPanSlider = createSlider('verticalPan', '1', '5', nVerticalPan, 'Pan Y', 0.1);
    oVerticalPanSlider.onchange = () => {
        nVerticalPan = oVerticalPanSlider.value;
        drawMandelbrotSet();
    };

};

const createPage = function () {

    const oPage = document.createElement('div');
    oPage.id = 'page';
    document.body.appendChild(oPage);

    const nParentWidth = oPage.parentNode.clientWidth;

    oPage.style.width = nParentWidth;
    oPage.style.height = CANVAS_HEIGHT;

    const nMarginSide = Math.floor(( nParentWidth - oPage.width ) / 2 );
    const sMarginSide = nMarginSide + "px";
    const sMarginVertical = VERTICAL_MARGIN + "px";

    oPage.style.marginLeft = sMarginSide;
    oPage.style.marginRight = sMarginSide;
    oPage.style.marginTop = sMarginVertical;
    oPage.style.marginBottom = sMarginVertical;

    return oPage;

};

let nPrecision = 4;
let nHue = 0;
let nZoom = 200;
let nHorizontalPan = 4;
let nVerticalPan = 0.5;

let sControlState = CONTROL_STATE.VIEW;

const oPage = createPage();
const oGraphicCanvas = createGraphicCanvas(oPage);
const oControlCanvas = createControlCanvas(oPage);

let oZoomPoint = {
    x: oPage.style.width / 2,
    y: oPage.style.height / 2
}

const main = function () {

    createControls();
    drawMandelbrotSet();

};

main();