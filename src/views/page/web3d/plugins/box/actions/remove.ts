import { useDrama } from '@web3d/hooks/drama';
import { storeToRefs } from 'pinia';
import { useRectStore } from '../stores';
import { Cube } from '../types';
import { RemoveBoxOperation } from '../operations/RemoveBoxOperation';

export const useRemoveAction = () => {
    const { applyOperation } = useDrama();
    const { focused } = storeToRefs(useRectStore());

    const remove = (cube: Cube) => {
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