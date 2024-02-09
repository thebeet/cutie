import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDrama } from '@web3d/hooks/drama';
import { Cube } from '../types';

export const useRectStore = defineStore('plugin::rect', () => {
    const { answer } = useDrama();

    //const selection
    const focused = ref<Cube>();

    const elements = computed(() => {
        return answer.value.elements.filter(e => e.schema === 'cube') as Cube[];
    });

    return {
        focused,
        elements,
    };
});