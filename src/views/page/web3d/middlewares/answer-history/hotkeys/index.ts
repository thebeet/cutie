import { useMagicKeys, whenever } from '@vueuse/core';
import { useAnswerHistoryStore } from '../stores/answer';

export const useHotkeys = () => {
    const { Ctrl_Z, Ctrl_Y } = useMagicKeys();
    const { undo, redo } = useAnswerHistoryStore();

    whenever(Ctrl_Z, undo);
    whenever(Ctrl_Y, redo);
};