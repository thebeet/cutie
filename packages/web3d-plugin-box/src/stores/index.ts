import { defineStore } from 'pinia';
import { computed, watch } from 'vue';
import { useDrama } from '@cutie/web3d';
import { TBox } from '../three/TBox';
import { ABox } from '../types';
import { useFocus } from '@cutie/web3d';
import { useSync } from '@cutie/web3d';

export const useBoxStore = defineStore('plugin::box', () => {
    const { frames, answer } = useDrama();

    const elements = computed(() => answer.value.elements.filter(e => e.schema === 'box') as Readonly<ABox>[]);
    const boxes: Map<string, TBox> = new Map([]);
    const { draft } = useSync(frames, elements, boxes, el => new TBox(el), (obj, el) => obj.apply(el), obj => obj.dispose());
    const { focused } = useFocus(elements, boxes);
    watch(focused, value => {
        if (value === undefined) {
            draft.value = undefined;
        }
    });

    return {
        focused, draft,
        elements, boxes
    } as const;
});