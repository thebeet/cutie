import { useDrama } from '@cutie/web3d';
import { storeToRefs } from 'pinia';
import { useBoxStore } from '../stores';
import { ABox } from '../types';
import { CopyToNextFrameOperation } from '../operations/CopyToNextFrameOperation';

export const useCopyNextAction = () => {
    const { applyOperation } = useDrama();
    const { focused } = storeToRefs(useBoxStore());

    const copyNext = (boxes: ABox[]) => {
        const op = new CopyToNextFrameOperation(boxes);
        applyOperation(op);
    };

    const copyNextFocus = () => {
        if (focused.value) {
            copyNext([focused.value]);
        }
    };

    return {
        copyNext, copyNextFocus
    };
};