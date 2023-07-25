import { TileCanvas } from '../app/tilecanvas.mjs';
import { intArrayEqual } from './arrayequal.mjs';
import * as T from './tiletest.js';


QUnit.module('tileCanvas');

QUnit.test('divide by 1', assert => {
    const expectedArray = [1];
    const actualArray = TileCanvas.divideLength(1, 1);

    const expected = true;
    const actual = intArrayEqual(expectedArray, actualArray);

    assert.equal(actual, expected, `actual [${actualArray}], expected [${expectedArray}]`);
});

QUnit.test('divide by 2', assert => {
    const expectedArray = [2, 2];
    const actualArray = TileCanvas.divideLength(4, 2);

    const expected = true;
    const actual = intArrayEqual(expectedArray, actualArray);

    assert.equal(actual, expected, `actual [${actualArray}], expected [${expectedArray}]`);
});

QUnit.test('divide by 0', assert => {
    const expectedArray = [];
    const actualArray = TileCanvas.divideLength(1, 0);

    const expected = true;
    const actual = intArrayEqual(expectedArray, actualArray);

    assert.equal(actual, expected, `actual [${actualArray}], expected [${expectedArray}]`);
});

QUnit.test('divide by 3', assert => {
    const expectedArray = [2, 2, 2];
    const actualArray = TileCanvas.divideLength(6, 3);

    const expected = true;
    const actual = intArrayEqual(expectedArray, actualArray);

    assert.equal(actual, expected, `actual [${actualArray}], expected [${expectedArray}]`);
});

QUnit.test('get tiles 2x2', assert => {
    const expected = T.tilesA;
    const actual = TileCanvas.getTiles(2, 2, 20, 20);

    assert.deepEqual(actual, expected);
});