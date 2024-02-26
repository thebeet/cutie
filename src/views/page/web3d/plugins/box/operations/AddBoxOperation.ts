import { Operation } from '@web3d/operator/Operation';
import { AnswerContent } from '@web3d/types';
import { TFrame } from '@web3d/three/TFrame';
import * as THREE from 'three';
import { ABox } from '../types';

export class AddBoxOperation implements Operation {
    private index: number[];
    frame: TFrame;
    result: ABox;

    constructor(frame: TFrame, index: number[], euler: THREE.Euler) {
        this.frame = frame;
        this.index = index;
        this.result = {
            uuid: THREE.MathUtils.generateUUID(),
            schema: 'box',
            type: 'box',
            frameIndex: frame.index,
            label: 'label',
            description: 'description',
            position: {
                x: 0,
                y: 0,
                z: 0,
            },
            size: {
                x: 1,
                y: 1,
                z: 1,
            },
            rotation: {
                x: euler.x,
                y: euler.y,
                z: euler.z,
            }
        };
    }

    get description(): string {
        return '添加立方体';
    }

    /**
     * 计算边界框
     */
    computeBoundingBox() {
        const box = new THREE.Box3(
            new THREE.Vector3(Infinity, Infinity, Infinity),
            new THREE.Vector3(-Infinity, -Infinity, -Infinity)
        );
        const position = this.frame.points!.geometry.getAttribute('position');
        const _v = new THREE.Vector3();
        const quaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(this.result.rotation.x, this.result.rotation.y, this.result.rotation.z));
        const invertQuaternion = quaternion.clone().invert();
        this.index.forEach(i => {
            _v.fromBufferAttribute(position, i).applyQuaternion(invertQuaternion);
            box.min.min(_v);
            box.max.max(_v);
        });
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);
        center.applyQuaternion(quaternion);
        center.applyMatrix4(this.frame.matrixWorld.clone().invert());
        return { box, center, size };
    }

    apply(answer: AnswerContent): void {
        const { center, size } = this.computeBoundingBox();
        this.result.position.x = center.x;
        this.result.position.y = center.y;
        this.result.position.z = center.z;
        this.result.size.x = size.x;
        this.result.size.y = size.y;
        this.result.size.z = size.z;
        answer.elements.push(this.result);
    }

}