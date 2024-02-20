import { createEventHook } from '@vueuse/core';
import { ref } from 'vue';

type AdvanceMouseEvent = {
    type: string
    points: {
        x: number
        y: number
    }[]
}

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
    };
};