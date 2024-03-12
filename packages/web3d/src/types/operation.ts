import { AnswerContent } from './page';

export interface Operation {
    description: string;
    save?: boolean;
    apply(answer: AnswerContent): AnswerContent;
}
