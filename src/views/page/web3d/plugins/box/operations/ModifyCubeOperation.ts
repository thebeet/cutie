import { Operation } from '@web3d/operator/Operation';
import { AnswerContent } from '@web3d/types';
import { Cube } from '../types';

export class ModifyCubeOperation implements Operation {
    newValue: Cube;

    constructor(newValue: Cube) {
        this.newValue = newValue;
    }

    get description(): string {
        return 'ModifyCube';
    }

    apply(answer: AnswerContent): void {
        for (let i = 0; i < answer.elements.length; i++) {
            if (answer.elements[i].uuid === this.newValue.uuid) {
                answer.elements[i] = this.newValue;
                break;
            }
        }
    }
}