import { describe, expect, test } from 'vitest';
import * as THREE from 'three';
import { DouglasPeucker } from './DouglasPeucker';

describe('DouglasPeucker', () => {
    test('one line', () => {
        const line = new Array(30).map((_, i) => new THREE.Vector2(i * 0.1, i * 0.2));
        const result = DouglasPeucker(line, 0.001);
        expect(result.length).toBe(2);
        const resultReverse = DouglasPeucker(line.reverse(), 0.001);
        expect(resultReverse.length).toBe(2);
    });

    test('rect', () => {
        const rect = [
            [1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [2, 1]
        ].map(([x, y]) => new THREE.Vector2(x, y));
        const result = DouglasPeucker(rect, 0.001);
        expect(result).toStrictEqual([
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, 3),
            new THREE.Vector2(3, 3),
            new THREE.Vector2(3, 1),
            new THREE.Vector2(2, 1),
        ]);
    });

    test('rect with small change < esp', () => {
        const rect = [
            [1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3.001, 2], [3, 1], [2, 1]
        ].map(([x, y]) => new THREE.Vector2(x, y));
        const result = DouglasPeucker(rect, 0.001);
        expect(result).toStrictEqual([
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, 3),
            new THREE.Vector2(3, 3),
            new THREE.Vector2(3, 1),
            new THREE.Vector2(2, 1),
        ]);
    });

    test('rect with small change but large than esp', () => {
        const rect = [
            [1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3.0021, 2], [3, 1], [2, 1]
        ].map(([x, y]) => new THREE.Vector2(x, y));
        const result = DouglasPeucker(rect, 0.001);
        expect(result).toStrictEqual([
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, 3),
            new THREE.Vector2(3, 3),
            new THREE.Vector2(3.0021, 2),
            new THREE.Vector2(3, 1),
            new THREE.Vector2(2, 1),
        ]);
    });
});
