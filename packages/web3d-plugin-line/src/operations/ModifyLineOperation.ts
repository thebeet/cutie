import { AnswerContent, Operation } from '@cutie/web3d';
import { ALine } from '../types';

export class ModifyLineOperation implements Operation {
    readonly line: ALine;

    constructor(line: ALine) {
        this.line = line;
    }

    get description(): string {
        return '修改线';
    }

    apply(answer: AnswerContent): AnswerContent {
        const elements = answer.elements.map(item =>
            (item.uuid === this.line.uuid) ? { ...item, ...this.line } : item);
        return { ...answer, elements };
    }
}