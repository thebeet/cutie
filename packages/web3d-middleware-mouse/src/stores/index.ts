import { defineStore } from 'pinia';
import { AdvanceMouseEvent } from '@cutie/web3d';
import { ref } from 'vue';

export const useMouseStore = defineStore('plugin::mouse', () => {
    const mouseEvent = ref<AdvanceMouseEvent>({
        type: 'none', points: []
    });

    return {
        mouseEvent
    } as const;
});