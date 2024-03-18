import { describe, expect, it } from 'vitest';
import { gaussianSmooth3d } from '../gaussianSmooth';
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
        const filteredPoints = gaussianSmooth3d(points, sigma);

        const line = new THREE.Line3(points[0], points[points.length - 1]);
        const v = new THREE.Vector3();
        // Check if the filtered points are close to the expected values
        filteredPoints.forEach((point) => {
            line.closestPointToPoint(point, true, v);
            expect(v.distanceTo(point)).toBeCloseTo(0, 6);
        });
    });
});