import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDrama } from '@web3d/hooks/drama';
import { Cube } from '../types';

export const useRectStore = defineStore('plugin::rect', () => {
    const { answer } = useDrama();

    //const selection
    const focusedUUID = ref<string>('');
    const focused = computed({
        get: () => {
            if (!focusedUUID.value) {
                return undefined;
            }
            for (const e of elements.value) {
                if (e.uuid === focusedUUID.value) {
                    return e;
                }
            }
            return undefined;
        },
        set: (v) => {
            if (v) {
                if (v.uuid) {
                    if (focusedUUID.value !== v.uuid) {
                        focusedUUID.value = v.uuid;
                    }
                }
            } else {
                focusedUUID.value = '';
            }
        }
    });

    const elements = computed(() => {
        return answer.value.elements.filter(e => e.schema === 'cube') as Cube[];
    });

    return {
        focused,
        elements,
    };
});