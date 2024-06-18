import * as THREE from 'three';
import { Octree } from '../libs/Octree';
import { LAYER_POINTS } from '@cutie/web3d/src/constants';

type LodIndexConfig = {
    distance: number;
    k: number;
    index: THREE.BufferAttribute;
};

const calcDistance = (point: THREE.Vector3, box: THREE.Box3): number => {
    let distance = 0;
    for (let i = 0; i < 3; i++) {
        if (point.getComponent(i) < box.min.getComponent(i)) {
            const d = box.min.getComponent(i) - point.getComponent(i);
            distance += d * d;
        } else if (point.getComponent(i) > box.max.getComponent(i)) {
            const d = point.getComponent(i) - box.max.getComponent(i);
            distance += d * d;
        }
    }
    return Math.sqrt(distance);
}

export class TFrustumCulledPoints extends THREE.Points {
    private readonly octree: Octree;
    private readonly indexLod: readonly LodIndexConfig[];

    constructor(points: THREE.Points, octree: Octree, indexLod: readonly LodIndexConfig[], depth: number = 0) {
        const geometry = new THREE.BufferGeometry();
        geometry.attributes = points.geometry.attributes;

        geometry.boundingBox = octree.box;
        const boundingSphere = new THREE.Sphere();
        octree.box.getBoundingSphere(boundingSphere);
        geometry.boundingSphere = boundingSphere;

        super(geometry, points.material);
        this.octree = octree;
        this.indexLod = indexLod;
        this.layers.enable(LAYER_POINTS);

        if (octree.subTrees.length > 0) {
            this.geometry.setDrawRange(0, 0);
            for (const subTree of octree.subTrees) {
                this.add(new TFrustumCulledPoints(points, subTree, indexLod, depth + 1));
            }
        } else {
            this.geometry.setDrawRange(octree.index.byteOffset / 4, octree.index.byteLength / 4);
        }
    }

    /**
     * 在渲染前，完成视锥体裁剪剔除
     * 同时尽可能的保证渲染物体的连续性，减少渲染次数
     *
     * @param frustum THREE.Frustum - 相机视锥体
     */
    onBeforeProject(frustum: THREE.Frustum, camera: THREE.OrthographicCamera | THREE.PerspectiveCamera) {
        if (frustum.intersectsBox(this.octree.box)) {
            this.visible = true;
            if (this.children.length > 0) {
                const n = this.octree.index.length;

                if (n < 1_000_000 && this.octree.inside(frustum)) {
                    let level = 0;
                    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
                        const p = new THREE.Vector3();
                        p.setFromMatrixPosition(camera.matrixWorld);
    
                        const dis = calcDistance(p, this.octree.box) / camera.zoom;
                        for (let i = 1; i < this.indexLod.length; i++) {
                            if (dis >= this.indexLod[i].distance) {
                                level = i;
                            }
                        }
                    }
                    this.geometry.setIndex(this.indexLod[level].index);
                    this.geometry.setDrawRange(
                        Math.ceil(this.octree.index.byteOffset / 4 / this.indexLod[level].k),
                        Math.floor(this.octree.index.byteLength / 4 / this.indexLod[level].k)
                    );
                    for (const child of this.children) {
                        child.visible = false;
                    }
                } else {
                    this.geometry.setDrawRange(0, 0);
                    for (const child of this.children) {
                        (child as TFrustumCulledPoints).onBeforeProject(frustum, camera);
                    }
                }
            } else {
                let level = 0;
                if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
                    const p = new THREE.Vector3();
                    p.setFromMatrixPosition(camera.matrixWorld);

                    const dis = calcDistance(p, this.octree.box) / camera.zoom;
                    for (let i = 1; i < this.indexLod.length; i++) {
                        if (dis >= this.indexLod[i].distance) {
                            level = i;
                        }
                    }
                }
                this.geometry.setIndex(this.indexLod[level].index);
                this.geometry.setDrawRange(
                    Math.ceil(this.octree.index.byteOffset / 4 / this.indexLod[level].k),
                    Math.floor(this.octree.index.byteLength / 4 / this.indexLod[level].k)
                );
            }
        } else {
            this.visible = false;
        }
    }

    dispose() {
        this.geometry.dispatchEvent({ type: 'dispose' });
    }
}