import * as THREE from 'three';

export class TScene extends THREE.Scene {
    constructor() {
        super();
    }

    add(...object: THREE.Object3D<THREE.Object3DEventMap>[]): this {
        super.add(...object);
        this.update();
        return this;
    }

    remove(...object: THREE.Object3D<THREE.Object3DEventMap>[]): this {
        super.remove(...object);
        this.update();
        return this;
    }

    update() {
        // @ts-ignore
        this.dispatchEvent({ type: 'change' });
    }
}