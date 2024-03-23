import { describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import { RBox } from '../types';
import { rbox2Matrix, rboxIOUBruteforce } from './rbox';

describe('rbox2Matrix', () => {
    test('normal box should return normal matrix', () => {
        const rbox: RBox = {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 }
        };

        const result = rbox2Matrix(rbox);
        expect(result.elements).toStrictEqual([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    });

    test('box center should projection to (0, 0, 0)', () => {
        const rbox: RBox = {
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: Math.random(), y: Math.random(), z: Math.random() },
            size: { x: Math.random(), y: Math.random(), z: Math.random() }
        };

        const result = rbox2Matrix(rbox).invert();
        const v = new Vector3(1, 2, 3);
        v.applyMatrix4(result);
        expect(v.x).toBeCloseTo(0);
        expect(v.y).toBeCloseTo(0);
        expect(v.z).toBeCloseTo(0);
    });

    test('box cornor should projection to normal cube cornor', () => {
        const rbox: RBox = {
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 }
        };

        const result = rbox2Matrix(rbox).invert();
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const v = new Vector3(1 + x, 2 + y, 3 + z);
                    v.applyMatrix4(result);
                    expect(v.x).toBeCloseTo(x);
                    expect(v.y).toBeCloseTo(y);
                    expect(v.z).toBeCloseTo(z);
                }
            }
        }
    });

    test('rotate box cornor should projection to normal cube cornor', () => {
        const rbox: RBox = {
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: 0, y: 0, z: Math.PI / 4 },
            size: { x: 1, y: 1, z: 1 }
        };

        const result = rbox2Matrix(rbox).invert();
        const v = new Vector3(1 + Math.sqrt(2) / 2, 2 + Math.sqrt(2) / 2, 3);
        v.applyMatrix4(result);
        expect(v.x).toBeCloseTo(1);
        expect(v.y).toBeCloseTo(0);
        expect(v.z).toBeCloseTo(0);
    });

    test('same boxes iou should return 1', () => {
        const rbox1: RBox = {
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: Math.random(), y: Math.random(), z: Math.random() },
            size: { x: 1, y: 1, z: 1 }
        };

        const result = rboxIOUBruteforce(rbox1, rbox1);
        expect(result).toBeCloseTo(1);
    });

    test('box inside other box', () => {
        const rbox1: RBox = {
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: Math.random(), y: Math.random(), z: Math.random() },
            size: { x: 2, y: 2, z: 2 }
        };
        const rbox2: RBox = {
            position: { x: 1, y: 2, z: 3 },
            rotation: rbox1.rotation,
            size: { x: 1, y: 1, z: 1 }
        };

        const result = rboxIOUBruteforce(rbox1, rbox2);
        expect(result).toBeCloseTo(1 / 8);
    });

    test('box offset', () => {
        const rbox1: RBox = {
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: 0, y: 0, z: 0 },
            size: { x: 2, y: 2, z: 2 }
        };
        const rbox2: RBox = {
            position: { x: 2, y: 3, z: 4 },
            rotation: rbox1.rotation,
            size: { x: 2, y: 2, z: 2 }
        };
        const result = rboxIOUBruteforce(rbox1, rbox2);
        expect(result).toBeCloseTo(1 / 15);
    });
});