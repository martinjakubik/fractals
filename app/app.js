import { createButton, createCanvas, createCheckbox, createDiv, createNumberInput, createSlider, setBlockVisibility } from './learnhypertext.mjs';
import { Zoomer } from './zoomer.mjs';
import { Mandelbrot } from './mandelbrot.mjs';

const FILL_COLOR_EMPTY = '#000';
const STROKE_COLOR_DEBUG = '#aaa';
const STROKE_COLOR_NORMAL = 'rgba(250, 240, 240, 0.3)';
const MANDELBROT_PIXEL_SIZE = 1;

const VERTICAL_MARGIN = 36;

const ZOOM_MULTIPLIER = 2;

const CONTROL_STATE = {
    VIEW: 0,
    CHOOSE_ZOOM: 1,
    ZOOMED_IN: 2,
    ZOOMED_OUT: 3
};

function round (num, decimalPlaces = 0) {
    var p = Math.pow(10, decimalPlaces);
    var n = (num * p) * (1 + Number.EPSILON);
    return Math.round(n) / p;
}

const onTapCanvas = function (oEvent) {
    const nTapX = oEvent.offsetX;
    const nTapY = oEvent.offsetY;

    handleTap(nTapX, nTapY, oCurrentTransform);
};

const handleTap = function (nTapX, nTapY, oCurrentTransform) {
    const oZoomControlCenterPoint = oTapPoint;
    const bIsTapInZoomInButton = Zoomer.isPointInZoomInButton(nTapX, nTapY, oZoomControlCenterPoint);
    const bIsTapInZoomOutButton = Zoomer.isPointInZoomOutButton(nTapX, nTapY, oZoomControlCenterPoint);
    updateControlState(bIsTapInZoomInButton, bIsTapInZoomOutButton);

    if (sControlState === CONTROL_STATE.VIEW) {
        Zoomer.hideZoomButtons(oControlCanvas);
    } else if (sControlState === CONTROL_STATE.CHOOSE_ZOOM) {
        const oControlContext = oControlCanvas.getContext('2d');
        Zoomer.showZoomButtons(nTapX, nTapY, oControlContext, STROKE_COLOR_NORMAL);
        oTapPoint = {
            x: nTapX,
            y: nTapY
        };
        const cFromXY = Mandelbrot.getComplexNumberFromPoint(oTapPoint, oCurrentTransform);
        setCenterRealInputValue(cFromXY.real);
        setCenterImaginaryInputValue(cFromXY.imaginary);
    } else if (sControlState === CONTROL_STATE.ZOOMED_IN || sControlState === CONTROL_STATE.ZOOMED_OUT) {
        Zoomer.hideZoomButtons(oControlCanvas);
        if (sControlState === CONTROL_STATE.ZOOMED_IN) {
            oCurrentTransform.zoom = oCurrentTransform.zoom * ZOOM_MULTIPLIER;
        } else if (sControlState === CONTROL_STATE.ZOOMED_OUT) {
            oCurrentTransform.zoom = oCurrentTransform.zoom / ZOOM_MULTIPLIER;
        }
        oCurrentTransform.pan.horizontal = -(oCurrentTransform.zoom * c.real - oCanvasCenter.x);
        oCurrentTransform.pan.vertical = -(oCurrentTransform.zoom * c.imaginary - oCanvasCenter.y);
        drawGraphics(oCurrentTransform, nPixelSize);
        sControlState = CONTROL_STATE.VIEW;

        oPreviousTapPoint.x = nTapX;
        oPreviousTapPoint.y = nTapY;
    }
};

const updateControlState = function (bIsTapInZoomInButton, bIsTapInZoomOutButton) {
    switch (sControlState) {
    case CONTROL_STATE.VIEW:
        sControlState = CONTROL_STATE.CHOOSE_ZOOM;
        return;
    case CONTROL_STATE.ZOOMED_IN:
    case CONTROL_STATE.CHOOSE_ZOOM:
        if (bIsTapInZoomInButton) {
            sControlState = CONTROL_STATE.ZOOMED_IN;
        } else if (bIsTapInZoomOutButton) {
            sControlState = CONTROL_STATE.ZOOMED_OUT;
        } else {
            sControlState = CONTROL_STATE.VIEW;
        }
        return;
    }
};

const drawGraphics = function (oTransform, nPixelSize) {
    const oGraphicContext = oGraphicCanvas.getContext('2d');
    oGraphicContext.clearRect(0, 0, oGraphicCanvas.width, oGraphicCanvas.height);
    Mandelbrot.drawMandelbrotSet(oTransform, nPrecision, oGraphicCanvas, oDebugCanvas, STROKE_COLOR_DEBUG, nHue, oTapPoint, nPixelSize, nPixelSize, IS_DEBUG);
};

