import { watch, Ref, ref, computed } from 'vue';
import { AElement } from '@web3d/types';
import * as THREE from 'three';

export interface TFocusableEventMap extends THREE.Object3DEventMap {
    focus: {}
    blur: {}
}

export const useFocus = <A extends AElement, T extends THREE.Object3D<TFocusableEventMap> & { apply: (t: A) => void, dispose: () => void }>(
    elements: Ref<A[]>, objs: Map<string, T>) => {

    const focusedUUID = ref<string>();
    const focused = computed({
        get: () => elements.value.find(item => item.uuid === focusedUUID.value),
        set: (v) => focusedUUID.value = v?.uuid
    });

    const stop = watch(focused, (value, oldValue) => {
        if (value && oldValue && value.uuid === oldValue.uuid) {
            return;
        }
        if (oldValue) {
            const cube = objs.get(oldValue.uuid);
            cube?.dispatchEvent({ type: 'blur' });
        }
        if (value) {
            const cube = objs.get(value.uuid);
            cube?.dispatchEvent({ type: 'focus' });
        }
    });

    return {
        focused,
        stop
    };
};