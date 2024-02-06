import { Operation } from '@web3d/operator/Operation';
import { AnswerContent } from '@web3d/types';
import { Rect } from '../types';

export class ModifyThreeViewRectOperation implements Operation {
    private view: string;
    private rect: Rect;

    constructor(view: string, rect: Rect) {
        this.view = view;
        this.rect = rect;
    }

    apply(answer: AnswerContent): void {
    }
}