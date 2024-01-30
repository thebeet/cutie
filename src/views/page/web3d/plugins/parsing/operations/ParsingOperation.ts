import { TFrame } from '@web3d/three/TFrame';
import { AnswerContent } from '../types';

export class ParsingOperation {
    private frame: TFrame;
    private labelID: number;
    private points: number[];

    constructor(frame: TFrame, labelID: number, points: number[]) {
        this.frame = frame;
        this.labelID = labelID;
        this.points = points;
    }

    apply(answer: AnswerContent) {
        const label = answer.parsing.frames[this.frame.index].label;
        this.points.forEach((pid) => {
            label[pid] = this.labelID;
        });
        const labelAttr = this.frame.points?.geometry?.getAttribute('label');
        if (labelAttr) {
            labelAttr.needsUpdate = true;
        }
        this.frame.update();
    }
}