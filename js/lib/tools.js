const CANVAS_HEIGHT = 600;

const createButton = function (sId, sLabel, oParent) {

    if (!oParent) {
        oParent = document.body;
    }

    const oButton = document.createElement('button');
    oButton.id = sId;
    oButton.innerText = sLabel;

    oParent.appendChild(oButton);

    return oButton;

};

const createCanvas = function (sCanvasId, nZindex, oParent) {

    if (!oParent) {
        oParent = document.body;
    }

    const oCanvas = document.createElement('canvas');
    oCanvas.id = sCanvasId;
    oParent.appendChild(oCanvas);

    const nParentWidth = oCanvas.parentNode.clientWidth;

    oCanvas.width = nParentWidth;
    oCanvas.height = CANVAS_HEIGHT;

    oCanvas.style.position = 'absolute';
    oCanvas.style.zindex = nZindex;

    return oCanvas;

};

const createSlider = function (sId, sMin, sMax, nValue, sLabel, nStep, oParent) {

    if (!oParent) {
        oParent = document.body;
    }

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

    oParent.appendChild(oLabel);
    oParent.appendChild(oInput);

    return oInput;

};

export { CANVAS_HEIGHT, createButton, createCanvas, createSlider };