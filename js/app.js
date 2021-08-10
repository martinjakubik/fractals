import { createButton, createCanvas, createCheckbox, createDiv, createNumberInput, createSlider, setBlockVisibility } from '../../lib/js/learnhypertext.mjs';
import { Zoomer } from './zoomer.mjs';
import { Mandelbrot } from './mandelbrot.mjs';

const STROKE_COLOR_DEBUG = '#aaa';
const STROKE_COLOR_NORMAL = '#aaa';
const STROKE_COLOR_HIGHLIGHT = '#8ab';

const VERTICAL_MARGIN = 36;

const ZOOM_MULTIPLIER = 2;

const CONTROL_STATE = {
    VIEW: 0,
    CHOOSE_ZOOM: 1,
    ZOOMED_IN: 2,
    ZOOMED_OUT: 3
};

const onTapCanvas = function (oEvent) {

    const nTapX = oEvent.x;
    const nTapY = oEvent.y - VERTICAL_MARGIN;

    handleTap(nTapX, nTapY, oCurrentTransform, oImageDescription);

};

const handleTap = function (nTapX, nTapY, oCurrentTransform, oImageDescription) {

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
        const c = Mandelbrot.getComplexNumberFromPoint(oTapPoint, oCurrentTransform);
        const q = transformPixelPoint(oGraphicCanvas, nTapX, nTapY, oCurrentTransform, oImageDescription);
        setCenterRealInputValue(q.x);
        setCenterImaginaryInputValue(q.y);

    } else if (sControlState === CONTROL_STATE.ZOOMED_IN || sControlState === CONTROL_STATE.ZOOMED_OUT) {

        Zoomer.hideZoomButtons(oControlCanvas);
        if (sControlState === CONTROL_STATE.ZOOMED_IN) {
            oCurrentTransform.zoom = oCurrentTransform.zoom * ZOOM_MULTIPLIER;
        } else if (sControlState === CONTROL_STATE.ZOOMED_OUT) {
            oCurrentTransform.zoom = oCurrentTransform.zoom / ZOOM_MULTIPLIER;
        }
        const nHorizontalOffset = oTapPoint.x - oOrigin.x;
        const nVerticalOffset = oTapPoint.y - oOrigin.y;
        oCurrentTransform.pan.horizontal = oCurrentTransform.pan.horizontal - nHorizontalOffset;
        oCurrentTransform.pan.vertical = oCurrentTransform.pan.vertical - nVerticalOffset;
        drawGraphics(oCurrentTransform, oImageDescription);
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

const drawGraphics = function (oTransform, oImageDescription) {

    const oGraphicContext = oGraphicCanvas.getContext('2d');
    oGraphicContext.clearRect(0, 0, oGraphicCanvas.width, oGraphicCanvas.height);
    // Mandelbrot.drawMandelbrotSet(oTransform, nPrecision, oGraphicCanvas, oDebugCanvas, STROKE_COLOR_DEBUG, nHue, oTapPoint);
    drawImageOnCanvas(oTransform, oImageDescription);

};

const drawImageOnCanvas = function (oTransform, oImageDescription) {

    for (let x = 0; x < oImageDescription.width; x++) {
        for (let y = 0; y < oImageDescription.height; y++) {
            drawImagePixelOnCanvas(oGraphicCanvas, x, y, oTransform, oImageDescription);
        }
    }

};

const drawImagePixelOnCanvas = function (oDestinationCanvas, x, y, oTransform, oImageDescription) {

    const oDestinationContext = oDestinationCanvas.getContext('2d');
    const oTransformedPoint = transformPixelPoint(oDestinationCanvas, x, y, oTransform, oImageDescription);
    const index = (x * 4) + (y * 4) * oImageCanvas.width;
    let nPixelSize = oCurrentTransform.zoom < 2 ? oCurrentTransform.zoom : oCurrentTransform.zoom - 1;

    let rDecimal = oImageDescription.data[index];
    let gDecimal = oImageDescription.data[index + 1];
    let bDecimal = oImageDescription.data[index + 2];
    let alphaDecimal = oImageDescription.data[index + 3] / 255;
    let nDebugSpacing = 100 / oTransform.zoom;

    if (IS_DEBUG && (alphaDecimal === 0) && (x % nDebugSpacing === 0) && (y % nDebugSpacing === 0)) {
        rDecimal = 255;
        gDecimal = 255;
        bDecimal = 255;
        alphaDecimal = 0.9;
        nPixelSize = 1;

        const sDebugText = `${x},${y}`;
        oDestinationContext.fillStyle = STROKE_COLOR_DEBUG;
        oDestinationContext.fillText(sDebugText, oTransformedPoint.x + 10, oTransformedPoint.y + 10);
    }

    const sRGBA = `rgba(${rDecimal}, ${gDecimal}, ${bDecimal}, ${alphaDecimal})`;
    oDestinationContext.fillStyle = sRGBA;
    oDestinationContext.fillRect(oTransformedPoint.x, oTransformedPoint.y, nPixelSize, nPixelSize);

};

const transformPixelPoint = function (oDestinationCanvas, x, y, oTransform, oImageDescription) {

    const iDestinationCanvasHorizontalMiddle = oDestinationCanvas.width / 2;
    const iDestinationCanvasVerticalMiddle = oDestinationCanvas.height / 2;

    const iImageHorizontalMiddle = oImageDescription.width / 2 - oTransform.pan.horizontal;
    const iImageVerticalMiddle = oImageDescription.height / 2 - oTransform.pan.vertical;

    const iStartX = iDestinationCanvasHorizontalMiddle - iImageHorizontalMiddle * oTransform.zoom;
    const iStartY = iDestinationCanvasVerticalMiddle - iImageVerticalMiddle * oTransform.zoom;

    const oTransformedPoint = {
        x: iStartX + x * oTransform.zoom,
        y: iStartY + y * oTransform.zoom
    };

    return oTransformedPoint;

};

const setCenterRealInputValue = function (nRealValue) {
    const oCenterRealNumberInput = document.getElementById('centerreal');
    oCenterRealNumberInput.value = nRealValue;
};

const setCenterImaginaryInputValue = function (nImaginaryValue) {
    const oCenterImaginaryNumberInput = document.getElementById('centerimaginary');
    oCenterImaginaryNumberInput.value = nImaginaryValue;
};

const getCenterRealInputValue = function () {
    const oCenterRealNumberInput = document.getElementById('centerreal');
    return oCenterRealNumberInput.value;
};

const getCenterImaginaryInputValue = function () {
    const oCenterImaginaryNumberInput = document.getElementById('centerimaginary');
    return oCenterImaginaryNumberInput.value;
};

const handleEnterKeyInNumber = function (oTransform) {
    drawGraphics(oTransform, oImageDescription);
};

const handleDraw = function (oTransform) {
    drawGraphics(oTransform, oImageDescription);
};

const createControls = function (oTransform) {

    const oControlBar = document.createElement('div');
    oControlBar.classList.add('controlBar');
    document.body.appendChild(oControlBar);

    const oPrecisionSlider = createSlider('precision', '0', '1000', nPrecision, 'Precision', null, oControlBar);

    oPrecisionSlider.onchange = () => {
        nPrecision = oPrecisionSlider.value;
        drawGraphics(oTransform, oImageDescription);
    };

    const oHueSlider = createSlider('hue', '0', '359', nHue, 'Hue', null, oControlBar);

    oHueSlider.onchange = () => {
        nHue = oHueSlider.value;
        drawGraphics(oTransform, oImageDescription);
    };

    const oCenterRealNumberInput = createNumberInput('centerreal', 0, 'flower X', oControlBar);

    oCenterRealNumberInput.onkeyup = (oEvent) => {
        if (oEvent.keyCode === 13) {
            const c = {
                real: oCenterRealNumberInput.value,
                imaginary: oCenterImaginaryNumberInput.value
            };
            oTransform.pan.horizontal = (oGraphicCanvas.width / 2) - Mandelbrot.getPointFromComplexNumber(c, oTransform).x;
            handleDraw(oTransform);
        }
    };

    const oCenterImaginaryNumberInput = createNumberInput('centerimaginary', 0, 'flower Y', oControlBar);

    oCenterImaginaryNumberInput.onkeyup = (oEvent) => {
        if (oEvent.keyCode === 13) {
            const c = {
                real: oCenterRealNumberInput.value,
                imaginary: oCenterImaginaryNumberInput.value
            };
            oTransform.pan.vertical = Mandelbrot.getPointFromComplexNumber(c, oTransform).y;
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
        const sStyle = setBlockVisibility(IS_DEBUG);
        oDebugCanvas.style = sStyle;
        oDebugDrawCanvas.style = sStyle;
        drawGraphics(oCurrentTransform, oImageDescription);

    };

};

const createPage = function () {

    const oPage = createDiv('page');
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

    // Zoomer.onMouseMoveOnCanvas(oEvent.offsetX, oEvent.offsetY, oTapPoint, oControlCanvas, STROKE_COLOR_NORMAL, STROKE_COLOR_HIGHLIGHT);

    if (IS_DEBUG) {
        showDebugInfo(oEvent.offsetX, oEvent.offsetY);
    }

};

const clearOldDebugLine = function (fromX, fromY, toX, toY) {

    const oContext = oDebugDrawCanvas.getContext('2d');
    oContext.beginPath();
    oContext.lineWidth = 3;
    oContext.globalCompositeOperation = 'destination-out';
    oContext.moveTo(fromX, fromY);
    oContext.lineTo(toX, toY);
    oContext.closePath();
    oContext.stroke();
    oContext.globalCompositeOperation = 'source-over';

};

const drawNewDebugLine = function (fromX, fromY, toX, toY) {

    const oContext = oDebugDrawCanvas.getContext('2d');
    oContext.beginPath();
    oContext.strokeStyle = STROKE_COLOR_DEBUG;
    oContext.lineWidth = 1;
    oContext.moveTo(fromX, fromY);
    oContext.lineTo(toX, toY);
    oContext.closePath();
    oContext.stroke();

};

const clearOldDebugInfoBox = function (fromX, fromY, nWidth, nHeight) {

    const oContext = oDebugDrawCanvas.getContext('2d');
    oContext.clearRect(fromX + 10, fromY, nWidth, nHeight);

};

const drawNewDebugInfoBox = function (fromX, fromY, nWidth, nHeight) {

    const oContext = oDebugDrawCanvas.getContext('2d');
    oContext.fillStyle = '#000';
    oContext.fillRect(fromX + 10, fromY, nWidth, nHeight);

    const sDebugText1 = `x:${fromX}, y:${fromY}`;
    const oTransformedPoint = Mandelbrot.transformXY(fromX, fromY, oCurrentTransform);
    const sDebugText2 = `x:${oTransformedPoint.x}, y:${oTransformedPoint.y}`;
    const sDebugText3 = `zoom:${oCurrentTransform.zoom}`;
    oContext.fillStyle = STROKE_COLOR_DEBUG;
    oContext.fillText(sDebugText1, fromX + 10, fromY + 10);
    oContext.fillText(sDebugText2, fromX + 10, fromY + 24);
    oContext.fillText(sDebugText3, fromX + 10, fromY + 38);

};

const showDebugInfo = function (oEventOffsetX, oEventOffsetY) {

    const nTextBoxWidth = 120;
    const nTextBoxHeight = 42;

    clearOldDebugLine(oOrigin.x, oOrigin.y, oPreviousMousePosition.x, oPreviousMousePosition.y);
    drawNewDebugLine(oOrigin.x, oOrigin.y, oEventOffsetX, oEventOffsetY);

    clearOldDebugInfoBox(oPreviousMousePosition.x + 10, oPreviousMousePosition.y, nTextBoxWidth, nTextBoxHeight);
    drawNewDebugInfoBox(oEventOffsetX + 10, oEventOffsetY, nTextBoxWidth, nTextBoxHeight);

    oPreviousMousePosition.x = oEventOffsetX;
    oPreviousMousePosition.y = oEventOffsetY;

};

const oParams = new URLSearchParams(document.location.search.substring(1));
const sIsDebug = oParams.get('debug', false);
const bIsDebug = decodeURI(sIsDebug) === 'true';

let IS_DEBUG = bIsDebug;

const oPage = createPage();
const oGraphicCanvas = createCanvas('graphicCanvas', '', 0, oPage);

const oDebugCanvas = createCanvas('debugCanvas', '', 1, oPage);
oDebugCanvas.style = setBlockVisibility(IS_DEBUG);

const oDebugDrawCanvas = createCanvas('debugDrawCanvas', '', 2, oPage);
oDebugDrawCanvas.style = setBlockVisibility(IS_DEBUG);

const oControlCanvas = createCanvas('controlCanvas', '', 3, oPage);
oControlCanvas.addEventListener('mousemove', onMouseMoveOnCanvas);
oControlCanvas.addEventListener('click', onTapCanvas);

const oImageCanvas = createCanvas('imageCanvas', '', 4, oPage);
oImageCanvas.style = setBlockVisibility(false);

const oOrigin = {
    x: oDebugDrawCanvas.width / 2,
    y: oDebugDrawCanvas.height / 2
};

const oImage = new Image();
oImage.src = '../resources/flower.png';
let oImageDescription = {};

let nPrecision = 5;
let nHue = Math.floor(Math.random() * 360);
let oCurrentTransform = {
    pan: {
        horizontal: 0,
        vertical: 0
    },
    zoom: 1
};

let sControlState = CONTROL_STATE.VIEW;

let oPreviousTapPoint = {
    x: oGraphicCanvas.width / 2,
    y: oGraphicCanvas.height / 2
};

let oTapPoint = {
    x: oGraphicCanvas.width / 2,
    y: oGraphicCanvas.height / 2
};

let oPreviousMousePosition = {
    x: oOrigin.x,
    y: oOrigin.y
};

let c = Mandelbrot.getComplexNumberFromPoint(oTapPoint, oCurrentTransform);

const waitUntilImageLoadedAndStart = function () {

    const fnHandleImageLoaded = () => {

        oImage.removeEventListener('load', fnHandleImageLoaded);

        const oImageContext = oImageCanvas.getContext('2d');
        oImageContext.drawImage(oImage, 0, 0);
        const oImageData = oImageContext.getImageData(0, 0, oImageCanvas.width, oImageCanvas.height);
        oImageDescription = {
            data: oImageData.data,
            width: oImage.width,
            height: oImage.height
        };

        drawGraphics(oCurrentTransform, oImageDescription);

    };

    oImage.addEventListener('load', fnHandleImageLoaded);

};

const main = function () {

    createControls(oCurrentTransform);

    setCenterRealInputValue(c.real);
    setCenterImaginaryInputValue(c.imaginary);

    waitUntilImageLoadedAndStart();

};

main();