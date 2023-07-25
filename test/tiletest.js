const tileWidths = [10, 10, 10];
const tileHeights = [10, 10, 10];

const tiles2x2 = [{
    x: 0,
    y: 0,
    width: tileWidths[0],
    height: tileHeights[0],
    isMiddle: false
}, {
    x: tileWidths[0],
    y: 0,
    width: tileWidths[1],
    height: tileHeights[0],
    isMiddle: false
}, {
    x: 0,
    y: tileHeights[0],
    width: tileWidths[0],
    height: tileHeights[1],
    isMiddle: false
}, {
    x: tileWidths[0],
    y: tileHeights[0],
    width: tileWidths[1],
    height: tileHeights[1],
    isMiddle: false
}];

const tiles3x3 = [{
    x: 0,
    y: 0,
    width: tileWidths[0],
    height: tileHeights[0],
    isMiddle: false
}, {
    x: tileWidths[0],
    y: 0,
    width: tileWidths[1],
    height: tileHeights[0],
    isMiddle: false
}, {
    x: tileWidths[0] + tileWidths[1],
    y: 0,
    width: tileWidths[2],
    height: tileHeights[0],
    isMiddle: false
}, {
    x: 0,
    y: tileHeights[0],
    width: tileWidths[0],
    height: tileHeights[1],
    isMiddle: false
}, {
    x: tileWidths[0],
    y: tileHeights[0],
    width: tileWidths[1],
    height: tileHeights[1],
    isMiddle: true
}, {
    x: tileWidths[0] + tileWidths[1],
    y: tileHeights[0],
    width: tileWidths[2],
    height: tileHeights[1],
    isMiddle: false
}, {
    x: 0,
    y: tileHeights[0] + tileHeights[1],
    width: tileWidths[0],
    height: tileHeights[2],
    isMiddle: false
}, {
    x: tileWidths[0],
    y: tileHeights[0] + tileHeights[1],
    width: tileWidths[1],
    height: tileHeights[2],
    isMiddle: false
}, {
    x: tileWidths[0] + tileWidths[1],
    y: tileHeights[0] + tileHeights[1],
    width: tileWidths[2],
    height: tileHeights[2],
    isMiddle: false
}];

export { tiles2x2, tiles3x3 };