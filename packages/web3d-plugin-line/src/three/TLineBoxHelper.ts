import * as THREE from 'three';
import { RBox, TFrame, rbox2Matrix } from '@cutie/web3d';
import { ALine } from '../types';

const _boxGeometry = /*@__PURE__*/ new THREE.BoxGeometry();
const _edgesGeometry = /*@__PURE__*/ new THREE.EdgesGeometry(_boxGeometry);
const _edgeMaterial = /*@__PURE__*/ new THREE.LineBasicMaterial({ color: 0xffffff });

export class TLineBoxHelper extends THREE.Object3D {
    element: ALine;
    private boxes: THREE.LineSegments[]; // slow, debug only
    constructor(line: ALine) {
        super();
        this.element = line;
        this.boxes = [];

        for (let i = 0; i < this.element.points.length - 3; i += 3) {
            const start = new THREE.Vector3(
                this.element.points[i],
                this.element.points[i + 1],
                this.element.points[i + 2]);
            const end = new THREE.Vector3(
                this.element.points[i + 3],
                this.element.points[i + 4],
                this.element.points[i + 5]);
            const size = .5;
            const center = start.clone().add(end).multiplyScalar(0.5);
            const vx = new THREE.Vector3(1, 0, 0);
            const vtarget = end.clone().sub(start).normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(vx, vtarget);
            const euler = new THREE.Euler().setFromQuaternion(quaternion);
            const rBox = {
                position: { x: center.x, y: center.y, z: center.z },
                size: { x: start.distanceTo(end) + size * 2, y: size * 2, z: size * 2 },
                rotation: { x: euler.x, y: euler.y, z: euler.z },
            } as RBox;
            const edge = new THREE.LineSegments(_edgesGeometry, _edgeMaterial);
            edge.applyMatrix4(rbox2Matrix(rBox));
            this.boxes.push(edge);
            this.add(edge);
        }

        this.matrixAutoUpdate = false;
        this.matrixWorldNeedsUpdate = false;
        this._bindEvent();
    }

    private _bindEvent() {
        this.addEventListener('focus', this._onFocus.bind(this));
        this.addEventListener('blur', this._onBlur.bind(this));
    };

    private _onFocus() {
        this.parentFrame.update();
    }

    private _onBlur() {
        this.parentFrame.update();
    }

    get parentFrame() {
        return this.parent as TFrame;
    }

    apply(line: ALine) {
        if (line !== this.element) {
        }
    }

    dispose() {
    }
}