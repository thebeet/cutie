import {
    PageTemplate as BasePageTemplate
} from '@/types';
export * from '@/types';
export * from '@web3d/types/camera';
export * from '@web3d/types/shape';

export type PageTemplate = BasePageTemplate;

export type Frame = {
    index: number
    url: string
    pose: number[] & { length: 9 }
    points: number
    cameras: Camera2D[]
}

export type Data = {
    uuid: string
    frames: Frame[]
}

export interface Page {
    uuid: string
    data: Data
    template: PageTemplate
    response?: Response
    answers: Answer<any>[]
    annotations: Annotation<any>[]
}

export interface Element {
    uuid: string
    schema: string
    type: string
    frameIndex: number
    label: string
    description: string
};

export interface AnswerContent {
    elements: Element[]
}

export interface Response {
    id: number
    expire: number
    createdAt: Date
}