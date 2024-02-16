import { Ref } from 'vue';
import { usePos } from '../hooks/pos';
import { ESP } from '../constants';
import { EventHook } from '@vueuse/core';
import { AdvanceMouseEvent } from '../types';

export const drawRect = (mouseEvent: Ref<AdvanceMouseEvent>,
    eventHook: EventHook<AdvanceMouseEvent>) => {
    const startDraw = (dom: HTMLElement, event: MouseEvent) => {
        const { x, y } = usePos(event, dom);
        mouseEvent.value.type = 'recting';
        mouseEvent.value.points = [{ x, y }, { x, y }];
        const onMove = (event: MouseEvent) => {
            mouseEvent.value.points[1] = usePos(event, dom);
        };

        const onMouseUp = (event: MouseEvent) => {
            mouseEvent.value.points[1] = usePos(event, dom);

            const { x: prevX, y: prevY } = mouseEvent.value.points[0];
            const { x, y } = mouseEvent.value.points[1];
            if (((x - prevX) * (x - prevX) > ESP) && ((y - prevY) * (y - prevY) > ESP)) {
                mouseEvent.value.type = 'rected';
                eventHook.trigger(mouseEvent.value);
                cancel(false);
            } else {
                cancel();
            }
        };

        const onLeave = () => {
            cancel();
        };

        const cancel = (clear: boolean = true) => {
            dom.removeEventListener('mouseup', onMouseUp);
            dom.removeEventListener('mousemove', onMove);
            dom.removeEventListener('mouseleave', onLeave);
            if (clear) {
                mouseEvent.value.type = null;
                mouseEvent.value.points = [];
            }
        };

        dom.addEventListener('mouseup', onMouseUp);
        dom.addEventListener('mousemove', onMove);
        dom.addEventListener('mouseleave', onLeave);
    };

    return { startDraw };
};