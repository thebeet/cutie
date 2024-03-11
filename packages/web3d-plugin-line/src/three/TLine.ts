import * as THREE from 'three';
import { TFrame } from '@cutie/web3d';
import { ALine } from '../types';

const _lineMaterial = new THREE.LineBasicMaterial({
    color: 0xdddd00,
    linewidth: 1000
});

const _lineFocusMaterial = new THREE.LineBasicMaterial({
    color: 0xff3300,
    linewidth: 1000
});

export interface TLineEventMap extends THREE.Object3DEventMap {
    focus: {}
    blur: {}
}

const _sphereGeometry = new THREE.SphereGeometry(0.25, 16, 16);
const _sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

export class TLine extends THREE.Object3D<TLineEventMap> {
    element: ALine;

    private points: THREE.InstancedMesh;
    private lines: THREE.Line;

    constructor(line: ALine) {
        super();
        this.element = line;

        const p = [];
        for (let i = 0; i < this.element.points.length; i += 3) {
            p.push(new THREE.Vector3(this.element.points[i], this.element.points[i + 1], this.element.points[i + 2]));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(p);
        this.lines = new THREE.Line(geometry, _lineMaterial);
        this.add(this.lines);

        this.points = new THREE.InstancedMesh(_sphereGeometry, _sphereMaterial, p.length);
        p.forEach((p, i) => this.points.setMatrixAt(i, new THREE.Matrix4().setPosition(p)));
        this.add(this.points);
        this.matrixAutoUpdate = false;
        this.matrixWorldNeedsUpdate = false;
        this._bindEvent();
    }

    private _bindEvent() {
        this.addEventListener('focus', this._onFocus.bind(this));
        this.addEventListener('blur', this._onBlur.bind(this));
    };

    private _onFocus() {
        this.lines.material = _lineFocusMaterial;
        this.parentFrame.update();
    }

    private _onBlur() {
        this.lines.material = _lineMaterial;
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
        this.lines.raycast(raycaster, innerIntersect);
        if (innerIntersect.length > 0) {
            innerIntersect[0].object = this;
            intersects.push(innerIntersect[0]);
        }
    }

    apply(line: ALine) {
        if (line !== this.element) {
            this.element = line;

            const p = [];
            for (let i = 0; i < this.element.points.length; i += 3) {
                p.push(new THREE.Vector3(this.element.points[i], this.element.points[i + 1], this.element.points[i + 2]));
            }
            this.lines.geometry.dispose();
            const geometry = new THREE.BufferGeometry().setFromPoints(p);
            this.lines.geometry = geometry;

            this.remove(this.points);

            this.points = new THREE.InstancedMesh(_sphereGeometry, _sphereMaterial, p.length);
            p.forEach((p, i) => this.points.setMatrixAt(i, new THREE.Matrix4().setPosition(p)));
            this.add(this.points);
        }
    }

    dispose() {
        this.lines.geometry.dispose();
        this.points.dispose();
    }
}