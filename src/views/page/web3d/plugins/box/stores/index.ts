import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDrama } from '@web3d/hooks/drama';
import { TBox } from '../three/TBox';
import { ABox } from '../types';
import { useFocus } from '@web3d/utils/focus';

export const useBoxStore = defineStore('plugin::box', () => {
    const { answer } = useDrama();

    const elements = computed(() => answer.value.elements.filter(e => e.schema === 'box') as Readonly<ABox>[]);
    const boxes: Map<string, TBox> = new Map([]);
    const { focused } = useFocus(elements, boxes);

    return {
        focused,
        elements, boxes
    } as const;
});