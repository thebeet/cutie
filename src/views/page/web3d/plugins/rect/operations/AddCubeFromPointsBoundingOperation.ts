import { Operation } from '@web3d/operator/Operation';
import { AnswerContent } from '@web3d/types';
import { TFrame } from '@web3d/three/TFrame';
import * as THREE from 'three';
import { Cube } from '../types';

//import * as MathUtils from 'three/math/MathUtils.js';

export class AddCubeFromPointsBoundingOperation implements Operation {
    private frame: TFrame;
    private index: number[];

    constructor(frame: TFrame, index: number[]) {
        this.frame = frame;
        this.index = index;
    }

    /**
     * 计算边界框
     *
     * @returns {THREE.Box3} 边界框
     */
    computeBoundingBox(): THREE.Box3 {
        const box = new THREE.Box3(
            new THREE.Vector3(Infinity, Infinity, Infinity),
            new THREE.Vector3(-Infinity, -Infinity, -Infinity)
        );
        const position = this.frame.points!.geometry.getAttribute('position');
        const _v = new THREE.Vector3();
        this.index.forEach(i => {
            _v.fromBufferAttribute(position, i);
            box.min.min(_v);
            box.max.max(_v);
        });
        return box;
    }

    apply(answer: AnswerContent): void {
        const box = this.computeBoundingBox();
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);
        answer.elements.push({
            uuid: THREE.MathUtils.generateUUID(),
            schema: 'cube',
            type: 'cube',
            frameIndex: this.frame.index,
            label: 'label',
            description: 'description',
            position: {
                x: center.x,
                y: center.y,
                z: center.z,
            },
            size: {
                length: size.x,
                width: size.y,
                height: size.z,
            },
            rotation: {
                phi: 0,
                psi: 0,
                theta: 0
            }
        } as Cube);
    }

}