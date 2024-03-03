import * as THREE from 'three';
import { TFrame } from '@web3d/three/TFrame';
import { ALine } from '../types';

const _lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000,
    linewidth: 1000
});

export interface TLineEventMap extends THREE.Object3DEventMap {
    focus: {}
    blur: {}
}

export class TLine extends THREE.Object3D<TLineEventMap> {
    line: ALine;

    lines: THREE.Line;

    constructor(line: ALine) {
        super();
        this.line = line;

        const p = [];
        for (let i = 0; i < this.line.points.length; i += 3) {
            p.push(new THREE.Vector3(this.line.points[i], this.line.points[i + 1], this.line.points[i + 2]));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(p);
        this.lines = new THREE.Line(geometry, _lineMaterial);
        this.add(this.lines);

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

    dispose() {
    }
}