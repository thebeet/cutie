import { ref, watch } from 'vue';
import { RBox } from '../types';
import { klona } from 'klona';

export const useThreeView = () => {
    const inner = ref<RBox>();
    const outer = ref<RBox>();

    const padding = ref(0.2);

    const rejust = () => {
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

    watch(inner, rejust);

    return {
        inner,
        outer,
        rejust
    } as const;
};
