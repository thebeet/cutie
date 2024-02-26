import { useActiveElement, useMagicKeys, whenever } from '@vueuse/core';
import { logicAnd } from '@vueuse/math';
import { watch, ref } from 'vue';
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
    const { Backspace } = useMagicKeys();
    const { removeFocus } = useRemoveAction();

    whenever(logicAnd(Backspace, notUsingInput), removeFocus);
};