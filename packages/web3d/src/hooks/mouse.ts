import { createEventHook } from '@vueuse/core';
import { ref } from 'vue';
import { AdvanceMouseEvent } from '../types';

export const useMouse = () => {
    const eventHook = createEventHook<AdvanceMouseEvent>();
    const state = ref('free');
    return {
        state,
        eventHook,
    } as const;
};