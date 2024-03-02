import { AnswerContent } from '../types';

export class ParsingNewInstanceOperation {
    private readonly name: string;
    private readonly kind: string;
    private readonly description: string;
    private readonly color: string;

    constructor(name: string, kind: string, description: string, color: string) {
        this.name = name;
        this.kind = kind;
        this.description = description;
        this.color = color;
    }

    apply(answer: AnswerContent): AnswerContent {
        const id = answer.parsing.instances.length;
        answer.parsing!.instances.push({
            id,
            kind: this.kind,
            name: this.name,
            description: this.description,
            color: this.color,
        });
        return answer;
    }
}