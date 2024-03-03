import * as BaseType from '@web3d/types';
export * from '@web3d/types';

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

export interface AnswerContent extends BaseType.AnswerContent {
    parsing: ParsingAnswerResult
}

export type ParsingBox = BaseType.AElement & BaseType.RBox;
