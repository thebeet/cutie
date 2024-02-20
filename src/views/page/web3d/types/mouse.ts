export type AdvanceMouseEvent = {
    type: string
    cursor?: {
        x: number
        y: number
    }
    points: {
        x: number
        y: number
    }[]
}