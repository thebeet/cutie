import { AnswerContent, Operation, TFrame } from '@cutie/web3d';
import { ALine } from '../types';

export class AddLineOperation implements Operation {
    readonly line: ALine;
    readonly frame: TFrame;

    constructor(frame: TFrame, line: ALine) {
        this.frame = frame;
        this.line = line;
    }

    get description(): string {
        return '添加线';
    }

    apply(answer: AnswerContent): AnswerContent {
        return {
            ...answer,
            elements: [...answer.elements, this.line]
        };
    }
}