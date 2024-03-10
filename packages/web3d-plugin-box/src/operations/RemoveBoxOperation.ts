import { AnswerContent, Operation } from '@cutie/web3d';
import { ABox } from '../types';

export class RemoveBoxOperation implements Operation {
    readonly box: ABox;

    constructor(box: ABox) {
        this.box = box;
    }

    get description(): string {
        return 'RemoveBox';
    }

    apply(answer: AnswerContent): AnswerContent {
        return {
            ...answer,
            elements: answer.elements.filter(element => element.uuid !== this.box.uuid)
        };
    }
}