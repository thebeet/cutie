import { Operation } from '@web3d/operator/Operation';
import { AnswerContent } from '@web3d/types';
import { Cube } from '../types';

export class RemoveBoxOperation implements Operation {
    box: Cube;

    constructor(box: Cube) {
        this.box = box;
    }

    get description(): string {
        return 'RemoveBox';
    }

    apply(answer: AnswerContent): void {
        answer.elements = answer.elements.filter(element => element.uuid !== this.box.uuid);
    }
}