class TileCanvas {

    static divideLength (nLength, nDivisor) {
        const aLengths = [];
        if (nDivisor === 0) return aLengths;
        if (nLength <= 1) {
            aLengths.push(nLength);
        } else {
            const nDividedLength = nLength / nDivisor;
            const nFloorDividedLength = Math.floor(nDividedLength);
            const nLength1 = nFloorDividedLength < nDividedLength ? nFloorDividedLength + 1 : nFloorDividedLength;
            const nLength2 = nFloorDividedLength;
            aLengths.push(nLength1, nLength2);
        }
        return aLengths;
    }

    static getTiles (nAcrossCount, nDownCount, canvasWidth, canvasHeight) {
        const tileWidths = this.divideLength(canvasWidth, nAcrossCount);
        const tileHeights = this.divideLength(canvasHeight, nDownCount);
        return [{
            x: 0,
            y: 0,
            width: tileWidths[0],
            height: tileHeights[0]
        }, {
            x: tileWidths[0] + 1,
            y: 0,
            width: tileWidths[1],
            height: tileHeights[0]
        }, {
            x: 0,
            y: tileHeights[0] + 1,
            width: tileWidths[0],
            height: tileHeights[1]
        }, {
            x: tileWidths[0] + 1,
            y: tileHeights[0] + 1,
            width: tileWidths[1],
            height: tileHeights[1]
        }];
    }
}

export { TileCanvas };