import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { Cube } from '../types';
import { TFrame } from '@web3d/three/TFrame';
import { rbox2Matrix } from '@web3d/utils/rbox';

const _rectMaterial = /*@__PURE__*/ new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.4, transparent: true });
const _edgeMaterial = /*@__PURE__*/ new THREE.LineBasicMaterial({ color: 0xffffff });
const _boxGeometry = /*@__PURE__*/ new THREE.BoxGeometry();
const _edgesGeometry = /*@__PURE__*/ new THREE.EdgesGeometry(_boxGeometry);

const _o = new THREE.Vector3(0, 0, 0);
const _arrow = new THREE.Vector3(1, 0, 0);

export class TCube extends THREE.Object3D {
    private _label: CSS2DObject;
    private _rect: Cube;

    constructor(rect3d: Cube) {
        super();
        this.matrixAutoUpdate = false;
        this.matrixWorldNeedsUpdate = false;
        this._rect = rect3d;
        this.applyMatrix4(rbox2Matrix(rect3d));
        const mesh = new THREE.Mesh(_boxGeometry, _rectMaterial);
        this.add(mesh);
        const edge = new THREE.LineSegments(_edgesGeometry, _edgeMaterial);
        this.add(edge);
        const arrow = new THREE.ArrowHelper(_arrow, _o, 1, 0xffff00);
        this.add(arrow);

        this._label = new CSS2DObject(this._makeLabelDom(rect3d));

        this.add(this._label);
    }

    apply(newValue: Cube) {
        if (this._rect !== newValue) {
            this._rect = newValue;
            this.matrix.identity();
            this.applyMatrix4(rbox2Matrix(newValue));
            this.updateMatrixWorld(true);
            this.parentFrame.update();
        }
    }

    private _makeLabelDom(rect3d: Cube) {
        const div = document.createElement('div');
        div.textContent = rect3d.label;
        div.style.padding = '2px';
        div.style.color = '#fff';
        div.style.marginTop = '-1em';
        div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        div.style.fontSize = '14px';
        div.style.pointerEvents = 'none';
        div.style.userSelect = 'none';
        return div;
    }

    get parentFrame() {
        return this.parent as TFrame;
    }

    get isTCube() {
        return true;
    }

    dispose() {
        this.remove(this._label);
    }
}