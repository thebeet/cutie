import * as THREE from 'three';
import { Octree } from '../libs/Octree';
import { LAYER_POINTS } from '@cutie/web3d/src/constants';

export class TFrustumCulledPoints extends THREE.Points {
    private readonly octree: Octree;

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
        this.layers.enable(LAYER_POINTS);

        if (octree.subTrees.length > 0) {
            this.geometry.setDrawRange(0, 0);
            for (const subTree of octree.subTrees) {
                this.add(new TFrustumCulledPoints(points, subTree, index, depth + 1));
            }
        } else {
            this.geometry.setDrawRange(octree.index.byteOffset / 4, octree.index.byteLength / 4);
        }
    }

    /**
     * 在渲染前，完成视锥体裁剪剔除
     * 尽可能的保证渲染物体的连续性，减少渲染次数
     *
     * @param frustum THREE.Frustum - 相机视锥体
     */
    onBeforeProject(frustum: THREE.Frustum) {
        if (frustum.intersectsBox(this.octree.box)) {
            this.visible = true;
            if (this.children.length > 0) {
                if (this.octree.inside(frustum)) {
                    this.geometry.setDrawRange(this.octree.index.byteOffset / 4, this.octree.index.byteLength / 4);
                    for (const child of this.children) {
                        child.visible = false;
                    }
                } else {
                    this.geometry.setDrawRange(0, 0);
                    for (const child of this.children) {
                        (child as TFrustumCulledPoints).onBeforeProject(frustum);
                    }
                }
            } else {
                this.geometry.setDrawRange(this.octree.index.byteOffset / 4, this.octree.index.byteLength / 4);
            }
        } else {
            this.visible = false;
        }
    }

    dispose() {
        this.geometry.dispatchEvent({ type: 'dispose' });
    }
}