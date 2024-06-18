export interface Page {
    readonly uuid: string
    readonly data: Data
    readonly template: PageTemplate
    readonly response?: Response
    readonly answers: readonly Answer<any>[]
    readonly annotations: readonly Annotation<any>[]
}

export interface Data {
    readonly uuid: string
}

export interface PageTemplate {
    readonly name: string
    readonly version: number
    readonly plugins: readonly {
        readonly name: string
        readonly params: any
    }[]
}

export interface Answer<T> {
    readonly uuid: string
    readonly user?: User
    readonly judgement?: Judgement
    readonly content: T
}

type Judgement = 'accepted' | 'rejected'

export interface Annotation<T> {
    readonly uuid: string
    readonly user?: User
    readonly content: T
}

export interface User {
    readonly id: number
    readonly name: string
    readonly role: string
}

export interface Response {
    readonly id: number
    readonly expire: number
    readonly createdAt: Date
}

/* web3d */

export interface Data {
    readonly uuid: string
    readonly frames: readonly Frame[]
}

export type Frame = {
    readonly index: number
    readonly timestamp: number
    readonly url: string
    readonly format: string | undefined
    readonly pose: readonly number[] & { readonly length: 9 }
    readonly points: number
    readonly cameras: readonly Camera2D[]
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

export type CameraParams = {
    readonly K: readonly number[] & { readonly length: 9}
    readonly M: readonly number[] & { readonly length: 16 }
    readonly distortionType: string
    readonly distortionCoefficients: {
        readonly k1: number
        readonly k2: number
        readonly k3: number
        readonly p1?: number
        readonly p2?: number
        readonly k4?: number
        readonly k5?: number
        readonly k6?: number
    }
    readonly width: number
    readonly height: number
    readonly scale?: number
}

export type Camera2D = {
    readonly name: string
    readonly url: string
    readonly params: CameraParams
}