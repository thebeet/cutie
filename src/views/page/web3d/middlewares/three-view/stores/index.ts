import { defineStore } from 'pinia';
import { RBox } from '@web3d/types';
import { ref, watch } from 'vue';
import { useAdvanceDrama } from '@web3d/hooks/drama';

export const useThreeViewStore = defineStore('plugin::three-view', () => {
    const inner = ref<RBox>();
    const outer = ref<RBox>();

    const padding = 0.2;

    const { threeViewConfirmEventHook: confirmEventHook, threeViewChangeEventHook: changeEventHook } = useAdvanceDrama();

    watch(inner, (newValue) => {
        changeEventHook.trigger(newValue);
    });

    confirmEventHook.on((value) => {
        inner.value = value;
        if (inner.value) {
            const scale = 1 + padding * 2;
            outer.value = {
                ...inner.value,
                size: {
                    x: inner.value.size.x * scale,
                    y: inner.value.size.y * scale,
                    z: inner.value.size.z * scale,
                }
            };
        }
    });

    const confirm = () => {
        confirmEventHook.trigger(inner.value);
    };

    return {
        inner, outer,
        confirm
    } as const;
});