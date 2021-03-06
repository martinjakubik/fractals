const CANVAS_HEIGHT = 600;
const VERTICAL_MARGIN = 36;
const ZOOM_LENS_RADIUS = 50;
const ZOOM_BUTTON_RADIUS = ZOOM_LENS_RADIUS / 4;
const ZOOM_OUT_BUTTON_DISTANCE = 120;

const ZOOM_MULTIPLIER = 2;

const SMALL_VALUE = 5;
const STROKE_NORMAL = '#aaa';

const CONTROL_STATE = {
    VIEW: 0,
    CHOOSE_ZOOM: 1,
    ZOOMED_IN: 2,
    ZOOMED_OUT: 3
};

const getComplexNumberFromPoint = function (x, y, nHorizontalPan, nVerticalPan, nZoom) {

    const oComplexNumber = {
        real: (x - nHorizontalPan) / nZoom,
        imaginary: (y - nVerticalPan) / nZoom
    }

    return oComplexNumber;

};

const getPointFromComplexNumber = function (c, nHorizontalPan, nVerticalPan, nZoom) {

    const oPoint = {
        x: c.real * nZoom + nHorizontalPan,
        y: c.imaginary * nZoom + nVerticalPan
    };

    return oPoint;

};

const degreeInMandelbrotSet = function (c) {

    let iIncrementalRealComponent = c.real;
    let iIncrementalImaginaryComponent = c.imaginary;

    let j = 0;
    for (j = 0; j < nPrecision; j++) {

        let iTempRealComponent = iIncrementalRealComponent * iIncrementalRealComponent - iIncrementalImaginaryComponent * iIncrementalImaginaryComponent + c.real;
        let iTempImaginaryComponent = 2 * iIncrementalRealComponent * iIncrementalImaginaryComponent + c.imaginary;

        iIncrementalRealComponent = iTempRealComponent;
        iIncrementalImaginaryComponent = iTempImaginaryComponent;

        if (iIncrementalRealComponent * iIncrementalImaginaryComponent > SMALL_VALUE) {
            return j / nPrecision * 100;
        }

    }

    return 0;

};

const drawMandelbrotSet = function (c, nZoom) {

    const oGraphicContext = oGraphicCanvas.getContext('2d');
    const oDebugContext = oDebugCanvas.getContext('2d');
    const nDebugCanvasWidth = oDebugCanvas.parentNode.clientWidth;

    nHorizontalPan = c.real * nZoom;
    nVerticalPan = c.imaginary * nZoom;

    let x = 0;
    let y = 0;
    let sDebugText = '';
    oDebugContext.font = '8pt sans-serif';

    oDebugContext.clearRect(0, 0, nDebugCanvasWidth, CANVAS_HEIGHT);

    sDebugText = `precision: ${nPrecision} pan:${(nHorizontalPan)} zoom: ${nZoom} pan/zoom:${(nHorizontalPan / nZoom)} last click: ${oGraphicCanvas.width - nHorizontalPan} center point: ${((oGraphicCanvas.width / 2) - nHorizontalPan) / nZoom}`;
    oDebugContext.fillStyle = '#fff';
    oDebugContext.fillText(sDebugText, 800, 580);

    for (x = 0; x < oGraphicCanvas.width; x++) {
        for (y = 0; y < oGraphicCanvas.height; y++) {

            const c = getComplexNumberFromPoint(x, y, nHorizontalPan, nVerticalPan, nZoom);

            // debug
            if (x % 200 === 0 && y % 200 === 0) {
                sDebugText = `x:${x}, r:${c.real}`;
                oDebugContext.fillStyle = '#fff';
                oDebugContext.fillText(sDebugText, x, y);
            }

            const nDegreeInSet = degreeInMandelbrotSet(c);
            if (nDegreeInSet == 0) {
                oGraphicContext.fillStyle = '#000';
                oGraphicContext.fillRect(x, y, 1, 1);
            } else {
                oGraphicContext.fillStyle = `hsl(${nHue}, 100%, ${nDegreeInSet}%)`;
                oGraphicContext.fillRect(x, y, 1, 1);
            }
        }
    }

}

