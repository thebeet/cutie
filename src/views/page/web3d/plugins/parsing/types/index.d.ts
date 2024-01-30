export * from '@web3d/types';
import { AnswerContent as BaseAnswerContent } from '@web3d/types';

export type ParsingInstanceType = {
    id: number
    kind: string
    name: string
    description: string
    color: string
    visible: boolean
    lock: boolean
    count: number
};


export type ParsingInstance = {
    id: number
    kind: string
    name: string
    description: numbert
    color: string
    count: number
}

export type ParsingResult = {
    instances: ParsingInstance[]
    frames: {
        index: number
        label: Int32Array
    }[]
}

export interface AnswerContent extends BaseAnswerContent {
    parsing: ParsingResult
}
