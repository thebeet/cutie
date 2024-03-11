import { MaybeRefOrGetter, Ref, toValue } from 'vue';
import { usePos } from '../hooks/pos';
import { EventHook, useEventListener, whenever } from '@vueuse/core';
import { AdvanceMouseEvent } from '../types';
import { useMagicKeys } from '@vueuse/core';

export const drawLine = (
    dom: MaybeRefOrGetter<HTMLElement>,
    enabled: MaybeRefOrGetter<boolean>,
    mouseEvent: Ref<AdvanceMouseEvent>,
    eventHook: EventHook<AdvanceMouseEvent>) => {

    let line = false;

    whenever(() => !toValue(enabled), () => line = false);

    const condition = (func: (event: MouseEvent) => void) => (event: MouseEvent) => {
        toValue(enabled) ? func(event) : null;
    };

    const { Enter } = useMagicKeys();
    whenever(Enter, () => {
        if (line === true) {
            mouseEvent.value = {
                ...mouseEvent.value,
                type: 'lined'
            };
            eventHook.trigger(mouseEvent.value);
            line = false;
        }
    });

    useEventListener(dom, 'mousemove', condition((event: MouseEvent) => {
        if (event.buttons === 0) {
            const { x, y } = usePos(event, toValue(dom));
            if (line === false) {
                mouseEvent.value = {
                    type: 'lining',
                    points: [{ x, y }]
                };
                line = true;
            }
            mouseEvent.value = {
                type: 'lining',
                points: [
                    ...mouseEvent.value.points.slice(0, mouseEvent.value.points.length - 1),
                    { x, y }
                ]
            };
            eventHook.trigger(mouseEvent.value);
        }
    }));

    useEventListener(dom, 'mouseup', condition((event: MouseEvent) => {
        if (event.button === 0) {
            if (line === false) {
                mouseEvent.value = {
                    type: 'lining',
                    points: []
                };
                line = true;
            }
            const { x, y } = usePos(event, toValue(dom));
            mouseEvent.value = {
                type: 'lining',
                points: [
                    ...mouseEvent.value.points,
                    { x, y }
                ]
            };
            eventHook.trigger(mouseEvent.value);
        }
    }));


            console.log(mouseEvent.value)


};