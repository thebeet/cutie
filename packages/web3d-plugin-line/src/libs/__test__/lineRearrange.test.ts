import { describe, it, expect } from 'vitest';
import { rearrange } from '../lineRearrange'; // Assuming rejust is exported from 'rejust.ts'
import * as THREE from 'three';

describe('rearrange line point', () => {

    it('should return an empty array when input points are empty', () => {
        const points: THREE.Vector3[] = [];
        const space = 10;
        const result = rearrange(points, space);
        expect(result).toEqual([]);
    });

    it('should return the same single point when only one point is provided', () => {
        const points: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
        const space = 10;
        const result = rearrange(points, space);
        expect(result).toEqual(points);
    });

    it('should return two points when only two points are provided and space is greater than distance between points', () => {
        const points: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 0, 0)];
        const space = 10;
        const result = rearrange(points, space);
        expect(result.length).toBe(2);
        expect(result[0].equals(points[0])).toBeTruthy();
        expect(result[1].equals(points[1])).toBeTruthy();
    });

    it('should return evenly spaced points for a given set of points', () => {
        const points: THREE.Vector3[] = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(10, 0, 0),
            new THREE.Vector3(10, 20, 0)
        ];
        const space = 5;
        const result = rearrange(points, space);
        expect(result.length).toBe(7);
        for (let i = 0; i < result.length - 1; i++) {
            const distance = result[i].distanceTo(result[i + 1]);
            expect(distance).toBeCloseTo(space);
        }
        expect(result[0]).toStrictEqual(points[0]);
        expect(result[6]).toStrictEqual(points[2]);
    });

    // Additional tests can be added to cover more edge cases and scenarios
});