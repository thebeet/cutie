import * as THREE from 'three';

const geometry = (() => {
    const vertices = new Float32Array([
        0.0, 0.0, 0.0,
        0.05, 0.0, 0.0,
        0.2, 0.0, 0.0,
        0.25, 0.0, 0.0,
        -0.1, 0.3, 0.0,
        -0.05, 0.3, 0.0,
        0.1, 0.3, 0.0,
        0.15, 0.3, 0.0,
        -0.1, -0.3, 0.0,
        -0.05, -0.3, 0.0,
        0.1, -0.3, 0.0,
        0.15, -0.3, 0.0,
    ]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex([
        0, 1, 4,
        1, 0, 8,
        2, 3, 6,
        3, 2, 10,
        8, 9, 1,
        10, 11, 3,
        5, 4, 1,
        7, 6, 3,
        // gap
        1, 2, 5,
        2, 1, 9,
        9, 10, 2,
        6, 5, 2,
    ]);
    geometry.addGroup(0, 24, 0);
    geometry.addGroup(24, 12, 1);
    return geometry;
})();
const gapMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
const defaultMaterial = [new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.4, color: 0xffffff, side: THREE.DoubleSide }), gapMaterial];
const hoverMaterial = [new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), gapMaterial];

export class TBoxMotion extends THREE.Mesh {
    constructor() {
        super(geometry, defaultMaterial);
    }
}