const setCenterRealInputValue = function (nRealValue) {
    c.real = nRealValue;
    const oCenterRealNumberInput = document.getElementById('centerreal');
    oCenterRealNumberInput.value = nRealValue;
};

const setCenterImaginaryInputValue = function (nImaginaryValue) {
    c.imaginary = nImaginaryValue;
    const oCenterImaginaryNumberInput = document.getElementById('centerimaginary');
    oCenterImaginaryNumberInput.value = nImaginaryValue;
};

const handleDraw = function (oTransform, nPixelSize) {
    drawGraphics(oTransform, nPixelSize);
};

const createControls = function (oTransform) {
    const oControlBar = document.createElement('div');
    oControlBar.classList.add('controlBar');
    appBox.appendChild(oControlBar);

    const oPrecisionSlider = createSlider('precision', '0', '1000', nPrecision, 'Precision', null, oControlBar);

    oPrecisionSlider.onchange = () => {
        nPrecision = oPrecisionSlider.value;
        drawGraphics(oTransform, nPixelSize);
    };

    const oHueSlider = createSlider('hue', '0', '359', nHue, 'Hue', null, oControlBar);

    oHueSlider.onchange = () => {
        nHue = oHueSlider.value;
        drawGraphics(oTransform, nPixelSize);
    };

    const oPixelSizeSlider = createSlider('pixelSize', '1', '4', nPixelSize, 'Pixel Size', null, oControlBar);

    oPixelSizeSlider.onchange = () => {
        const parsed = parseInt(oPixelSizeSlider.value, 10);
        if (isNaN(parsed)) {
            nPixelSize = 1;
        } else {
            nPixelSize = parsed;
        }
        drawGraphics(oTransform, nPixelSize);
    };

    const oCenterRealNumberInput = createNumberInput('centerreal', c.real, 'center real', oControlBar);

    oCenterRealNumberInput.onkeyup = (oEvent) => {
        if (oEvent.keyCode === 13) {
            const c = {
                real: oCenterRealNumberInput.value,
                imaginary: oCenterImaginaryNumberInput.value
            };
            oTransform.pan.horizontal = oTransform.zoom * c.real - oCanvasCenter.x;
            handleDraw(oTransform);
        }
    };

    const oCenterImaginaryNumberInput = createNumberInput('centerimaginary', c.imaginary, 'center imagin', oControlBar);

    oCenterImaginaryNumberInput.onkeyup = (oEvent) => {
        if (oEvent.keyCode === 13) {
            const c = {
                real: oCenterRealNumberInput.value,
                imaginary: oCenterImaginaryNumberInput.value
            };
            oTransform.pan.vertical = oTransform.zoom * c.imaginary - oCanvasCenter.y;
            handleDraw(oTransform);
        }
    };

    const oDrawButton = createButton('draw', 'Draw', oControlBar);

    oDrawButton.onclick = () => {
        handleDraw(oTransform);
    };

    const oDebugCheckbox = createCheckbox('debug', IS_DEBUG, 'Debug', oControlBar);

    oDebugCheckbox.onchange = () => {
        IS_DEBUG = oDebugCheckbox.checked;
        const oParams = new URLSearchParams(document.location.search);
        oParams.set('debug', IS_DEBUG);
        document.location.search = oParams.toString();
        const sStyle = setBlockVisibility(IS_DEBUG);
        oDebugCanvas.style = sStyle;
        oDebugDrawCanvas.style = sStyle;
        drawGraphics(oCurrentTransform, nPixelSize);
    };
};

const createPage = function (oParent) {
    const oPage = createDiv('page', oParent);
    const nParentWidth = oPage.parentNode.clientWidth;
    const nParentHeight = oPage.parentNode.clientHeight;

    oPage.style.width = nParentWidth;
    oPage.style.height = nParentHeight - 2 * VERTICAL_MARGIN;

    const nMarginSide = Math.floor((nParentWidth - oPage.width) / 2);
    const sMarginSide = nMarginSide + "px";
    const sMarginVertical = VERTICAL_MARGIN + "px";

    oPage.style.marginLeft = sMarginSide;
    oPage.style.marginRight = sMarginSide;
    oPage.style.marginTop = sMarginVertical;
    oPage.style.marginBottom = sMarginVertical;

    return oPage;
};

const onMouseMoveOnCanvas = function (oEvent) {
    if (IS_DEBUG) {
        showDebugInfo(oEvent.offsetX, oEvent.offsetY);
    }
};

