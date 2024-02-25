import { ref, watch } from 'vue';
import { RBox } from '../types';
import { klona } from 'klona';
import { createEventHook } from '@vueuse/core';

export const useThreeView = () => {
    const inner = ref<RBox>();
    const outer = ref<RBox>();

    const confirmEvent = createEventHook<RBox>();

    const padding = ref(0.2);

    const confirm = () => {
        if (inner.value) {
            outer.value = klona(inner.value);
            const scale = 1 + padding.value * 2;
            outer.value.size = {
                x: inner.value.size.x * scale,
                y: inner.value.size.y * scale,
                z: inner.value.size.z * scale,
            };
        }
    };

    watch(inner, confirm);

    return {
        inner,
        outer,
        confirm: confirm,
        onConfirm: confirmEvent.on
    } as const;
};
