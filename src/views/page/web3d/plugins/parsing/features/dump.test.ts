import { expect, describe, it } from 'vitest';
import * as THREE from 'three';
import { dumpAscii, dumpBinary, FieldX, FieldY, FieldZ } from './dump';
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';

describe('dumpAscii', () => {
    it('should dump ASCII PCD data', () => {
        const points = new THREE.Points(
            new THREE.BufferGeometry().setAttribute('position',
                new THREE.BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3)));
        const fields = [FieldX, FieldY, FieldZ];

        const expected = `VERSION 0.7
FIELDS x y z
SIZE 4 4 4
TYPE F F F
COUNT 1 1 1
WIDTH 3
HEIGHT 1
VIEWPOINT 0 0 0 1 0 0 0
POINTS 3
DATA ascii
0 0 0
1 0 0
0 1 0`;

        const actual = dumpAscii(points, fields);
        expect(actual).toBe(expected);
    });

    it('should handle empty point cloud', () => {
        const points = new THREE.Points(new THREE.BufferGeometry()
            .setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3)));
        const fields = [FieldX, FieldY, FieldZ];

        const expected = `VERSION 0.7
FIELDS x y z
SIZE 4 4 4
TYPE F F F
COUNT 1 1 1
WIDTH 0
HEIGHT 1
VIEWPOINT 0 0 0 1 0 0 0
POINTS 0
DATA ascii
`;

        const actual = dumpAscii(points, fields);
        expect(actual).toBe(expected);
    });
});

describe('dumpBinary', () => {
    const loader = new PCDLoader();
    it('should dump Binary PCD data', () => {
        const points = new THREE.Points(
            new THREE.BufferGeometry().setAttribute('position',
                new THREE.BufferAttribute(new Float32Array([0.1, 0.2, 0.3, 1.1, 0.2, 0.3, 0.1, 1.2, 0.3]), 3)));
        const fields = [FieldX, FieldY, FieldZ];
        const dumped = dumpBinary(points, fields);
        const reloadPoints = loader.parse(dumped);
        const originPosition = points.geometry.attributes.position;
        const reloadPosition = reloadPoints.geometry.attributes.position;
        expect(reloadPosition.count).toBe(originPosition.count);
        for (let i = 0; i < originPosition.count; ++i) {
            expect(reloadPosition.getX(i)).toBeCloseTo(originPosition.getX(i));
            expect(reloadPosition.getY(i)).toBeCloseTo(originPosition.getY(i));
            expect(reloadPosition.getZ(i)).toBeCloseTo(originPosition.getZ(i));
        }
    });
});
