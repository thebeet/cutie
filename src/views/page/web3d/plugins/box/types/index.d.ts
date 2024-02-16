import { Element, RBox } from '@web3d/types';

export interface BoxAnswer {
    frames: {
        [key: string]: Cube
    }[]
}

export interface Cube extends Element, RBox {
}
