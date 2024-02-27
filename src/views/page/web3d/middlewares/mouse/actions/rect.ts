import { MaybeRefOrGetter, Ref, toValue } from 'vue';
import { usePos } from '../hooks/pos';
import { ESP } from '../constants';
import { EventHook, useEventListener } from '@vueuse/core';
import { AdvanceMouseEvent } from '../types';

export const drawRect = (
    dom: MaybeRefOrGetter<HTMLElement>,
    enabled: MaybeRefOrGetter<boolean>,
    mouseEvent: Ref<AdvanceMouseEvent>,
    eventHook: EventHook<AdvanceMouseEvent>) => {

    let recting = false;

    const condition = (func: (event: MouseEvent) => void) => (event: MouseEvent) => {
        toValue(enabled) ? func(event) : null;
    };

    useEventListener(dom, 'mousemove', condition((event: MouseEvent) => {
        if (event.button === 0) {
            if (recting) {
                const { x, y } = usePos(event, toValue(dom));
                mouseEvent.value.points[1] = { x, y };
            }
        } else {
            recting = false;
        }
    }));

    useEventListener(dom, 'mousedown', condition((event: MouseEvent) => {
        if (event.button === 0) {
            recting = true;
            const { x, y } = usePos(event, toValue(dom));
            mouseEvent.value.type = 'recting';
            mouseEvent.value.points = [
                { x, y },
                { x, y }
            ];
        }
    }));

    useEventListener(dom, 'mouseup', condition((event: MouseEvent) => {
        if (recting) {
            recting = false;
            const { x, y } = usePos(event, toValue(dom));
            const { x: prevX, y: prevY } = mouseEvent.value.points[0];
            if (((x - prevX) * (x - prevX) > ESP) && ((y - prevY) * (y - prevY) > ESP)) {
                mouseEvent.value.type = 'rected';
                mouseEvent.value.points[1] = { x, y };
                eventHook.trigger(mouseEvent.value);
            } else {
                recting = false;
            }
        }
    }));

    useEventListener(dom, 'mouseleave', condition(() => {
        recting = false;
    }));
};