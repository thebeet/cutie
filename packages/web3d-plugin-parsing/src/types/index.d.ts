import * as BaseType from '@cutie/web3d';
export type * from '@cutie/web3d';

export type ParsingInstance = ParsingAnswerInstance & {
    visible: boolean
    lock: boolean
    readonly counts: number[]
};

export type ParsingAnswerInstance = {
    readonly id: number
    readonly kind: string
    readonly name: string
    readonly description: string
    readonly color: string
}

export type ParsingAnswerResult = {
    readonly instances: readonly ParsingAnswerInstance[]
    readonly frames: {
        readonly index: number
        readonly label: Int32Array
    }[]
}

export interface AnswerContent extends BaseType.AnswerContent {
    readonly parsing: ParsingAnswerResult
}

export type ParsingBox = BaseType.AElement & BaseType.RBox;
