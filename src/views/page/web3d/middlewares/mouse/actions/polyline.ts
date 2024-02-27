import { MaybeRefOrGetter, Ref, toValue } from 'vue';
import { usePos } from '../hooks/pos';
import { ESP } from '../constants';
import { EventHook, useEventListener } from '@vueuse/core';
import { AdvanceMouseEvent } from '../types';

export const drawPolyline = (
    dom: MaybeRefOrGetter<HTMLElement>,
    enabled: MaybeRefOrGetter<boolean>,
    mouseEvent: Ref<AdvanceMouseEvent>,
    eventHook: EventHook<AdvanceMouseEvent>) => {

    let polyline = false;

    const condition = (func: (event: MouseEvent) => void) => (event: MouseEvent) => {
        toValue(enabled) ? func(event) : null;
    };

    useEventListener(dom, 'mousemove', condition((event: MouseEvent) => {
        if (event.button === 0) {
            if (polyline && mouseEvent.value.points.length > 0) {
                const { x, y } = usePos(event, toValue(dom));
                const { x: prevX, y: prevY } = mouseEvent.value.points[mouseEvent.value.points.length - 1];
                if (((x - prevX) * (x - prevX) > ESP) || ((y - prevY) * (y - prevY) > ESP)) {
                    mouseEvent.value.points.push({ x, y });
                }
            }
        } else {
            polyline = false;
        }
    }));

    useEventListener(dom, 'mousedown', condition((event: MouseEvent) => {
        if (event.button === 0) {
            polyline = true;
            const { x, y } = usePos(event, toValue(dom));
            mouseEvent.value.type = 'polylining';
            mouseEvent.value.points = [
                { x, y }
            ];
        } else {
            polyline = false;
        }
    }));

    useEventListener(dom, 'mouseup', condition((event: MouseEvent) => {
        if (event.button === 0) {
            if (polyline) {
                polyline = false;
                if (mouseEvent.value.points.length >= 3) {
                    mouseEvent.value.type = 'polylined';
                    eventHook.trigger(mouseEvent.value);
                }
            }
        } else {
            polyline = false;
        }
    }));

    useEventListener(dom, 'mouseleave', condition(() => {
        polyline = false;
    }));
};