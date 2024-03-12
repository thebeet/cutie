import { AnswerContent, Operation } from '@cutie/web3d';
import { ALine } from '../types';

export class RemoveLineOperation implements Operation {
    readonly line: ALine;

    constructor(line: ALine) {
        this.line = line;
    }

    get description(): string {
        return '删除线';
    }

    apply(answer: AnswerContent): AnswerContent {
        return {
            ...answer,
            elements: answer.elements.filter(element => element.uuid !== this.line.uuid)
        };
    }
}