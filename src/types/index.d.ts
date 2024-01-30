export interface User {
    id: number
    name: string
    role: string
}

export type Data = any

export type PageTemplate = {
    name: string
    version: number
    plugins: {
        name: string
        params: any
    }[]
}

type Judgement = 'accepted' | 'rejected'

export interface Answer<T> {
    uuid: string
    user?: User
    judgement?: Judgement
    content: T
}

export interface Annotation<T> {
    uuid: string
    user?: User
    content: T
}

export interface Page {
    data: Data
    template: PageTemplate
    response?: Response
    answers: Answer<any>[]
    annotations: Annotation<any>[]
}

export interface Operation<T> {
    uuid: string
    type: string
    content: T
    createdAt: Date
}

export interface Response {
    id: number
    expire: number
    createdAt: Date
}