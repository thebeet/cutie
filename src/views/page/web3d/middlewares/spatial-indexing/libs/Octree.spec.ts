import { expect, describe, test } from 'vitest';
import * as THREE from 'three';
import { Octree } from './Octree';

describe('Octree rebuild', () => {
    const position = new Float32Array(300_00_00);
    for (let x = 0; x < 100; x++) {
        for (let y = 0; y < 100; y++) {
            for (let z = 0; z < 100; z++) {
                position[x * 30000 + y * 300 + z * 3] = x * 0.01;
                position[x * 30000 + y * 300 + z * 3 + 1] = y * 0.01;
                position[x * 30000 + y * 300 + z * 3 + 2] = z * 0.01;
            }
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    const points = new THREE.Points(geometry);
    const octree = Octree.fromPoints(points);

    const rebuildoctree = Octree.fromSerialization(points, octree.serialization());
    test('rebuildoctree test intersect box', () => {
        let sum = 0;
        expect(rebuildoctree).not.toBe(null);
        rebuildoctree!.intersect(new THREE.Box3(
            new THREE.Vector3(0.299, 0.699, 0.399),
            new THREE.Vector3(0.401, 0.801, 0.501)
        ), () => {
            sum++;
        });
        expect(sum).toBe(11 * 11 * 11);
    });
});