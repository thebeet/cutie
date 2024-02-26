import * as THREE from 'three';
import { TFrame } from '@web3d/three/TFrame';
import { ALine } from '../types';

export interface TCubeEventMap extends THREE.Object3DEventMap {
    focus: {}
    blur: {}
}

export class TLine extends THREE.Object3D<TCubeEventMap> {
    line: ALine;

    constructor(line: ALine) {
        super();
        this.line = line;
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
        if (innerIntersect.length > 0) {
            innerIntersect[0].object = this;
            intersects.push(innerIntersect[0]);
        }
    }

    dispose() {
    }
}