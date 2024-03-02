import { useActiveElement, whenever } from '@vueuse/core';
import { logicAnd } from '@vueuse/math';
import { ComputedRef, WatchCallback, ref, watch } from 'vue';

export const useHotKeys = () => {
    const activeElement = useActiveElement();
    const notUsingInput = ref<boolean>(true);
    watch(activeElement, (value) => {
        if (value && (value.tagName === 'INPUT' || value.tagName === 'TEXTAREA')) {
            notUsingInput.value = false;
        } else {
            notUsingInput.value = true;
        }
    });

    const wheneverKeynotUsingInput = (key: ComputedRef<boolean>, cb: WatchCallback<true>) => {
        return whenever(logicAnd(key, notUsingInput), cb);
    };

    return {
        wheneverKey: wheneverKeynotUsingInput
    };
};