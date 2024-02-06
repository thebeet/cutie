import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { Cube } from '../types';

const _rectMaterial = /*@__PURE__*/ new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.4, transparent: true });
const _edgeMaterial = /*@__PURE__*/ new THREE.LineBasicMaterial({ color: 0xffffff });
const _boxGeometry = /*@__PURE__*/ new THREE.BoxGeometry();
const _edgesGeometry = /*@__PURE__*/ new THREE.EdgesGeometry(_boxGeometry);

export class TCube extends THREE.Object3D {
    private _label: CSS2DObject;
    private _rect: Cube;

    constructor(rect3d: Cube) {
        super();
        this._rect = rect3d;
        this.applyMatrix4(
            new THREE.Matrix4().makeScale(rect3d.size.length, rect3d.size.width, rect3d.size.height));
        this.applyMatrix4(
            new THREE.Matrix4().makeTranslation(rect3d.position.x, rect3d.position.y, rect3d.position.z)
                .multiply(new THREE.Matrix4().makeRotationFromEuler(
                    new THREE.Euler(rect3d.rotation.phi, rect3d.rotation.psi, rect3d.rotation.theta))));
        this.add(new THREE.Mesh(_boxGeometry, _rectMaterial));
        this.add(new THREE.LineSegments(_edgesGeometry, _edgeMaterial));

        const div = document.createElement('div');
        div.textContent = rect3d.label;
        div.style.padding = '2px';
        div.style.color = '#fff';
        div.style.marginTop = '-1em';
        div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        div.style.fontSize = '14px';
        div.style.pointerEvents = 'none';
        div.style.userSelect = 'none';
        this._label = new CSS2DObject(div);
        this.add(this._label);
    }

    apply(newValue: Cube) {
        if (this._rect !== newValue) {
            this.applyMatrix4(
                new THREE.Matrix4().makeScale(newValue.size.length, newValue.size.width, newValue.size.height));
            this.applyMatrix4(
                new THREE.Matrix4().makeTranslation(newValue.position.x, newValue.position.y, newValue.position.z)
                    .multiply(new THREE.Matrix4().makeRotationFromEuler(
                        new THREE.Euler(newValue.rotation.phi, newValue.rotation.psi, newValue.rotation.theta))));
            this._rect = newValue;
        }
    }

    get worldVisible() {
        let parent: THREE.Object3D | null = this;
        if (this.visible === false) {
            return false;
        }
        while (parent) {
            if (!parent.visible) {
                return false;
            }
            parent = parent.parent;
        }
        return true;
    }

    get isTCube() {
        return true;
    }
    dispose() {
        this.remove(this._label);
    }
}