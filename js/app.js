import { CANVAS_HEIGHT, createButton, createCanvas, createCheckbox, createNumberInput, createSlider, setBlockVisibility } from '../../lib/js/learnhypertext.mjs';
import { Zoom } from './zoom.mjs';
import { Mandelbrot } from './mandelbrot.mjs';


const VERTICAL_MARGIN = 36;

const ZOOM_MULTIPLIER = 2;

const STROKE_COLOR_NORMAL = '#aaa';

const CONTROL_STATE = {
    VIEW: 0,
    CHOOSE_ZOOM: 1,
    ZOOMED_IN: 2,
    ZOOMED_OUT: 3
};

const getPointFromComplexNumber = function (c, oTransform) {

    const oPoint = {
        x: c.real * oTransform.zoom + oTransform.pan.horizontal,
        y: c.imaginary * oTransform.zoom + oTransform.pan.vertical
    };

    return oPoint;

};

const drawGraphics = function (oTransform, oImageDescription) {

    const oGraphicContext = oGraphicCanvas.getContext('2d');
    oGraphicContext.clearRect(0, 0, oGraphicCanvas.width, oGraphicCanvas.height);
    // Mandelbrot.drawMandelbrotSet(oTransform, nPrecision, oGraphicCanvas, oDebugCanvas, STROKE_COLOR_NORMAL, nHue, oTapPoint);
    drawImageOnCanvas(oTransform, oImageDescription);

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

const drawImagePixelOnCanvas = function (oDestinationCanvas, oDestinationContext, x, y, oTransform, oImageDescription) {

    const oTransformedPoint = transformPixelPoint(oDestinationCanvas, x, y, oTransform, oImageDescription);
    const index = (x * 4) + (y * 4) * oImageCanvas.width;
    const nPixelSize = oCurrentTransform.zoom < 2 ? oCurrentTransform.zoom : oCurrentTransform.zoom - 1;

    const rDecimal = oImageDescription.data[index];
    const gDecimal = oImageDescription.data[index + 1];
    const bDecimal = oImageDescription.data[index + 2];
    const alphaDecimal = oImageDescription.data[index + 3] / 255;
    const sRGBA = `rgba(${rDecimal}, ${gDecimal}, ${bDecimal}, ${alphaDecimal})`;
    oDestinationContext.fillStyle = sRGBA;
    oDestinationContext.fillRect(oTransformedPoint.x, oTransformedPoint.y, nPixelSize, nPixelSize);

};

const drawImageOnCanvas = function (oTransform, oImageDescription) {

    const oGraphicContext = oGraphicCanvas.getContext('2d');
    for (let x = 0; x < oImageDescription.width; x++) {
        for (let y = 0; y < oImageDescription.height; y++) {
            drawImagePixelOnCanvas(oGraphicCanvas, oGraphicContext, x, y, oTransform, oImageDescription);
        }
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
            return;
        } else if (bIsTapInZoomOutButton) {
            sControlState = CONTROL_STATE.ZOOMED_OUT;
            return;
        }
    }

};

