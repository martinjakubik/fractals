const definitions = {
    ZOOM_LENS_RADIUS: 50,
    ZOOM_BUTTON_RADIUS_RATIO: 4,
    ZOOM_OUT_BUTTON_DISTANCE: 120
};

definitions.ZOOM_BUTTON_RADIUS = definitions.ZOOM_LENS_RADIUS / definitions.ZOOM_BUTTON_RADIUS_RATIO;

class Zoomer {

    static tap () {

        console.log('tap');

    }

    static isTapInZoomInButton (nTapX, nTapY, oZoomCenterPoint) {

        return (Math.sqrt((nTapX - oZoomCenterPoint.x) ** 2 + (nTapY - oZoomCenterPoint.y) ** 2) < definitions.ZOOM_BUTTON_RADIUS);

    }

    static isTapInZoomOutButton (nTapX, nTapY, oZoomCenterPoint) {

        const x1 = nTapX - definitions.ZOOM_OUT_BUTTON_DISTANCE;
        const x2 = nTapX + definitions.ZOOM_OUT_BUTTON_DISTANCE;
        const y1 = nTapY - definitions.ZOOM_OUT_BUTTON_DISTANCE;
        const y2 = nTapY + definitions.ZOOM_OUT_BUTTON_DISTANCE;

        return (Math.sqrt((x1 - oZoomCenterPoint.x) ** 2 + (nTapY - oZoomCenterPoint.y) ** 2) < definitions.ZOOM_BUTTON_RADIUS)
            || (Math.sqrt((x2 - oZoomCenterPoint.x) ** 2 + (nTapY - oZoomCenterPoint.y) ** 2) < definitions.ZOOM_BUTTON_RADIUS)
            || (Math.sqrt((nTapX - oZoomCenterPoint.x) ** 2 + (y1 - oZoomCenterPoint.y) ** 2) < definitions.ZOOM_BUTTON_RADIUS)
            || (Math.sqrt((nTapX - oZoomCenterPoint.x) ** 2 + (y2 - oZoomCenterPoint.y) ** 2) < definitions.ZOOM_BUTTON_RADIUS);

    }

    static showZoomButtons (x, y, oContext, sStrokeColor) {

        oContext.strokeStyle = sStrokeColor;
        oContext.lineWidth = 5;

        // draws circle
        oContext.beginPath();
        oContext.arc(x, y, definitions.ZOOM_LENS_RADIUS, 0, Math.PI * 2);
        oContext.stroke();

        // draws zoom in button
        oContext.lineWidth = 3;
        oContext.beginPath();
        oContext.arc(x, y, definitions.ZOOM_BUTTON_RADIUS, 0, Math.PI * 2);
        oContext.stroke();

        oContext.beginPath();
        oContext.moveTo(x, y - definitions.ZOOM_BUTTON_RADIUS * 0.66);
        oContext.lineTo(x, y + definitions.ZOOM_BUTTON_RADIUS * 0.66);
        oContext.stroke();
        oContext.moveTo(x - definitions.ZOOM_BUTTON_RADIUS * 0.66, y);
        oContext.lineTo(x + definitions.ZOOM_BUTTON_RADIUS * 0.66, y);
        oContext.stroke();

        // draws zoom out buttons
        const x1 = x - definitions.ZOOM_OUT_BUTTON_DISTANCE;
        const x2 = x + definitions.ZOOM_OUT_BUTTON_DISTANCE;
        const y1 = y - definitions.ZOOM_OUT_BUTTON_DISTANCE;
        const y2 = y + definitions.ZOOM_OUT_BUTTON_DISTANCE;

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

}

const drawZoomOutButton = function (x, y, oContext) {

    oContext.beginPath();
    oContext.arc(x, y, definitions.ZOOM_BUTTON_RADIUS, 0, Math.PI * 2);
    oContext.stroke();

    oContext.beginPath();
    oContext.moveTo(x - definitions.ZOOM_BUTTON_RADIUS * 0.66, y);
    oContext.lineTo(x + definitions.ZOOM_BUTTON_RADIUS * 0.66, y);
    oContext.stroke();

};

export { Zoomer };