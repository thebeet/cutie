import * as THREE from 'three';
import { ParsingBox } from '../types';
import { TFrame, rbox2Matrix } from '@cutie/web3d';

const _rectMaterial = /*@__PURE__*/ new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0, transparent: true });
const _edgeMaterial = /*@__PURE__*/ new THREE.LineBasicMaterial({ color: 0xffffff });
const _rectFocusMaterial = /*@__PURE__*/ new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0, transparent: true });
const _edgeFocusMaterial = /*@__PURE__*/ new THREE.LineBasicMaterial({ color: 0x007bff, depthFunc: THREE.AlwaysDepth });
const _boxGeometry = /*@__PURE__*/ new THREE.BoxGeometry();
const _edgesGeometry = /*@__PURE__*/ new THREE.EdgesGeometry(_boxGeometry);

export interface TBoxEventMap extends THREE.Object3DEventMap {
    focus: {}
    blur: {}
}

export class TBox extends THREE.Object3D<TBoxEventMap> {
    private _mesh: THREE.Mesh;
    private _edge: THREE.LineSegments;
    element: ParsingBox;

    constructor(box: ParsingBox) {
        super();
        this.matrixAutoUpdate = false;
        this.matrixWorldNeedsUpdate = false;
        this.element = box;
        this.applyMatrix4(rbox2Matrix(box));
        this._mesh = new THREE.Mesh(_boxGeometry, _rectMaterial);
        this.add(this._mesh);
        this._edge = new THREE.LineSegments(_edgesGeometry, _edgeMaterial);

        this._bindEvent();
        this.add(this._edge);
    }

    apply(newValue: ParsingBox) {
        if (this.element !== newValue) {
            this.element = newValue;
            this.matrix.identity();
            this.applyMatrix4(rbox2Matrix(newValue));
            this.updateMatrixWorld(true);
            this.parentFrame.update();
        }
    }

    private _bindEvent() {
        this.addEventListener('focus', this._onFocus.bind(this));
        this.addEventListener('blur', this._onBlur.bind(this));
    };

    private _onFocus() {
        this._mesh.material = _rectFocusMaterial;
        this._edge.material = _edgeFocusMaterial;
        this.parentFrame.update();
    }

    private _onBlur() {
        this._mesh.material = _rectMaterial;
        this._edge.material = _edgeMaterial;
        this.parentFrame.update();
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
            let intersect = innerIntersect[0];
            for (let i = 1; i < innerIntersect.length; i++) {
                if (innerIntersect[i].distance < intersect.distance) {
                    intersect = innerIntersect[i];
                }
            }
            intersect.object = this;
            intersects.push(intersect);
        }
    }

    dispose() {
    }
}