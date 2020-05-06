const CANVAS_HEIGHT = 600;
const VERTICAL_MARGIN = 36;
const ZOOM_LENS_RADIUS = 50;
const ZOOM_BUTTON_RADIUS = ZOOM_LENS_RADIUS / 4;

const SMALL_VALUE = 5;
const STROKE_NORMAL = '#aaa';

const CONTROL_STATE = {
    VIEW: 0,
    CHOOSE_ZOOM: 1,
    ZOOMED_IN: 2
};

const degreeInMandelbrotSet = function (iRealComponent, iImaginaryComponent) {

    let iIncrementalRealComponent = iRealComponent;
    let iInrementalImaginaryComponent = iImaginaryComponent;

    let j = 0;
    for (j = 0; j < nPrecision; j++) {

        let iTempRealComponent = iIncrementalRealComponent * iIncrementalRealComponent - iInrementalImaginaryComponent * iInrementalImaginaryComponent + iRealComponent;
        let iTempImaginaryComponent = 2 * iIncrementalRealComponent * iInrementalImaginaryComponent + iImaginaryComponent;

        iIncrementalRealComponent = iTempRealComponent;
        iInrementalImaginaryComponent = iTempImaginaryComponent;

        if (iIncrementalRealComponent * iInrementalImaginaryComponent > SMALL_VALUE) {
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

            const iRealComponent = (x - nHorizontalPan) / nZoom;
            const iImaginaryComponent = (y - nVerticalPan) / nZoom;

            if (x % 100 === 0 && y % 100 === 0) {
                // console.log(`${iRealComponent}\t\t${iImaginaryComponent}`);
            }

            const nDegreeInSet = degreeInMandelbrotSet(iRealComponent, iImaginaryComponent);
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

const updateControlState = function (bIsTapInZoomInButton) {

    switch (sControlState) {
        case CONTROL_STATE.VIEW:
            sControlState = CONTROL_STATE.CHOOSE_ZOOM;
            return;
        case CONTROL_STATE.ZOOMED_IN:
        case CONTROL_STATE.CHOOSE_ZOOM:
            if (bIsTapInZoomInButton) {
                sControlState = CONTROL_STATE.ZOOMED_IN;
                return;
            }
        default:
            sControlState = CONTROL_STATE.VIEW;
            return;
    };

};

const isTapInZoomInButton = function (nTapX, nTapY) {

    return (Math.sqrt((nTapX - oTapPoint.x) ** 2 + (nTapY - oTapPoint.y) ** 2) < ZOOM_BUTTON_RADIUS);

};

const handleTap = function (nTapX, nTapY) {

    const bIsTapInZoomInButton = isTapInZoomInButton(nTapX, nTapY);
    updateControlState(bIsTapInZoomInButton);
    
    if (sControlState === CONTROL_STATE.VIEW) {
        hideZoomControl();
    } else if (sControlState === CONTROL_STATE.CHOOSE_ZOOM) {
        showZoomButtons(nTapX, nTapY);
        oTapPoint = {
            x: nTapX,
            y: nTapY
        }
        console.log(`tapped at x ${oTapPoint.x}\t\ty: ${oTapPoint.y}`);
    } else if (sControlState === CONTROL_STATE.ZOOMED_IN) {
        nZoom = nZoom * 1;
        const nHorizontalOffset = oTapPoint.x - oGraphicCanvas.width / 2;
        nHorizontalPan = nHorizontalPan + nHorizontalOffset;
        // nVerticalPan = (oTapPoint.y - oGraphicCanvas.height);
        console.log(`horizontal offset: ${nHorizontalOffset}\t\thorizontal pan: ${nHorizontalPan}\t\tvertical pan: ${nVerticalPan}`);
        drawMandelbrotSet();
    }

};

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

const onTapCanvas = function (oEvent) {

    const nTapX = oEvent.x;
    const nTapY = oEvent.y - VERTICAL_MARGIN;

    handleTap(nTapX, nTapY);

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

let nPrecision = 70;
let nHue = 0;
let nZoom = 200;
let nHorizontalPan = 3 * nZoom;
let nVerticalPan = 0.5 *nZoom;

let sControlState = CONTROL_STATE.VIEW;

const oPage = createPage();
const oGraphicCanvas = createGraphicCanvas(oPage);
const oControlCanvas = createControlCanvas(oPage);

let oTapPoint = {
    x: oGraphicCanvas.width / 2,
    y: oGraphicCanvas.height / 2
}

const main = function () {

    createControls();
    drawMandelbrotSet();

};

main();