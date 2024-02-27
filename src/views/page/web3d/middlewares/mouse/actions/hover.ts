import { MaybeRefOrGetter, Ref, toValue } from 'vue';
import { usePos } from '../hooks/pos';
import { EventHook, useEventListener } from '@vueuse/core';
import { AdvanceMouseEvent } from '../types';

export const hover = (
    dom: MaybeRefOrGetter<HTMLElement>,
    enabled: MaybeRefOrGetter<boolean>,
    _: Ref<AdvanceMouseEvent>,
    eventHook: EventHook<AdvanceMouseEvent>) => {

    const condition = (func: (event: MouseEvent) => void) => (event: MouseEvent) => {
        toValue(enabled) ? func(event) : null;
    };

    useEventListener(dom, 'mousemove', condition((event: MouseEvent) => {
        if (event.buttons === 0) {
            const { x, y } = usePos(event, toValue(dom));
            eventHook.trigger({
                type: 'hover',
                points: [{ x, y }]
            });
        }
    }));
};