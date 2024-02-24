export * from '@web3d/types';
import { AnswerContent as BaseAnswerContent } from '@web3d/types';

export type ParsingInstance = ParsingAnswerInstance & {
    visible: boolean
    lock: boolean
    counts: number[]
};


export type ParsingAnswerInstance = {
    readonly id: number
    kind: string
    name: string
    description: string
    color: string
}

export type ParsingAnswerResult = {
    instances: ParsingAnswerInstance[]
    frames: {
        index: number
        label: Int32Array
    }[]
}

export interface AnswerContent extends BaseAnswerContent {
    parsing: ParsingAnswerResult
}
