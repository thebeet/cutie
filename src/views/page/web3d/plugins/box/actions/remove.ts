import { useDrama } from '@web3d/hooks/drama';
import { storeToRefs } from 'pinia';
import { useBoxStore } from '../stores';
import { ABox } from '../types';
import { RemoveBoxOperation } from '../operations/RemoveBoxOperation';

export const useRemoveAction = () => {
    const { applyOperation } = useDrama();
    const { focused } = storeToRefs(useBoxStore());

    const remove = (cube: ABox) => {
        const op = new RemoveBoxOperation(cube);
        applyOperation(op);
    };

    const removeFocus = () => {
        if (focused.value) {
            remove(focused.value);
        }
    };

    return {
        remove, removeFocus
    };
};