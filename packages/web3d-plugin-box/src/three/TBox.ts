import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { ABox } from '../types';
import { TFocusableEventMap, TFrame, rbox2Matrix } from '@cutie/web3d';

const _rectMaterial = /*@__PURE__*/ new THREE.MeshBasicMaterial({ name: 'box::surface', color: 0xff0000, opacity: 0.2, transparent: true });
const _rectFocusMaterial = /*@__PURE__*/ new THREE.MeshBasicMaterial({ name: 'box[focus::surface]', color: 0xff0000, opacity: 0.4, transparent: true });
const _edgeMaterial = /*@__PURE__*/ new THREE.LineBasicMaterial({ name: 'box::edge', color: 0xffffff });
const _edgeFocusMaterial = /*@__PURE__*/ new THREE.LineBasicMaterial({ name: 'box[focus]::edge', color: 0x007bff, depthFunc: THREE.AlwaysDepth });
const _boxGeometry = /*@__PURE__*/ new THREE.BoxGeometry();
const _edgesGeometry = /*@__PURE__*/ new THREE.EdgesGeometry(_boxGeometry);

const _o = new THREE.Vector3(0, 0, 0);
const _arrow = new THREE.Vector3(1, 0, 0);

export class TBox extends THREE.Object3D<TFocusableEventMap> {
    private _label: CSS2DObject;
    private _mesh: THREE.Mesh;
    private _edge: THREE.LineSegments;
    element: ABox;

    constructor(box: ABox) {
        super();
        this.matrixAutoUpdate = false;
        this.matrixWorldNeedsUpdate = false;
        this.element = box;
        this.applyMatrix4(rbox2Matrix(box));
        this._mesh = new THREE.Mesh(_boxGeometry, _rectMaterial);
        this.add(this._mesh);
        this._edge = new THREE.LineSegments(_edgesGeometry, _edgeMaterial);
        this.add(this._edge);
        const arrow = new THREE.ArrowHelper(_arrow, _o, 1, 0xffff00);
        this.add(arrow);

        this._label = new CSS2DObject(this._makeLabelDom(box));

        this.add(this._label);

        this._bindEvent();
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

    apply(newValue: ABox) {
        if (this.element !== newValue) {
            this.element = newValue;
            this.matrix.identity();
            this.applyMatrix4(rbox2Matrix(newValue));
            this.updateMatrixWorld(true);
            this.parentFrame.update();
        }
    }

    private _makeLabelDom(rect3d: ABox) {
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
        this.remove(this._label);
    }
}