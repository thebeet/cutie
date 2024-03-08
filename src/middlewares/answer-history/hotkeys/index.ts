import { useActiveElement, useMagicKeys, whenever } from '@vueuse/core';
import { logicAnd } from '@vueuse/math';
import { useAnswerHistoryStore } from '../stores/answer';
import { watch, ref } from 'vue';

export const useHotkeys = () => {
    const activeElement = useActiveElement();
    const notUsingInput = ref<boolean>(true);
    watch(activeElement, (value) => {
        if (value && (value.tagName === 'INPUT' || value.tagName === 'TEXTAREA')) {
            notUsingInput.value = false;
        } else {
            notUsingInput.value = true;
        }
    });
    const { Ctrl_Z, Ctrl_Y } = useMagicKeys();
    const { undo, redo } = useAnswerHistoryStore();

    whenever(logicAnd(Ctrl_Z, notUsingInput), undo);
    whenever(logicAnd(Ctrl_Y, notUsingInput), redo);
};