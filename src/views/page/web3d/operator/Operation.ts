import { AnswerContent } from '../types';

export interface Operation {
    description: string;
    save?: boolean;
    apply(answer: AnswerContent): void;
}

export class GroupOperation implements Operation {
    save?: boolean;
    private group: Operation[];

    constructor(group: Operation[]) {
        this.group = group;
    }

    get description(): string {
        return 'xxxx';
    }

    apply(answer: AnswerContent): void {
        this.group.forEach(op => op.apply(answer));
    }

    forEach(callback: (operation: Operation) => void) {
        this.group.forEach(op => {
            if (op instanceof GroupOperation) {
                (op as GroupOperation).forEach(callback);
            } else {
                callback(op);
            }
        });
    }
}

export interface UndoAbleOperation extends Operation {
    undo(answer: AnswerContent): void;
}
