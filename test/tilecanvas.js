import { TileCanvas } from '../app/tilecanvas.mjs';
import { intArrayEqual } from './arrayequal.mjs';
import * as T from './tiletest.js';


QUnit.module('tileCanvas');

QUnit.test('is 1 middle of 1', assert => {
    const expected = false;
    const actual = TileCanvas.isMiddle(1, 1);

    assert.equal(actual, expected);
});

QUnit.test('1 not middle of 2', assert => {
    const expected = false;
    const actual = TileCanvas.isMiddle(1, 2);

    assert.equal(actual, expected);
});

QUnit.test('1 not middle of 3', assert => {
    const expected = false;
    const actual = TileCanvas.isMiddle(1, 3);

    assert.equal(actual, expected);
});

QUnit.test('2 is middle of 3', assert => {
    const expected = true;
    const actual = TileCanvas.isMiddle(2, 3);

    assert.equal(actual, expected);
});

QUnit.test('3 is middle of 5', assert => {
    const expected = true;
    const actual = TileCanvas.isMiddle(3, 5);

    assert.equal(actual, expected);
});

QUnit.test('2 not middle of 5', assert => {
    const expected = false;
    const actual = TileCanvas.isMiddle(2, 5);

    assert.equal(actual, expected);
});

QUnit.test('0 not middle of 1', assert => {
    const expected = false;
    const actual = TileCanvas.isMiddle(0, 1);

    assert.equal(actual, expected);
});

QUnit.test('0 not middle of 0', assert => {
    const expected = false;
    const actual = TileCanvas.isMiddle(0, 0);

    assert.equal(actual, expected);
});

QUnit.test('-2 not middle of -3', assert => {
    const expected = false;
    const actual = TileCanvas.isMiddle(-2, -3);

    assert.equal(actual, expected);
});

QUnit.test('-2 not middle of 3', assert => {
    const expected = false;
    const actual = TileCanvas.isMiddle(-2, 3);

    assert.equal(actual, expected);
});

QUnit.test('3 is middle of 6', assert => {
    const expected = true;
    const actual = TileCanvas.isMiddle(3, 6);

    assert.equal(actual, expected);
});

QUnit.test('4 is middle of 6', assert => {
    const expected = true;
    const actual = TileCanvas.isMiddle(4, 6);

    assert.equal(actual, expected);
});

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
    const expected = T.tiles2x2;
    const actual = TileCanvas.getTiles(2, 2, 20, 20);

    assert.deepEqual(actual, expected);
});

QUnit.test('get tiles 3x3', assert => {
    const expected = T.tiles3x3;
    const actual = TileCanvas.getTiles(3, 3, 30, 30);

    assert.deepEqual(actual, expected);
});