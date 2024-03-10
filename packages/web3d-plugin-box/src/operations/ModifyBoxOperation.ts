import { Operation } from '@cutie/web3d';
import { AnswerContent, RBox } from '@cutie/web3d';

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
        const elements = answer.elements.map(item =>
            (item.uuid === this.uuid) ? { ...item, ...this.newValue } : item);
        return { ...answer, elements };
    }
}