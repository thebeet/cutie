import * as THREE from 'three';

export class TScene extends THREE.Scene {
    constructor() {
        super();
        this.matrixWorldAutoUpdate = false;
        this.matrixAutoUpdate = false;
    }

    update() {
        // @ts-ignore
        this.dispatchEvent({ type: 'change' });
    }
}