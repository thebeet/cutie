import { Element } from '@web3d/types';

export interface Cube extends Element {
    position: Point3
    rotation: {
        phi: number
        psi: number
        theta: number
    }
    size: {
        length: number
        width: number
        height: number
    }
}
