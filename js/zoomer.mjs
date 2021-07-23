const sizes = {
    ZOOM_LENS_RADIUS: 50,
    ZOOM_IN_BUTTON_RADIUS_RATIO: 4,
    ZOOM_OUT_BUTTON_DISTANCE: 120
};

sizes.ZOOM_IN_BUTTON_RADIUS = sizes.ZOOM_LENS_RADIUS / sizes.ZOOM_IN_BUTTON_RADIUS_RATIO;
class Zoomer {

    static tap () {

        console.log('tap');

    }

    static isPointInZoomInButton (nPointX, nPointY, oZoomCenterPoint) {

        return (Math.sqrt((nPointX - oZoomCenterPoint.x) ** 2 + (nPointY - oZoomCenterPoint.y) ** 2) < sizes.ZOOM_IN_BUTTON_RADIUS);

    }

    static isPointInZoomOutButton (nPointX, nPointY, oZoomCenterPoint) {

        const x1 = nPointX - sizes.ZOOM_OUT_BUTTON_DISTANCE;
        const x2 = nPointX + sizes.ZOOM_OUT_BUTTON_DISTANCE;
        const y1 = nPointY - sizes.ZOOM_OUT_BUTTON_DISTANCE;
        const y2 = nPointY + sizes.ZOOM_OUT_BUTTON_DISTANCE;

        return (Math.sqrt((x1 - oZoomCenterPoint.x) ** 2 + (nPointY - oZoomCenterPoint.y) ** 2) < sizes.ZOOM_IN_BUTTON_RADIUS)
            || (Math.sqrt((x2 - oZoomCenterPoint.x) ** 2 + (nPointY - oZoomCenterPoint.y) ** 2) < sizes.ZOOM_IN_BUTTON_RADIUS)
            || (Math.sqrt((nPointX - oZoomCenterPoint.x) ** 2 + (y1 - oZoomCenterPoint.y) ** 2) < sizes.ZOOM_IN_BUTTON_RADIUS)
            || (Math.sqrt((nPointX - oZoomCenterPoint.x) ** 2 + (y2 - oZoomCenterPoint.y) ** 2) < sizes.ZOOM_IN_BUTTON_RADIUS);

    }

    static showZoomButtons (x, y, oContext, sStrokeColor) {

        oContext.strokeStyle = sStrokeColor;
        oContext.lineWidth = 5;

        // draws circle
        oContext.beginPath();
        oContext.arc(x, y, sizes.ZOOM_LENS_RADIUS, 0, Math.PI * 2);
        oContext.stroke();

        // draws zoom in button
        oContext.lineWidth = 3;
        oContext.beginPath();
        oContext.arc(x, y, sizes.ZOOM_IN_BUTTON_RADIUS, 0, Math.PI * 2);
        oContext.stroke();

        oContext.beginPath();
        oContext.moveTo(x, y - sizes.ZOOM_IN_BUTTON_RADIUS * 0.66);
        oContext.lineTo(x, y + sizes.ZOOM_IN_BUTTON_RADIUS * 0.66);
        oContext.stroke();
        oContext.moveTo(x - sizes.ZOOM_IN_BUTTON_RADIUS * 0.66, y);
        oContext.lineTo(x + sizes.ZOOM_IN_BUTTON_RADIUS * 0.66, y);
        oContext.stroke();

        // draws zoom out buttons
        const x1 = x - sizes.ZOOM_OUT_BUTTON_DISTANCE;
        const x2 = x + sizes.ZOOM_OUT_BUTTON_DISTANCE;
        const y1 = y - sizes.ZOOM_OUT_BUTTON_DISTANCE;
        const y2 = y + sizes.ZOOM_OUT_BUTTON_DISTANCE;

        drawZoomOutButton(x1, y, oContext);
        drawZoomOutButton(x2, y, oContext);
        drawZoomOutButton(x, y1, oContext);
        drawZoomOutButton(x, y2, oContext);

    }

    static hideZoomButtons (oCanvas) {

        const oContext = oCanvas.getContext('2d');
        const nParentWidth = oCanvas.parentNode.clientWidth;
        oContext.clearRect(0, 0, nParentWidth, oCanvas.height);

    }

    static onMouseMoveOnCanvas (nPointX, nPointY, oZoomCenterPoint, oCanvas, sStrokeColorNormal, sStrokeColorHighlight) {

        const oContext = oCanvas.getContext('2d');
        if (this.isPointInZoomInButton(nPointX, nPointY, oZoomCenterPoint)) {
            Zoomer.hideZoomButtons(oCanvas);
            Zoomer.showZoomButtons(oZoomCenterPoint.x, oZoomCenterPoint.y, oContext, sStrokeColorHighlight);
        }

    }

}

const drawZoomOutButton = function (x, y, oContext) {

    oContext.beginPath();
    oContext.arc(x, y, sizes.ZOOM_IN_BUTTON_RADIUS, 0, Math.PI * 2);
    oContext.stroke();

    oContext.beginPath();
    oContext.moveTo(x - sizes.ZOOM_IN_BUTTON_RADIUS * 0.66, y);
    oContext.lineTo(x + sizes.ZOOM_IN_BUTTON_RADIUS * 0.66, y);
    oContext.stroke();

};

export { Zoomer };