const updateControlState = function (bIsTapInZoomInButton, bIsTapInZoomOutButton) {

    switch (sControlState) {
        case CONTROL_STATE.VIEW:
            sControlState = CONTROL_STATE.CHOOSE_ZOOM;
            return;
        case CONTROL_STATE.ZOOMED_IN:
        case CONTROL_STATE.CHOOSE_ZOOM:
            if (bIsTapInZoomInButton) {
                sControlState = CONTROL_STATE.ZOOMED_IN;
                return;
            } else if (bIsTapInZoomOutButton) {
                sControlState = CONTROL_STATE.ZOOMED_OUT;
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

const isTapInZoomOutButton = function (nTapX, nTapY) {

    const x1 = nTapX - ZOOM_OUT_BUTTON_DISTANCE;
    const x2 = nTapX + ZOOM_OUT_BUTTON_DISTANCE;
    const y1 = nTapY - ZOOM_OUT_BUTTON_DISTANCE;
    const y2 = nTapY + ZOOM_OUT_BUTTON_DISTANCE;

    return (Math.sqrt((x1 - oTapPoint.x) ** 2 + (nTapY - oTapPoint.y) ** 2) < ZOOM_BUTTON_RADIUS)
        || (Math.sqrt((x2 - oTapPoint.x) ** 2 + (nTapY - oTapPoint.y) ** 2) < ZOOM_BUTTON_RADIUS)
        || (Math.sqrt((nTapX - oTapPoint.x) ** 2 + (y1 - oTapPoint.y) ** 2) < ZOOM_BUTTON_RADIUS)
        || (Math.sqrt((nTapX - oTapPoint.x) ** 2 + (y2 - oTapPoint.y) ** 2) < ZOOM_BUTTON_RADIUS);

};

const handleTap = function (nTapX, nTapY) {

    const bIsTapInZoomInButton = isTapInZoomInButton(nTapX, nTapY);
    const bIsTapInZoomOutButton = isTapInZoomOutButton(nTapX, nTapY);
    updateControlState(bIsTapInZoomInButton, bIsTapInZoomOutButton);
    
    if (sControlState === CONTROL_STATE.VIEW) {

        hideZoomControl();

    } else if (sControlState === CONTROL_STATE.CHOOSE_ZOOM) {

        showZoomButtons(nTapX, nTapY);
        oTapPoint = {
            x: nTapX,
            y: nTapY
        }
        const c = getComplexNumberFromPoint(oTapPoint.x, oTapPoint.y, nHorizontalPan, nVerticalPan, nZoom);
        setCenterRealInputValue(c.real);
        setCenterImaginaryInputValue(c.imaginary);

    } else if (sControlState === CONTROL_STATE.ZOOMED_IN || sControlState === CONTROL_STATE.ZOOMED_OUT) {

        hideZoomControl();
        if (sControlState === CONTROL_STATE.ZOOMED_IN) {
            nZoom = nZoom * ZOOM_MULTIPLIER;
        } else if (sControlState === CONTROL_STATE.ZOOMED_OUT) {
            nZoom = nZoom / ZOOM_MULTIPLIER;
        }
        const nHorizontalOffset = oTapPoint.x - oPreviousTapPoint.x;
        const nVerticalOffset = oTapPoint.y - oPreviousTapPoint.y;
        nHorizontalPan = nHorizontalPan - nHorizontalOffset;
        nVerticalPan = nVerticalPan - nVerticalOffset;
        drawMandelbrotSet(c, nZoom);
        sControlState = CONTROL_STATE.VIEW;

        oPreviousTapPoint.x = nTapX;
        oPreviousTapPoint.y = nTapY;

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
    const x1 = x - ZOOM_OUT_BUTTON_DISTANCE;
    const x2 = x + ZOOM_OUT_BUTTON_DISTANCE;
    const y1 = y - ZOOM_OUT_BUTTON_DISTANCE;
    const y2 = y + ZOOM_OUT_BUTTON_DISTANCE;

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

    const nZindex = 2;
    const oCanvas = createCanvas('controlCanvas', nZindex, oPage);
    oCanvas.onclick = onTapCanvas;

    return oCanvas;
    
};

const createDebugCanvas = function (oPage) {

    const nZindex = 1;
    const oCanvas = createCanvas('debugCanvas', nZindex, oPage);
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

const createCheckbox = function (sId, bValue, sLabel) {

    const sName = sId;

    const oInput = document.createElement('input');
    oInput.type = 'checkbox';
    oInput.id = sId;
    oInput.name = sName;
    oInput.value = bValue;

    const oLabel = document.createElement('label');
    oLabel.for = sId;
    oLabel.innerText = sLabel;

    document.body.appendChild(oLabel);
    document.body.appendChild(oInput);

    return oInput;

};

const createNumberInput = function (sId, nValue, sLabel) {

    const oInput = document.createElement('input');
    oInput.type = 'number';
    oInput.id = sId;
    oInput.value = nValue;

    const oLabel = document.createElement('label');
    oLabel.for = sId;
    oLabel.innerText = sLabel;

    document.body.appendChild(oLabel);
    document.body.appendChild(oInput);

    return oInput;

};

const createButton = function (sId, sLabel) {

    const oButton = document.createElement('button');
    oButton.id = sId;
    oButton.innerText = sLabel;

    document.body.appendChild(oButton);

    return oButton;

};

const setBlockVisibility = function (bVisible)  {

    let sStyle = 'position: absolute';
    sStyle += bVisible ? '; display: block' : '; display: none';
    return sStyle;

};

const setCenterRealInputValue = function (nRealValue) {
    const oCenterRealNumberInput = document.getElementById('centerreal');
    oCenterRealNumberInput.value = nRealValue;
}

const setCenterImaginaryInputValue = function (nImaginaryValue) {
    const oCenterImaginaryNumberInput = document.getElementById('centerimaginary');
    oCenterImaginaryNumberInput.value = nImaginaryValue;
}

const getCenterRealInputValue = function () {
    const oCenterRealNumberInput = document.getElementById('centerreal');
    return oCenterRealNumberInput.value;
}

const getCenterImaginaryInputValue = function () {
    const oCenterImaginaryNumberInput = document.getElementById('centerimaginary');
    return oCenterImaginaryNumberInput.value;
}

const createControls = function () {

    const oPrecisionSlider = createSlider('precision', '0', '1000', nPrecision, 'Precision');
    oPrecisionSlider.onchange = () => {
        nPrecision = oPrecisionSlider.value;
        drawMandelbrotSet(c, nZoom);
    };

    const oHueSlider = createSlider('hue', '0', '359', nHue, 'Hue');
    oHueSlider.onchange = () => {
        nHue = oHueSlider.value;
        drawMandelbrotSet(c, nZoom);
    };

    createNumberInput('centerreal', 0, 'Center real');
    createNumberInput('centerimaginary', 0, 'Imaginary');

    const oDrawButton = createButton('draw', 'Draw');
    oDrawButton.onclick = () => {
        drawMandelbrotSet(c, nZoom);
    };

    const oDebugCheckbox = createCheckbox('debug', DEBUG, 'Debug');
    oDebugCheckbox.onchange = () => {
        DEBUG = oDebugCheckbox.checked;
        const sStyle =setBlockVisibility(DEBUG);
        oDebugCanvas.style = sStyle;
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

let DEBUG = false;

const oPage = createPage();
const oGraphicCanvas = createGraphicCanvas(oPage);
const oDebugCanvas = createDebugCanvas(oPage);
oDebugCanvas.style = setBlockVisibility(DEBUG);
const oControlCanvas = createControlCanvas(oPage);

let nPrecision = 5;
let nHue = Math.floor(Math.random() * 360);
let nZoom = 200;
let nHorizontalPan = 3 * nZoom;
let nVerticalPan = 1.5 * nZoom;
let c = {
    real: ((oGraphicCanvas.width / 2) - nHorizontalPan) / nZoom,
    imaginary: ((oGraphicCanvas.height / 2) - nVerticalPan) / nZoom
};    

let sControlState = CONTROL_STATE.VIEW;

let oPreviousTapPoint = {
    x: oGraphicCanvas.width / 2,
    y: oGraphicCanvas.height / 2
}

let oTapPoint = {
    x: oGraphicCanvas.width / 2,
    y: oGraphicCanvas.height / 2
}

const main = function () {

    createControls();

    setCenterRealInputValue(c.real);
    setCenterImaginaryInputValue(c.imaginary);

    drawMandelbrotSet(c, nZoom);

};

main();