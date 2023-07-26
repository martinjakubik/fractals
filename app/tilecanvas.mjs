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

    static isMiddle (index, count) {
        if (count === 0) return false;
        if (count < 3) return false;
        let nCountHalfCeiling = Math.floor(count / 2);
        let bIsEven = (count / 2) === nCountHalfCeiling;
        let nOddOffset = bIsEven ? 0 : 1;
        if (!bIsEven && ((nCountHalfCeiling + nOddOffset) === index)) {
            return true;
        }
        if (bIsEven && (nCountHalfCeiling === index || (nCountHalfCeiling + 1) === index)) {
            return true;
        }
        return false;
    }

    static getTiles (nAcrossCount, nDownCount, canvasWidth, canvasHeight) {
        const tileWidths = this.divideLength(canvasWidth, nAcrossCount);
        const tileHeights = this.divideLength(canvasHeight, nDownCount);
        let aTiles = [];
        for (let nDownIndex = 0; nDownIndex < nDownCount; nDownIndex++) {
            for (let nAcrossIndex = 0; nAcrossIndex < nAcrossCount; nAcrossIndex++) {
                let x = 0;
                let y = 0;
                for (let nAcrossCursor = 0; nAcrossCursor < nAcrossIndex; nAcrossCursor++) {
                    x = x + tileWidths[nAcrossCursor];
                }
                for (let nDownCursor = 0; nDownCursor < nDownIndex; nDownCursor++) {
                    y = y + tileHeights[nDownCursor];
                }
                const bIsMiddle = this.isMiddle(nAcrossIndex + 1, nAcrossCount) && this.isMiddle(nDownIndex + 1, nDownCount);
                aTiles.push({
                    x: x,
                    y: y,
                    width: tileWidths[nAcrossIndex],
                    height: tileHeights[nDownIndex],
                    isMiddle: bIsMiddle
                });
                console.log(`down index: '${nDownIndex}'; across index: '${nAcrossIndex}'; is middle: '${bIsMiddle}'`);
            }
        }
        return aTiles;
    }
}

export { TileCanvas };