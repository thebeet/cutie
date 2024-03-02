import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDrama } from '@web3d/hooks/drama';
import { TBox } from '../three/TBox';
import { ABox } from '../types';
import { useSync } from '../hooks/sync';
import { useFocus } from '../hooks/focus';

export const useBoxStore = defineStore('plugin::box', () => {
    const { answer, frames } = useDrama();

    const elements = computed(() => answer.value.elements.filter(e => e.schema === 'box') as Readonly<ABox>[]);
    const boxes: Map<string, TBox> = new Map([]);

    useSync(frames, elements, boxes, el => new TBox(el));
    const { focused } = useFocus(elements, boxes);

    return {
        focused,
        elements, boxes
    };
});