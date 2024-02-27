import * as THREE from 'three';
import { TFrame } from '@web3d/three/TFrame';
import { ALine } from '../types';

const _lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000,
    linewidth: 1000
});

const _lineM = new THREE.RawShaderMaterial( {
    glslVersion: THREE.GLSL3,
    uniforms: {
        color: { value: [1, 1, 0, 1] }
    },
    vertexShader: `
    precision lowp float;
    in vec3 position;
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
    linewidth: 1000,
    fragmentShader: `
    precision lowp float;
    uniform vec4 color;
    out vec4 o_FragColor;
    void main() {
        o_FragColor = color;
    }`,

} );

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

        console.log(this.lines)
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