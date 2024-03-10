import { createEventHook } from '@vueuse/core';
import { ref } from 'vue';
import { AdvanceMouseEvent } from '../types';

export const useMouse = () => {
    const eventHook = createEventHook<AdvanceMouseEvent>();
    const mouseEvent = ref<AdvanceMouseEvent>({
        type: 'none',
        points: [],
    });
    const state = ref('free');
    return {
        state,
        mouseEvent,
        eventHook,
    } as const;
};