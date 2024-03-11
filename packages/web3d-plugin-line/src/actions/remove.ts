import { useDrama } from '@cutie/web3d';
import { storeToRefs } from 'pinia';
import { useLineStore } from '../stores';
import { ALine } from '../types';
import { RemoveLineOperation } from '../operations/RemoveLineOperation';

export const useRemoveAction = () => {
    const { applyOperation } = useDrama();
    const { focused } = storeToRefs(useLineStore());

    const remove = (cube: ALine) => {
        const op = new RemoveLineOperation(cube);
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