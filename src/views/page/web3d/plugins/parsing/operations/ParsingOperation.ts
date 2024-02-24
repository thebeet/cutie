import { TFrame } from '@web3d/three/TFrame';
import { AnswerContent, ParsingInstance } from '../types';
import { klona } from 'klona';

export class ParsingOperation {
    private readonly frame: TFrame;
    private readonly labelID: number;
    private readonly points: number[];
    private readonly instances: ParsingInstance[]; // snapshot
    private change: number[][] = [];

    constructor(frame: TFrame, labelID: number, points: number[], instances: ParsingInstance[]) {
        this.frame = frame;
        this.labelID = labelID;
        this.points = points;
        this.instances = klona(instances);
        this.change = this.instances.map(() => [] as number[]);
    }

    apply(answer: AnswerContent) {
        const label = answer.parsing.frames[this.frame.index].label;
        this.points.forEach((pid) => {
            const c = label[pid];
            if (!this.instances[c].lock && (c !== this.labelID)) {
                this.change[c].push(pid);
                label[pid] = this.labelID;
            }
        });
        const labelAttr = this.frame.points?.geometry?.getAttribute('label');
        if (labelAttr) {
            labelAttr.needsUpdate = true;
        }
        this.frame.update();
    }

    effect(instances: ParsingInstance[]) {
        let sum = 0;
        this.change.forEach((value, index) => {
            sum += value.length;
            instances[index].counts[this.frame.index] -= value.length;
        });
        instances[this.labelID].counts[this.frame.index] += sum;
    }

    undo(answer: AnswerContent) {
        const label = answer.parsing.frames[this.frame.index].label;
        this.change.forEach((value, index) => value.forEach(pid => label[pid] = index));
    }
}