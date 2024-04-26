import * as THREE from 'three';
import { Octree } from '../libs/Octree';

export class TFrustumCulledPoints extends THREE.Points {
    private readonly octree: Octree;
    private readonly depth: number;

    constructor(points: THREE.Points, octree: Octree, bufferIndex?: THREE.BufferAttribute, depth: number = 0) {
        const geometry = new THREE.BufferGeometry();
        geometry.attributes = points.geometry.attributes;
        const index = bufferIndex ?? new THREE.BufferAttribute(octree.index, 1);
        geometry.index = index;

        geometry.boundingBox = octree.box;
        const boundingSphere = new THREE.Sphere();
        octree.box.getBoundingSphere(boundingSphere);
        geometry.boundingSphere = boundingSphere;

        super(geometry, points.material);

        this.octree = octree;
        this.depth = depth;

        if (octree.subTrees.length > 0 && depth < 6) {
            this.geometry.setDrawRange(0, 0);
            for (const subTree of octree.subTrees) {
                this.add(new TFrustumCulledPoints(points, subTree, index, depth + 1));
            }
        } else {
            this.geometry.setDrawRange(octree.index.byteOffset / 4, octree.index.byteLength / 4);
        }
    }

    dispose() {
        this.geometry.dispatchEvent({ type: 'dispose' });
    }
}