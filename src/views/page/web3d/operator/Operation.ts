import { AnswerContent } from '../types';

export interface Operation {
    save?: boolean;
    apply(answer: AnswerContent): void;
}

export class GroupOperation implements Operation {
    save?: boolean;
    private group: Operation[];

    constructor(group: Operation[]) {
        this.group = group;
    }

    apply(answer: AnswerContent): void {
        this.group.forEach(op => op.apply(answer));
    }
}

export interface UndoAbleOperation extends Operation {
    undo(answer: AnswerContent): void;
}
