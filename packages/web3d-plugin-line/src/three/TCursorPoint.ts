import * as THREE from 'three';

class TCursorPoint extends THREE.Object3D {
    private _point: THREE.Mesh;
    constructor() {
        super();
        this._point = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 4), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        this.add(this._point);
    }
}