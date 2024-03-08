export interface User {
    readonly id: number
    readonly name: string
    readonly role: string
}

export type PageTemplate = {
    readonly name: string
    readonly version: number
    readonly plugins: readonly {
        readonly name: string
        readonly params: any
    }[]
}

type Judgement = 'accepted' | 'rejected'

export interface Answer<T> {
    readonly uuid: string
    readonly user?: User
    readonly judgement?: Judgement
    readonly content: T
}

export interface Annotation<T> {
    readonly uuid: string
    readonly user?: User
    readonly content: T
}

export interface Page {
    readonly data: Data
    readonly template: PageTemplate
    readonly response?: Response
    readonly answers: readonly Answer<any>[]
    readonly annotations: readonly Annotation<any>[]
}

export interface Response {
    readonly id: number
    readonly expire: number
    readonly createdAt: Date
}

export type Frame = {
    readonly index: number
    readonly url: string
    readonly pose: readonly number[] & { readonly length: 9 }
    readonly points: number
    readonly cameras: readonly Camera2D[]
}

export type Data = {
    readonly uuid: string
    readonly frames: readonly Frame[]
}

export interface Page {
    readonly uuid: string
    readonly data: Data
    readonly template: PageTemplate
    readonly response?: Response
    readonly answers: readonly Answer<any>[]
    readonly annotations: readonly Annotation<any>[]
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