import { describe, expect, it } from 'vitest';
import { gaussianFilter3d } from '../gaussianFilter';
import * as THREE from 'three';

describe('gaussianFilter3d', () => {
    it('should apply a Gaussian filter to a 3D array of points', () => {
        // Define a simple array of points
        const points = [
            new THREE.Vector3(1, 2, 3),
            new THREE.Vector3(4, 5, 6),
            new THREE.Vector3(7, 8, 9),
        ];

        const sigma = 1.0;

        // Call the gaussianFilter3d function
        const filteredPoints = gaussianFilter3d(points, sigma);

        const expectedFilteredPoints = [
            new THREE.Vector3(1.7452342755138137, 2.4403263671647974, 3.135418458815781),
            new THREE.Vector3(3.5324909536187343, 4.415613692023418, 5.298736430428101),
            new THREE.Vector3(3.815502457694056, 4.51059454934504, 5.205686640996023),
        ];

        // Check if the filtered points are close to the expected values
        filteredPoints.forEach((point, index) => {
            expect(point.x).toBeCloseTo(expectedFilteredPoints[index].x);
            expect(point.y).toBeCloseTo(expectedFilteredPoints[index].y);
            expect(point.z).toBeCloseTo(expectedFilteredPoints[index].z);
        });
    });
});