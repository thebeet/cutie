import { TFrame } from '@cutie/web3d';
import { AnswerContent, ParsingInstance } from '../types';

export class ParsingOperation {
    private readonly labelID: number;
    private readonly points: [TFrame, number[]][];
    private readonly instances: readonly ParsingInstance[]; // snapshot
    private change: number[][][] = [];

    constructor(labelID: number, points: [TFrame, number[]][], instances: ParsingInstance[]) {
        this.labelID = labelID;
        this.points = points;
        this.instances = instances;
        this.change = points.map(() => this.instances.map(() => [] as number[]));
    }

    get description() {
        return `ParsingOperation: ${this.points.length} points to label ${this.labelID}`;
    }

    apply(answer: AnswerContent): AnswerContent {
        const frameMap = new Map(this.points.map(([frame, points], oid) => [frame.index, [frame, oid, points] as const]));
        return { ...answer,
            parsing: {
                ...answer.parsing,
                frames: answer.parsing.frames.map(({ index, label }) => {
                    const [frame, oid, points] = frameMap.get(index) ?? [undefined, 0, [] as number[]];
                    if (frame) {
                        const newLabel = new Int32Array(label);
                        points.forEach(pid => {
                            const c = newLabel[pid];
                            if (!this.instances[c].lock && (c !== this.labelID)) {
                                this.change[oid][c].push(pid);
                                newLabel[pid] = this.labelID;
                            }
                        });
                        frame.update();
                        return { index, label: newLabel };
                    } else {
                        return { index, label };
                    }
                }),
            }
        };
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