import { defineStore } from 'pinia';
import { RBox } from '@web3d/types';
import { ref, shallowRef, watch } from 'vue';
import { useAdvanceDrama } from '@web3d/hooks/drama';

type RBoxWithUUID = RBox & { uuid: string };

export const useThreeViewStore = defineStore('plugin::three-view', () => {
    const inner = shallowRef<RBoxWithUUID>();
    const outer = shallowRef<RBox>();

    const isChanging = ref({
        front: false,
        side: false,
        top: false,
    });

    const padding = 0.2;
    const scale = 1 + padding * 2;

    const { onThreeViewSetup, threeViewConfirmEventHook: confirmEventHook, threeViewChangeEventHook: changeEventHook } = useAdvanceDrama();

    watch(inner, (newValue) => {
        if (newValue) {
            changeEventHook.trigger(newValue);
        }
    });

    const calcOuter = (innerBox: RBox): RBox => {
        return {
            ...innerBox,
            size: {
                x: innerBox.size.x * scale,
                y: innerBox.size.y * scale,
                z: innerBox.size.z * scale,
            }
        };
    };

    onThreeViewSetup((value) => {
        inner.value = value;
        isChanging.value = {
            front: false,
            side: false,
            top: false,
        };
        if (inner.value) {
            outer.value = calcOuter(inner.value);
        }
    });

    const confirm = () => {
        if (inner.value) {
            outer.value = calcOuter(inner.value);
            confirmEventHook.trigger(inner.value);
        }
    };

    return {
        inner, outer, isChanging,
        confirm
    } as const;
});