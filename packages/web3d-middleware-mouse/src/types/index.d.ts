export interface AdvanceMouseEvent {
    readonly type: string
    readonly points: readonly {
        readonly x: number
        readonly y: number
    }[]
}

export type MouseMode = 'free' | 'line' | 'rect' | 'polyline' | 'brush';