import { Operation } from '@web3d/operator/Operation';
import { AnswerContent, RBox } from '@web3d/types';

export class ModifyBoxOperation implements Operation {
    readonly uuid: string;
    readonly newValue: RBox;

    constructor(uuid: string, newValue: RBox) {
        this.uuid = uuid;
        this.newValue = newValue;
    }

    get description(): string {
        return 'ModifyCube';
    }

    apply(answer: AnswerContent): AnswerContent {
        for (let i = 0; i < answer.elements.length; i++) {
            if (answer.elements[i].uuid === this.uuid) {
                answer.elements[i] = {
                    ...answer.elements[i],
                    ...this.newValue
                };
                break;
            }
        }
        return answer;
    }
}