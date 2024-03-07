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
        return {
            ...answer,
            parsing: {
                ...answer.parsing,
                instances: answer.parsing.instances.map(instance => instance.id === this.id ?
                    { ...instance, color: this.color } : instance),
            }
        };
    }
}