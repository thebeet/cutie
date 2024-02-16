import {
    PageTemplate as BasePageTemplate
} from '@/types';
export * from '@/types';
export * from '@web3d/types/camera';
export * from '@web3d/types/shape';

export type PageTemplate = BasePageTemplate;

export type Frame = {
    readonly index: number
    readonly url: string
    pose: number[] & { length: 9 }
    points: number
    cameras: Camera2D[]
}

export type Data = {
    uuid: string
    frames: Frame[]
}

export interface Page {
    readonly uuid: string
    readonly data: Data
    readonly template: PageTemplate
    readonly response?: Response
    answers: Answer<any>[]
    annotations: Annotation<any>[]
}

export interface Element {
    readonly uuid: string
    readonly schema: string
    readonly type: string
    readonly frameIndex: number
    label: string
    description: string
};

export interface AnswerContent {
    elements: Element[]
}

export interface Response {
    readonly id: number
    expire: number
    createdAt: Date
}