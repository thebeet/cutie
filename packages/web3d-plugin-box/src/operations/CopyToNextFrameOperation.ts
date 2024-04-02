import { AnswerContent, Operation } from '@cutie/web3d';
import { ABox } from '../types';
import * as THREE from 'three';

export class CopyToNextFrameOperation implements Operation {
    readonly boxes: readonly ABox[];

    constructor(boxes: readonly ABox[]) {
        this.boxes = boxes;
    }

    get description(): string {
        return 'copy box to next frame';
    }

    apply(answer: AnswerContent): AnswerContent {
        const newBoxes = this.boxes.map(box => ({
            ...box,
            uuid: THREE.MathUtils.generateUUID(),
            frameIndex: box.frameIndex + 1,
        }));
        return { ...answer, elements: [...answer.elements, ...newBoxes] };
    }
}