const clearOldDebugInfoBox = function (fromX, fromY, nWidth, nHeight) {
    const oContext = oDebugDrawCanvas.getContext('2d');
    oContext.clearRect(fromX + 10, fromY, nWidth, nHeight);
};

const drawNewDebugInfoBox = function (fromX, fromY, nWidth, nHeight) {
    const oContext = oDebugDrawCanvas.getContext('2d');
    oContext.fillStyle = FILL_COLOR_EMPTY;
    oContext.fillRect(fromX + 10, fromY, nWidth, nHeight);

    const sDebugText1 = `x:${fromX}, y:${fromY}`;
    const oTransformedPoint = Mandelbrot.transformXY(fromX, fromY, oCurrentTransform);
    const sDebugText2 = `r:${round(oTransformedPoint.x, 6)}, i:${round(oTransformedPoint.y, 6)}`;
    const sDebugText3 = `zoom:${oCurrentTransform.zoom}`;
    oContext.fillStyle = STROKE_COLOR_DEBUG;
    oContext.fillText(sDebugText1, fromX + 10, fromY + 10);
    oContext.fillText(sDebugText2, fromX + 10, fromY + 24);
    oContext.fillText(sDebugText3, fromX + 10, fromY + 38);
};

const showDebugInfo = function (oEventOffsetX, oEventOffsetY) {
    const nTextBoxWidth = 120;
    const nTextBoxHeight = 42;

    clearOldDebugInfoBox(oPreviousMousePosition.x + 10, oPreviousMousePosition.y, nTextBoxWidth, nTextBoxHeight);
    drawNewDebugInfoBox(oEventOffsetX + 10, oEventOffsetY, nTextBoxWidth, nTextBoxHeight);

    oPreviousMousePosition.x = oEventOffsetX;
    oPreviousMousePosition.y = oEventOffsetY;
};

let appBox;

const makeAppBox = function () {
    appBox = document.getElementById('app');
    if (!appBox) {
        const oContainer = document.getElementById('container');
        let oParentElement = document.getElementsByTagName('body');
        if (oContainer) {
            oParentElement = oContainer;
        }
        appBox = createDiv('app', oParentElement);
        const nParentWidth = appBox.parentNode.clientWidth;
        const nParentHeight = document.body.clientHeight;

        appBox.style.width = nParentWidth + 'px';
        appBox.style.height = (nParentHeight - 2 * VERTICAL_MARGIN) + 'px';

        const nMarginSide = Math.floor((nParentWidth - appBox.width) / 2);
        const sMarginSide = nMarginSide + "px";

        appBox.style.marginLeft = sMarginSide;
        appBox.style.marginRight = sMarginSide;
    }
};

const oParams = new URLSearchParams(document.location.search);
const sIsDebug = oParams.get('debug', false);
const bIsDebug = decodeURI(sIsDebug) === 'true';

let IS_DEBUG = bIsDebug;

makeAppBox();
const oPage = createPage(appBox);

const oGraphicCanvas = createCanvas('graphicCanvas', '', 0, oPage);

const oDebugCanvas = createCanvas('debugCanvas', '', 1, oPage);
oDebugCanvas.style = setBlockVisibility(IS_DEBUG);

const oDebugDrawCanvas = createCanvas('debugDrawCanvas', '', 2, oPage);
oDebugDrawCanvas.style = setBlockVisibility(IS_DEBUG);

const oControlCanvas = createCanvas('controlCanvas', '', 3, oPage);
oControlCanvas.addEventListener('mousemove', onMouseMoveOnCanvas);
oControlCanvas.addEventListener('click', onTapCanvas);

const oCanvasCenter = {
    x: oGraphicCanvas.width / 2,
    y: oGraphicCanvas.height / 2
};

let nPrecision = 85;
let nHue = Math.floor(Math.random() * 360);
let nPixelSize = MANDELBROT_PIXEL_SIZE;
let oCurrentTransform = {
    pan: {
        horizontal: oCanvasCenter.x,
        vertical: oCanvasCenter.y
    },
    zoom: 100
};

let sControlState = CONTROL_STATE.VIEW;

let oPreviousTapPoint = oCanvasCenter;

let oTapPoint = oCanvasCenter;

let oPreviousMousePosition = oCanvasCenter;

let c = Mandelbrot.getComplexNumberFromPoint(oCanvasCenter, oCurrentTransform);

const main = function () {
    createControls(oCurrentTransform);

    setCenterRealInputValue(c.real);
    setCenterImaginaryInputValue(c.imaginary);

    drawGraphics(oCurrentTransform, nPixelSize);
};

main();