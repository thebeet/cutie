export interface AdvanceMouseEvent {
    type: string
    points: {
        x: number
        y: number
    }[]
}

export type MouseMode = 'free' | 'line' | 'rect' | 'polyline' | 'brush';