import { AElement, RBox } from '@cutie/web3d';

export type ABox = AElement & {
    readonly traceId: string;
} & RBox;
