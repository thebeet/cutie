import { AnswerContent } from '../types';

export class ParsingInstanceModifyColorOperation {
    private readonly id: number;
    private readonly color: string;

    constructor(id: number, color: string) {
        this.id = id;
        this.color = color;
    }

    get description() {
        return `Modify color of instance[${this.id}] to ${this.color}`;
    }

    apply(answer: AnswerContent): AnswerContent {
        answer.parsing.instances[this.id].color = this.color;
        return answer;
    }
}