const handleTap = function (nTapX, nTapY, oCurrentTransform, oImageDescription) {

    const oZoomControlCenterPoint = oTapPoint;
    const bIsTapInZoomInButton = Zoom.isTapInZoomInButton(nTapX, nTapY, oZoomControlCenterPoint);
    const bIsTapInZoomOutButton = Zoom.isTapInZoomOutButton(nTapX, nTapY, oZoomControlCenterPoint);
    updateControlState(bIsTapInZoomInButton, bIsTapInZoomOutButton);

    if (sControlState === CONTROL_STATE.VIEW) {

        Zoom.hideZoomButtons(oControlCanvas);

    } else if (sControlState === CONTROL_STATE.CHOOSE_ZOOM) {

        const oControlContext = oControlCanvas.getContext('2d');
        Zoom.hideZoomButtons(oControlCanvas);
        Zoom.showZoomButtons(nTapX, nTapY, oControlContext, STROKE_COLOR_NORMAL);
        oTapPoint = {
            x: nTapX,
            y: nTapY
        };
        const c = Mandelbrot.getComplexNumberFromPoint(oTapPoint, oCurrentTransform);
        setCenterRealInputValue(c.real);
        setCenterImaginaryInputValue(c.imaginary);

    } else if (sControlState === CONTROL_STATE.ZOOMED_IN || sControlState === CONTROL_STATE.ZOOMED_OUT) {

        Zoom.hideZoomButtons(oControlCanvas);
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

const onTapCanvas = function (oEvent) {

    const nTapX = oEvent.x;
    const nTapY = oEvent.y - VERTICAL_MARGIN;

    handleTap(nTapX, nTapY, oCurrentTransform, oImageDescription);

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

    const oCenterRealNumberInput = createNumberInput('centerreal', 0, 'Center real', oControlBar);

    oCenterRealNumberInput.onkeyup = (oEvent) => {
        if (oEvent.keyCode === 13) {
            const c = {
                real: oCenterRealNumberInput.value,
                imaginary: oCenterImaginaryNumberInput.value
            };
            oTransform.pan.horizontal = (oGraphicCanvas.width / 2) - getPointFromComplexNumber(c, oTransform).x;
            handleDraw(oTransform);
        }
    };

    const oCenterImaginaryNumberInput = createNumberInput('centerimaginary', 0, 'Imaginary', oControlBar);

    oCenterImaginaryNumberInput.onkeyup = (oEvent) => {
        if (oEvent.keyCode === 13) {
            const c = {
                real: oCenterRealNumberInput.value,
                imaginary: oCenterImaginaryNumberInput.value
            };
            oTransform.pan.vertical = getPointFromComplexNumber(c, oTransform).y;
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
    };

};

const createPage = function () {

    const oPage = document.createElement('div');
    oPage.id = 'page';
    document.body.appendChild(oPage);

    const nParentWidth = oPage.parentNode.clientWidth;

    oPage.style.width = nParentWidth;
    oPage.style.height = CANVAS_HEIGHT;

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

    if (!IS_DEBUG) {
        return;
    }

    const oEventOffsetX = oEvent.offsetX;
    const oEventOffsetY = oEvent.offsetY;
    showDebugInfoBox(oEventOffsetX, oEventOffsetY);

};

const showDebugInfoBox = function (oEventOffsetX, oEventOffsetY) {

    const nTextBoxWidth = 120;
    const nTextBoxHeight = 42;
    const oContext = oDebugDrawCanvas.getContext('2d');

    oContext.clearRect(oPreviousMousePosition.x + 10, oPreviousMousePosition.y, nTextBoxWidth, nTextBoxHeight);

    oContext.beginPath();
    oContext.lineWidth = 3;
    oContext.globalCompositeOperation = 'destination-out';
    oContext.moveTo(oOrigin.x, oOrigin.y);
    oContext.lineTo(oPreviousMousePosition.x, oPreviousMousePosition.y);
    oContext.closePath();
    oContext.stroke();
    oContext.globalCompositeOperation = 'source-over';

    oContext.beginPath();
    oContext.strokeStyle = STROKE_COLOR_NORMAL;
    oContext.lineWidth = 1;
    oContext.moveTo(oOrigin.x, oOrigin.y);
    oContext.lineTo(oEventOffsetX, oEventOffsetY);
    oContext.closePath();
    oContext.stroke();

    oContext.fillStyle = '#000';
    oContext.fillRect(oEventOffsetX + 10, oEventOffsetY, nTextBoxWidth, nTextBoxHeight);

    const sDebugText1 = `x:${oEventOffsetX}, y:${oEventOffsetY}`;
    const oTransformedPoint = Mandelbrot.transformXY(oEventOffsetX, oEventOffsetY, oCurrentTransform);
    const sDebugText2 = `x:${oTransformedPoint.x}, y:${oTransformedPoint.y}`;
    const sDebugText3 = `zoom:${oCurrentTransform.zoom}`;
    oContext.fillStyle = STROKE_COLOR_NORMAL;
    oContext.fillText(sDebugText1, oEventOffsetX + 10, oEventOffsetY + 10);
    oContext.fillText(sDebugText2, oEventOffsetX + 10, oEventOffsetY + 24);
    oContext.fillText(sDebugText3, oEventOffsetX + 10, oEventOffsetY + 38);

    oPreviousMousePosition.x = oEventOffsetX;
    oPreviousMousePosition.y = oEventOffsetY;

};

let IS_DEBUG = false;

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