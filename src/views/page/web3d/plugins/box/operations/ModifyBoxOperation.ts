import { Operation } from '@web3d/operator/Operation';
import { AnswerContent } from '@web3d/types';
import { ABox } from '../types';

export class ModifyBoxOperation implements Operation {
    newValue: ABox;

    constructor(newValue: ABox) {
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