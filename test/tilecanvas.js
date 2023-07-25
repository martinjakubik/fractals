import { TileCanvas } from '../app/tilecanvas.mjs';
import { intArrayEqual } from './arrayequal.mjs';

QUnit.module('tileCanvas');

QUnit.test('divide by 1', assert => {

    const expectedArray = [1];
    const actualArray = TileCanvas.divideLength(1, 1);

    const expected = true;
    const actual = intArrayEqual(expectedArray, actualArray);

    assert.equal(actual, expected);
});

QUnit.test('divide by 2', assert => {

    const expectedArray = [2, 2];
    const actualArray = TileCanvas.divideLength(4, 2);

    const expected = true;
    const actual = intArrayEqual(expectedArray, actualArray);

    assert.equal(actual, expected);
});

QUnit.test('divide by 0', assert => {

    const expectedArray = [];
    const actualArray = TileCanvas.divideLength(1, 0);

    const expected = true;
    const actual = intArrayEqual(expectedArray, actualArray);

    assert.equal(actual, expected);
});