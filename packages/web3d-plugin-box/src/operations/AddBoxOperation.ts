import { AnswerContent, Operation, TFrame } from '@cutie/web3d';
import * as THREE from 'three';
import { ABox } from '../types';

const ESP = 1e-6;

export class AddBoxOperation implements Operation {
    private points: [TFrame, number[]][];
    readonly frame: TFrame;
    result: ABox;

    constructor(frame: TFrame, points: [TFrame, number[]][], euler: THREE.Euler) {
        this.frame = frame;
        this.points = points;
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
    computeBoundingBox(frame: TFrame, index: number[]) {
        const box = new THREE.Box3(
            new THREE.Vector3(Infinity, Infinity, Infinity),
            new THREE.Vector3(-Infinity, -Infinity, -Infinity)
        );
        const position = frame.points!.geometry.getAttribute('position');
        const _v = new THREE.Vector3();
        const quaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(this.result.rotation.x, this.result.rotation.y, this.result.rotation.z));
        const invertQuaternion = quaternion.clone().invert();
        index.forEach(i => {
            _v.fromBufferAttribute(position, i).applyQuaternion(invertQuaternion);
            box.min.min(_v);
            box.max.max(_v);
        });
        return box;
    }

    apply(answer: AnswerContent): AnswerContent {
        const boxes = this.points.map(([frame, points]) => {
            return this.computeBoundingBox(frame, points);
        });
        const unionBox = boxes.reduce((acc, box) => acc.union(box), new THREE.Box3(
            new THREE.Vector3(Infinity, Infinity, Infinity),
            new THREE.Vector3(-Infinity, -Infinity, -Infinity)
        ));
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        unionBox.getCenter(center);
        unionBox.getSize(size);
        const quaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(this.result.rotation.x, this.result.rotation.y, this.result.rotation.z));
        center.applyQuaternion(quaternion);
        center.applyMatrix4(this.frame.matrixWorld.clone().invert());

        this.result = {
            ...this.result,
            position: {
                x: center.x,
                y: center.y,
                z: center.z,
            },
            size: {
                x: size.x + ESP,
                y: size.y + ESP,
                z: size.z + ESP,
            }
        };
        return {
            ...answer,
            elements: [...answer.elements, this.result]
        };
    }
}