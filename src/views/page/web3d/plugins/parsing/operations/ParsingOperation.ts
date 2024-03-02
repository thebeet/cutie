import { TFrame } from '@web3d/three/TFrame';
import { AnswerContent, ParsingInstance } from '../types';
import { klona } from 'klona';

export class ParsingOperation {
    private readonly labelID: number;
    private readonly points: [TFrame, number[]][];
    private readonly instances: ParsingInstance[]; // snapshot
    private change: number[][][] = [];

    constructor(labelID: number, points: [TFrame, number[]][], instances: ParsingInstance[]) {
        this.labelID = labelID;
        this.points = points;
        this.instances = klona(instances);
        this.change = points.map(() => this.instances.map(() => [] as number[]));
    }

    get description() {
        return `ParsingOperation: ${this.points.length} points to label ${this.labelID}`;
    }

    apply(answer: AnswerContent): AnswerContent {
        this.points.forEach(([frame, points], index) => {
            const label = answer.parsing.frames[frame.index].label;
            points.forEach((pid) => {
                const c = label[pid];
                if (!this.instances[c].lock && (c !== this.labelID)) {
                    this.change[index][c].push(pid);
                    label[pid] = this.labelID;
                }
            });
            const labelAttr = frame.points?.geometry?.getAttribute('label');
            if (labelAttr) {
                labelAttr.needsUpdate = true;
            }
            frame.update();
        });
        return answer;
    }

    effect(instances: ParsingInstance[]) {
        this.points.forEach(([frame], index) => {
            let sum = 0;
            this.change[index].forEach((value, i) => {
                sum += value.length;
                instances[i].counts[frame.index] -= value.length;
            });
            instances[this.labelID].counts[frame.index] += sum;
        });
    }

    undo(answer: AnswerContent) {
        this.points.forEach(([frame], index) => {
            const label = answer.parsing.frames[frame.index].label;
            this.change[index].forEach((value, i) => value.forEach(pid => label[pid] = i));
        });
    }
}