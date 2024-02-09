import { Element } from '@web3d/types';

export interface Cube extends Element {
    position: {
        x: number
        y: number
        z: number
    }
    rotation: {
        phi: number
        theta: number
        psi: number
    }
    size: {
        length: number
        width: number
        height: number
    }
}
