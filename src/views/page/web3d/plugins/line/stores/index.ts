import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDrama } from '@web3d/hooks/drama';
import { ALine } from '../types';
import { TLine } from '../three/TLine';

export const useLineStore = defineStore('plugin::line', () => {
    const { answer } = useDrama();

    const elements = computed(() => {
        return answer.value.elements.filter(e => e.schema === 'line') as ALine[];
    });

    const lines: Map<string, TLine> = new Map([]);

    const focusedUUID = ref<string>('');
    const focused = computed({
        get: () => elements.value.find(item => item.uuid === focusedUUID.value),
        set: (v) => focusedUUID.value = v?.uuid ?? ''
    });

    return {
        focused,
        elements, lines
    };
});