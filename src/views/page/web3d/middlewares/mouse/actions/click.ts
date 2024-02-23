import { MaybeRefOrGetter, Ref, toValue } from 'vue';
import { usePos } from '../hooks/pos';
import { ESP } from '../constants';
import { EventHook, useEventListener } from '@vueuse/core';
import { AdvanceMouseEvent } from '../types';

export const click = (
    dom: MaybeRefOrGetter<HTMLElement>,
    enabled: MaybeRefOrGetter<boolean>,
    mouseEvent: Ref<AdvanceMouseEvent>,
    eventHook: EventHook<AdvanceMouseEvent>) => {

    const clickInfo = {
        expire: 0,
        x: 0,
        y: 0
    };

    const condition = (func: (event: MouseEvent) => void) => (event: MouseEvent) => {
        toValue(enabled) ? func(event) : null;
    };

    useEventListener(dom, 'mousedown', condition((event: MouseEvent) => {
        clickInfo.expire = Date.now() + 500;
        const { x, y } = usePos(event, toValue(dom));
        clickInfo.x = x;
        clickInfo.y = y;
    }));

    useEventListener(dom, 'mouseup', condition((event: MouseEvent) => {
        if (clickInfo.expire > Date.now()) {
            clickInfo.expire = 0;
            const { x, y } = usePos(event, toValue(dom));
            if (((x - clickInfo.x ) * (x - clickInfo.x) < ESP) && ((y - clickInfo.y) * (y - clickInfo.y) < ESP)) {
                mouseEvent.value.type = 'click';
                mouseEvent.value.points = [{ x, y }];
                eventHook.trigger(mouseEvent.value);
            }
        }
    }));

    useEventListener(dom, 'mouseleave', condition(() => {
        clickInfo.expire = 0;
    }));
};