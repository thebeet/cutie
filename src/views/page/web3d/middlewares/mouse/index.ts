import { useDrama } from '@web3d/hooks/drama';
import { addNodeToContainer } from '@web3d/plugins';
import { ref, h, watch } from 'vue';
import MouseActionPreview from './components/MouseActionPreview.vue';
import { createEventHook } from '@vueuse/core';
import { drawRect } from './actions/rect';
import { AdvanceMouseEvent, MouseMode } from './types';

export const useMiddleware = () => {
    const { container } = useDrama();

    const eventHook = createEventHook<AdvanceMouseEvent>();
    const state = ref<MouseMode>('free');
    const mouseEvent = ref<AdvanceMouseEvent>({
        type: 'free',
        points: []
    });

    const actions: {
        [key in MouseMode]: (dom: HTMLElement, event: MouseEvent) => void;
    } = {
        'free': () => {
            mouseEvent.value.type = null;
            mouseEvent.value.points = [];
            eventHook.trigger(mouseEvent.value);
        },
        'rect': drawRect(mouseEvent, eventHook).startDraw,
    };

    let currentHandler = null;
    watch(state, (value, oldValue) => {
        const prev = ;
    }, { immediate: true });

    addNodeToContainer(h(MouseActionPreview), container);
};