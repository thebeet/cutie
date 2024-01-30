import { AnswerContent } from '../types';

export class ParsingInstanceModifyColorOperation {
    private readonly id: number;
    private readonly color: string;

    constructor(id: number, color: string) {
        this.id = id;
        this.color = color;
    }

    apply(answer: AnswerContent) {
        answer.parsing.instances[this.id].color = this.color;
    }
}