const sizes = {
    CENTRAL_LENS_RADIUS: 50,
    CENTRAL_BUTTON_RADIUS_RATIO: 4,
    PERIPHERAL_BUTTON_DISTANCE: 120
};

sizes.CENTRAL_BUTTON_RADIUS = sizes.CENTRAL_LENS_RADIUS / sizes.CENTRAL_BUTTON_RADIUS_RATIO;
class Zoomer {

    static isPointInZoomInButton (nPointX, nPointY, bZoomerDisplayedRecto, oZoomCenterPoint) {
        return bZoomerDisplayedRecto ? this.isPointInCentralButton(nPointX, nPointY, oZoomCenterPoint) : this.isPointInPeripheralButton(nPointX, nPointY, oZoomCenterPoint);
    }

    static isPointInZoomOutButton (nPointX, nPointY, bZoomerDisplayedRecto, oZoomCenterPoint) {
        return bZoomerDisplayedRecto ? this.isPointInPeripheralButton(nPointX, nPointY, oZoomCenterPoint) : this.isPointInCentralButton(nPointX, nPointY, oZoomCenterPoint);
    }

    static isPointInCentralButton (nPointX, nPointY, oZoomCenterPoint) {
        return (Math.sqrt((nPointX - oZoomCenterPoint.x) ** 2 + (nPointY - oZoomCenterPoint.y) ** 2) < sizes.CENTRAL_BUTTON_RADIUS);
    }

    static isPointInPeripheralButton (nPointX, nPointY, oZoomCenterPoint) {
        const x1 = nPointX - sizes.PERIPHERAL_BUTTON_DISTANCE;
        const x2 = nPointX + sizes.PERIPHERAL_BUTTON_DISTANCE;
        const y1 = nPointY - sizes.PERIPHERAL_BUTTON_DISTANCE;
        const y2 = nPointY + sizes.PERIPHERAL_BUTTON_DISTANCE;

        return (Math.sqrt((x1 - oZoomCenterPoint.x) ** 2 + (nPointY - oZoomCenterPoint.y) ** 2) < sizes.CENTRAL_BUTTON_RADIUS)
            || (Math.sqrt((x2 - oZoomCenterPoint.x) ** 2 + (nPointY - oZoomCenterPoint.y) ** 2) < sizes.CENTRAL_BUTTON_RADIUS)
            || (Math.sqrt((nPointX - oZoomCenterPoint.x) ** 2 + (y1 - oZoomCenterPoint.y) ** 2) < sizes.CENTRAL_BUTTON_RADIUS)
            || (Math.sqrt((nPointX - oZoomCenterPoint.x) ** 2 + (y2 - oZoomCenterPoint.y) ** 2) < sizes.CENTRAL_BUTTON_RADIUS);
    }

    static showZoomButtons (x, y, bAltKeyPressed, oContext, sStrokeColor) {
        if (bAltKeyPressed) {
            this.showVersoZoomButtons(x, y, oContext, sStrokeColor);
        } else {
            this.showRectoZoomButtons(x, y, oContext, sStrokeColor);
        }
    }

    static showRectoZoomButtons (x, y, oContext, sStrokeColor) {
        oContext.strokeStyle = sStrokeColor;
        oContext.lineWidth = 5;

        drawZoomInButton(x, y, oContext, sStrokeColor);

        const x1 = x - sizes.PERIPHERAL_BUTTON_DISTANCE;
        const x2 = x + sizes.PERIPHERAL_BUTTON_DISTANCE;
        const y1 = y - sizes.PERIPHERAL_BUTTON_DISTANCE;
        const y2 = y + sizes.PERIPHERAL_BUTTON_DISTANCE;

        drawZoomOutButton(x1, y, oContext);
        drawZoomOutButton(x2, y, oContext);
        drawZoomOutButton(x, y1, oContext);
        drawZoomOutButton(x, y2, oContext);
    }

    static showVersoZoomButtons (x, y, oContext, sStrokeColor) {
        oContext.strokeStyle = sStrokeColor;
        oContext.lineWidth = 5;

        drawZoomOutButton(x, y, oContext, sStrokeColor);

        const x1 = x - sizes.PERIPHERAL_BUTTON_DISTANCE;
        const x2 = x + sizes.PERIPHERAL_BUTTON_DISTANCE;
        const y1 = y - sizes.PERIPHERAL_BUTTON_DISTANCE;
        const y2 = y + sizes.PERIPHERAL_BUTTON_DISTANCE;

        drawZoomInButton(x1, y, oContext);
        drawZoomInButton(x2, y, oContext);
        drawZoomInButton(x, y1, oContext);
        drawZoomInButton(x, y2, oContext);

    }

    static hideZoomButtons (oCanvas) {
        const oContext = oCanvas.getContext('2d');
        const nParentWidth = oCanvas.parentNode.clientWidth;
        oContext.clearRect(0, 0, nParentWidth, oCanvas.height);
    }

    static onMouseMoveOnCanvas (nPointX, nPointY, oZoomCenterPoint, oCanvas, sStrokeColorNormal, sStrokeColorHighlight) {
        const oContext = oCanvas.getContext('2d');
        const bZoomerDisplayedRecto = true;
        if (this.isPointInZoomInButton(nPointX, nPointY, bZoomerDisplayedRecto, oZoomCenterPoint)) {
            Zoomer.hideZoomButtons(oCanvas);
            Zoomer.showZoomButtons(oZoomCenterPoint.x, oZoomCenterPoint.y, !bZoomerDisplayedRecto, oContext, sStrokeColorHighlight);
        }
    }
}

const drawZoomInButton = function (x, y, oContext) {
    // draws circle
    oContext.beginPath();
    oContext.arc(x, y, sizes.CENTRAL_LENS_RADIUS, 0, Math.PI * 2);
    oContext.stroke();

    // draws zoom in button
    oContext.lineWidth = 3;
    oContext.beginPath();
    oContext.arc(x, y, sizes.CENTRAL_BUTTON_RADIUS, 0, Math.PI * 2);
    oContext.stroke();

    oContext.beginPath();
    oContext.moveTo(x, y - sizes.CENTRAL_BUTTON_RADIUS * 0.66);
    oContext.lineTo(x, y + sizes.CENTRAL_BUTTON_RADIUS * 0.66);
    oContext.stroke();
    oContext.moveTo(x - sizes.CENTRAL_BUTTON_RADIUS * 0.66, y);
    oContext.lineTo(x + sizes.CENTRAL_BUTTON_RADIUS * 0.66, y);
    oContext.stroke();
};

const drawZoomOutButton = function (x, y, oContext) {
    oContext.beginPath();
    oContext.arc(x, y, sizes.CENTRAL_BUTTON_RADIUS, 0, Math.PI * 2);
    oContext.stroke();

    oContext.beginPath();
    oContext.moveTo(x - sizes.CENTRAL_BUTTON_RADIUS * 0.66, y);
    oContext.lineTo(x + sizes.CENTRAL_BUTTON_RADIUS * 0.66, y);
    oContext.stroke();
};

export { Zoomer };