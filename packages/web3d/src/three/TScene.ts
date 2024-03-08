import * as THREE from 'three';

export class TScene extends THREE.Scene {
    constructor() {
        super();
        this.matrixWorldAutoUpdate = false;
        this.matrixAutoUpdate = false;
    }

    add(...object: THREE.Object3D<THREE.Object3DEventMap>[]): this {
        super.add(...object);
        for (const obj of object) {
            obj.matrixWorldNeedsUpdate = true;
        }
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