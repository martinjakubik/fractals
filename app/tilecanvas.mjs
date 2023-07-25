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
            let nNextLength = nFloorDividedLength;
            let nReconstitutedLength = nLength1;
            aLengths.push(nLength1);
            while (nReconstitutedLength < nLength) {
                aLengths.push(nNextLength);
                nReconstitutedLength = nReconstitutedLength + nNextLength;
            }
        }
        return aLengths;
    }

    static getTiles (nAcrossCount, nDownCount, canvasWidth, canvasHeight) {
        const tileWidths = this.divideLength(canvasWidth, nAcrossCount);
        const tileHeights = this.divideLength(canvasHeight, nDownCount);
        let aTiles = [];
        for (let nDownIndex = 0; nDownIndex < nDownCount; nDownIndex++) {
            for (let nAcrossIndex = 0; nAcrossIndex < nAcrossCount; nAcrossIndex++) {
                let x = 0;
                let y = 0;
                for (let nAcrossCount = 0; nAcrossCount < nAcrossIndex; nAcrossCount++) {
                    x = x + tileWidths[nAcrossCount];
                }
                for (let nDownCount = 0; nDownCount < nDownIndex; nDownCount++) {
                    y = y + tileHeights[nDownCount];
                }
                aTiles.push({
                    x: x,
                    y: y,
                    width: tileWidths[nAcrossIndex],
                    height: tileHeights[nDownIndex]
                });
            }
        }
        return aTiles;
    }
}

export { TileCanvas };