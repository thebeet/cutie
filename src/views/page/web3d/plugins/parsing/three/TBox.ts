import * as THREE from 'three';
import { RBox } from '../types';
import { TFrame } from '@web3d/three/TFrame';
import { rbox2Matrix } from '@web3d/utils/rbox';

const _rectMaterial = /*@__PURE__*/ new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.2, transparent: true });
const _edgeMaterial = /*@__PURE__*/ new THREE.LineBasicMaterial({ color: 0xffffff });
const _boxGeometry = /*@__PURE__*/ new THREE.BoxGeometry();
const _edgesGeometry = /*@__PURE__*/ new THREE.EdgesGeometry(_boxGeometry);

export interface TBoxEventMap extends THREE.Object3DEventMap {
    focus: {}
    blur: {}
}

export class TBox extends THREE.Object3D<TBoxEventMap> {
    private _mesh: THREE.Mesh;
    private _edge: THREE.LineSegments;
    box: RBox;

    constructor(box: RBox) {
        super();
        this.matrixAutoUpdate = false;
        this.matrixWorldNeedsUpdate = false;
        this.box = box;
        this.applyMatrix4(rbox2Matrix(box));
        this._mesh = new THREE.Mesh(_boxGeometry, _rectMaterial);
        //this.add(this._mesh);
        this._edge = new THREE.LineSegments(_edgesGeometry, _edgeMaterial);
        this.add(this._edge);
    }

    apply(newValue: RBox) {
        if (this.box !== newValue) {
            this.box = newValue;
            this.matrix.identity();
            this.applyMatrix4(rbox2Matrix(newValue));
            this.updateMatrixWorld(true);
            this.parentFrame.update();
        }
    }

    get parentFrame() {
        return this.parent as TFrame;
    }

    get isTCube() {
        return true;
    }

    raycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) {
        const innerIntersect = [] as THREE.Intersection[];
        this._mesh.raycast(raycaster, innerIntersect);
        if (innerIntersect.length > 0) {
            innerIntersect[0].object = this;
            intersects.push(innerIntersect[0]);
        }
    }
}