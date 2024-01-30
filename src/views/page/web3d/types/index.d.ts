export * from '@/types';
import {
    PageTemplate as BasePageTemplate
} from '@/types';

export type PageTemplate = BasePageTemplate;

export type CameraParams = {
    K: number[] & { length: 9}
    M: number[] & { length: 16 }
    distortionType: string
    distortionCoefficients: {
        k1: number
        k2: number
        k3: number
        p1?: number
        p2?: number
        k4?: number
        k5?: number
        k6?: number
    }
    width: number
    height: number
    scale?: number
}

export type Camera2D = {
    name: string
    url: string
    params: CameraParams
}

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