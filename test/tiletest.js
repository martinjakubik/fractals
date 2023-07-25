const tileWidths = [10, 10];
const tileHeights = [10, 10];

const tilesA = [{
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

export { tilesA };