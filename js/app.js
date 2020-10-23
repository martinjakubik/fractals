import { createSlider } from './lib/tools.js';

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

const getComplexNumberFromPoint = function (oPoint, oTransform) {
    return getComplexNumberFromXY(oPoint.x, oPoint.y, oTransform);
};

const getComplexNumberFromXY = function (x, y, oTransform) {

    const oComplexNumber = {
        real: (x - oTransform.pan.horizontal) / oTransform.zoom,
        imaginary: (y - oTransform.pan.vertical) / oTransform.zoom
    }

    return oComplexNumber;

};

const getPointFromComplexNumber = function (c, oTransform) {

    const oPoint = {
        x: c.real * oTransform.zoom + oTransform.pan.horizontal,
        y: c.imaginary * oTransform.zoom + oTransform.pan.vertical
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

const drawImagePixelOnCanvas = function (oContext, x, y, oTransform) {

    const tx = (x + oTransform.pan.horizontal) * oTransform.zoom;
    const ty = (y + oTransform.pan.vertical) * oTransform.zoom;
    
    const index = (x * 4) + (y * 4) * oImageCanvas.width;

    const rDecimal = oImage_Data[index];
    const gDecimal = oImage_Data[index + 1];
    const bDecimal = oImage_Data[index + 2];
    const alphaDecimal = oImage_Data[index + 3] / 255;
    const sRGBA = `rgba(${rDecimal}, ${gDecimal}, ${bDecimal}, ${alphaDecimal})`;
    oContext.fillStyle = sRGBA;
    oContext.fillRect(x, y, 1, 1);

};

const drawImages = function (oTransform) {

    drawMandelbrotSet(oTransform);
    drawOverlay(oTransform);

};

const drawOverlay = function (oTransform) {
    
    const oGraphicContext = oGraphicCanvas.getContext('2d');
    for (let x = 0; x < oImageCanvas.width; x++) {
        for (let y = 0; y < oImageCanvas.height; y++) {
            drawImagePixelOnCanvas(oGraphicContext, x, y, oTransform);
        }
    }

};

const drawMandelbrotSet = function (oTransform) {

    const oGraphicContext = oGraphicCanvas.getContext('2d');
    const oDebugContext = oDebugCanvas.getContext('2d');
    const nDebugCanvasWidth = oDebugCanvas.parentNode.clientWidth;

    let x = 0;
    let y = 0;
    let sDebugText = '';
    oDebugContext.font = '8pt sans-serif';

    oDebugContext.clearRect(0, 0, nDebugCanvasWidth, CANVAS_HEIGHT);

    sDebugText = `precision: ${nPrecision} pan:${(oTransform.pan.horizontal)} zoom: ${oTransform.zoom} pan/zoom:${(oTransform.pan.horizontal / oTransform.zoom)} last click: ${oGraphicCanvas.width - oTransform.pan.horizontal} center point: ${((oGraphicCanvas.width / 2) - oTransform.pan.horizontal) / oTransform.zoom}`;
    oDebugContext.fillStyle = '#fff';
    oDebugContext.fillText(sDebugText, 800, 580);

    for (x = 0; x < oGraphicCanvas.width; x++) {
        for (y = 0; y < oGraphicCanvas.height; y++) {

            const c = getComplexNumberFromXY(x, y, oTransform);

            // debug
            if (x % 200 === 0 && y % 200 === 0) {
                const sDebugText1 = `x:${x},y:${y}`;
                const sDebugText2 = `r:${c.real}, i:${c.imaginary}`;
                oDebugContext.fillStyle = '#fff';
                oDebugContext.fillText(sDebugText1, x, y + 8);
                oDebugContext.fillText(sDebugText2, x, y + 22);
            }

            const nDegreeInSet = degreeInMandelbrotSet(c);

            if (nDegreeInSet === 0) {
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
        const c = getComplexNumberFromPoint(oTapPoint, oCurrentTransform);
        setCenterRealInputValue(c.real);
        setCenterImaginaryInputValue(c.imaginary);

    } else if (sControlState === CONTROL_STATE.ZOOMED_IN || sControlState === CONTROL_STATE.ZOOMED_OUT) {

        hideZoomControl();
        if (sControlState === CONTROL_STATE.ZOOMED_IN) {
            oCurrentTransform.zoom = oCurrentTransform.zoom * ZOOM_MULTIPLIER;
        } else if (sControlState === CONTROL_STATE.ZOOMED_OUT) {
            oCurrentTransform.zoom = oCurrentTransform.zoom / ZOOM_MULTIPLIER;
        }
        const nHorizontalOffset = oTapPoint.x - oPreviousTapPoint.x;
        const nVerticalOffset = oTapPoint.y - oPreviousTapPoint.y;
        oCurrentTransform.pan.horizontal = oCurrentTransform.pan.horizontal - nHorizontalOffset;
        oCurrentTransform.pan.vertical = oCurrentTransform.pan.vertical - nVerticalOffset;
        drawImages(oCurrentTransform);
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

    handleTap(nTapX, nTapY, oCurrentTransform);

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

const createImageCanvas = function (oPage) {

    const nZindex = 3;
    const oCanvas = createCanvas('imageCanvas', nZindex, oPage);
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

const _handleEnterKeyInNumber = function (oTransform) {
    drawImages(oTransform);
}

const _handleDraw = function (oTransform) {
    drawImages(oTransform);
}

const createControls = function (oTransform) {

    const oPrecisionSlider = createSlider('precision', '0', '1000', nPrecision, 'Precision');

    oPrecisionSlider.onchange = () => {
        nPrecision = oPrecisionSlider.value;
        drawImages(oTransform);
    };

    const oHueSlider = createSlider('hue', '0', '359', nHue, 'Hue');

    oHueSlider.onchange = () => {
        nHue = oHueSlider.value;
        drawImages(oTransform);
    };

    const oCenterRealNumberInput = createNumberInput('centerreal', 0, 'Center real');

    oCenterRealNumberInput.onkeyup = (oEvent) => {
        if (oEvent.keyCode === 13) {
            const c = {
                real: oCenterRealNumberInput.value,
                imaginary: oCenterImaginaryNumberInput.value
            }
            oTransform.pan.horizontal = (oGraphicCanvas.width / 2) - getPointFromComplexNumber(c, oTransform).x;
            _handleDraw(oTransform);
        }
    };

    const oCenterImaginaryNumberInput = createNumberInput('centerimaginary', 0, 'Imaginary');

    oCenterImaginaryNumberInput.onkeyup = (oEvent) => {
        if (oEvent.keyCode === 13) {
            const c = {
                real: oCenterRealNumberInput.value,
                imaginary: oCenterImaginaryNumberInput.value
            }
            oTransform.pan.vertical = getPointFromComplexNumber(c, oTransform).y;
            _handleDraw(oTransform);
        }
    }

    const oDrawButton = createButton('draw', 'Draw');

    oDrawButton.onclick = () => {
        _handleDraw(oTransform);
    };

    const oDebugCheckbox = createCheckbox('debug', IS_DEBUG, 'Debug');

    oDebugCheckbox.onchange = () => {
        IS_DEBUG = oDebugCheckbox.checked;
        const sStyle =setBlockVisibility(IS_DEBUG);
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

let IS_DEBUG = false;

const oPage = createPage();
const oGraphicCanvas = createGraphicCanvas(oPage);
const oDebugCanvas = createDebugCanvas(oPage);
oDebugCanvas.style = setBlockVisibility(IS_DEBUG);
const oControlCanvas = createControlCanvas(oPage);
const oImageCanvas = createImageCanvas(oPage);
oImageCanvas.style = setBlockVisibility(false);
const oImage = new Image();
oImage.src = '../resources/redstars.png';
let oImage_Data = {};

let nPrecision = 5;
let nHue = Math.floor(Math.random() * 360);
let oCurrentTransform = {
    pan: {
        horizontal: oGraphicCanvas.width / 2,
        vertical: oGraphicCanvas.height / 2
    },
    zoom: 1
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

let c = getComplexNumberFromPoint(oTapPoint, oCurrentTransform);

const waitUntilImageLoadedAndStart = function () {

    const fnHandleImageLoaded = e => {
        oImage.removeEventListener('load', fnHandleImageLoaded);

        const oImageContext = oImageCanvas.getContext('2d');
        oImageContext.drawImage(oImage, 0, 0);
        const oImageData = oImageContext.getImageData(0, 0, oImageCanvas.width, oImageCanvas.height);
        oImage_Data = oImageData.data;
    
        drawImages(oCurrentTransform);
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