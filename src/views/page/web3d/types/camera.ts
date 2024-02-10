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