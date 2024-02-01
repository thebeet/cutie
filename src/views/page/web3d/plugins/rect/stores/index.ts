import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDrama } from '@web3d/hooks/drama';
import { Cube } from '../types';

export const useRectStore = defineStore('plugin::rect', () => {
    const { answer } = useDrama();

    const elements = computed(() => {
        return answer.value.elements.filter(e => e.schema === 'cube') as Cube[];
    });

    return {
        elements,
    };
});