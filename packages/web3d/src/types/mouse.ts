export type AdvanceMouseEvent = {
    readonly type: string
    readonly points: readonly {
        readonly x: number
        readonly y: number
    }[]
}