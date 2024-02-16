export interface AdvanceMouseEvent {
    type: string | null
    points: {
        x: number
        y: number
    }[]
}

export type MouseMode = 'free' | 'line' | 'rect' | 'polyline' | 'brush';