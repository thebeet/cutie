import { useActiveElement, useMagicKeys, whenever } from '@vueuse/core';
import { logicAnd } from '@vueuse/math';
import { ref, watch } from 'vue';
import { useRemoveAction } from '../actions/remove';

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
    const { Backspace, Delete } = useMagicKeys();
    const { removeFocus } = useRemoveAction();

    whenever(logicAnd(Backspace, notUsingInput), removeFocus);
    whenever(logicAnd(Delete, notUsingInput), removeFocus);
};