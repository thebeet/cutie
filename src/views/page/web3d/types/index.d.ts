import {
    PageTemplate as BasePageTemplate
} from '@/types';
export * from '@/types';
export * from './camera';
export * from './shape';
export * from './mouse';

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

export interface AElement {
    readonly uuid: string
    readonly schema: string
    readonly type: string
    readonly frameIndex: number
    readonly label: string
    readonly description: string
};

export interface AnswerContent {
    readonly elements: readonly AElement[]
}

export interface Response {
    readonly id: number
    readonly expire: number
    readonly createdAt: Date
}