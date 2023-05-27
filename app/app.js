import { createButton, createCanvas, createCheckbox, createDiv, createNumberInput, createSlider, setBlockVisibility } from './learnhypertext.mjs';
import { Zoomer } from './zoomer.mjs';
import { Mandelbrot } from './mandelbrot.mjs';
import { palette } from './palette.mjs';

const THEME = 0;
const FILL_COLOR_EMPTY = palette[THEME].bgColors[0];
const STROKE_COLOR_NORMAL = palette[THEME].fgColors[1];
const STROKE_COLOR_DEBUG = palette[THEME].fgColors[2];
const MANDELBROT_PIXEL_SIZE = 1;

const MEDIA_QUERY_MOBILE_MAX_WIDTH = 480;

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const isMobile = function () {
    const nClientWidth = document.body.clientWidth;
    return nClientWidth <= MEDIA_QUERY_MOBILE_MAX_WIDTH;
};

const formatDecimal = function (n) {
    return `${n < 0 ? '-' : '+'}${Math.abs(Math.floor(n * 1000) / 1000)}`;
};

const getNowKey = function () {
    const oNow = new Date();
    const sMonth = MONTHS_SHORT[oNow.getUTCMonth()];
    const sRealFloor = formatDecimal(c.real);
    const sImagFloor = formatDecimal(c.imaginary);
    const sNowLabel = `${sMonth}.${oNow.getDate()}-real${sRealFloor}-imag${sImagFloor}-zoom${Math.floor(oCurrentTransform.zoom)}`;
    return sNowLabel;
};

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
        c.real = cFromXY.real;
        c.imaginary = cFromXY.imaginary;
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
    Mandelbrot.drawMandelbrotSet(oTransform, nPrecision, oGraphicCanvas, nHue, THEME, oTapPoint, nPixelSize, nPixelSize);
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

    const oScreenshotButton = createButton('screenshot', 'screenshot', oControlBar);
    oScreenshotButton.onclick = () => {
        const sKey = getNowKey();
        const a = document.createElement('a');
        a.href = oGraphicCanvas.toDataURL('image/png', 1);
        a.download = `fractals-${sKey}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
};

const createPage = function (oParent) {
    const oPage = createDiv('page', oParent);
    const nParentWidth = oPage.parentNode.clientWidth;
    const nParentHeight = oPage.parentNode.clientHeight;

    oPage.style.width = nParentWidth;
    let nMarginTop = VERTICAL_MARGIN;
    if (isMobile()) {
        oPage.style.height = nParentHeight - 4 * VERTICAL_MARGIN;
        nMarginTop = 0;
    } else {
        oPage.style.height = nParentHeight - 2 * VERTICAL_MARGIN;
    }

    const nMarginSide = Math.floor((nParentWidth - oPage.style.width) / 2);
    const sMarginSide = nMarginSide + "px";
    const sMarginVertical = VERTICAL_MARGIN + "px";
    const sMarginTop = nMarginTop + "px";

    oPage.style.marginLeft = sMarginSide;
    oPage.style.marginRight = sMarginSide;
    oPage.style.marginTop = sMarginTop;
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
        let oParentElement = document.body;
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

const oControlCanvas = createCanvas('controlCanvas', '', 3, oPage);
oControlCanvas.addEventListener('mousemove', onMouseMoveOnCanvas);
oControlCanvas.addEventListener('click', onTapCanvas);

const oCanvasCenter = {
    x: oGraphicCanvas.width / 2,
    y: oGraphicCanvas.height / 2
};

let nPrecision = 85;
const aHues = [34, 192, 322];
let nHue = aHues[Math.floor(Math.random() * aHues.length)];
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

    drawGraphics(oCurrentTransform, nPixelSize);
};

main();