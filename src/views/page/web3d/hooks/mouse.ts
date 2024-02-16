import { EventHook, MaybeRefOrGetter, createEventHook, toValue } from '@vueuse/core';
import { Ref, readonly, ref, watch, watchEffect } from 'vue';

export interface AdvanceMouseEvent {
    type: string | null
    cursor?: {
        x: number
        y: number
    }
    points: {
        x: number
        y: number
    }[]
}

export type MouseMode = 'free' | 'line' | 'rect' | 'polyline' | 'brush';

const esp = 1e-6;

const usePos = (event: MouseEvent, dom: HTMLElement) => {
    return {
        x: 2 * event.offsetX / dom.offsetWidth - 1,
        y: -2 * event.offsetY / dom.offsetHeight + 1
    };
};

export const useMouseEvent = (domRef: MaybeRefOrGetter<HTMLElement | undefined>) => {
    const mouseEvent = ref<AdvanceMouseEvent>({
        type: null,
        cursor: undefined,
        points: [],
    });
    const advanceMouseEvent = createEventHook<AdvanceMouseEvent>();
    const state = ref<MouseMode>('free');
    watchEffect(() => {
        const dom = toValue(domRef);
        if (dom) {
            free(dom, mouseEvent, state, advanceMouseEvent);
            rect(dom, mouseEvent, state, advanceMouseEvent);
            polyline(dom, mouseEvent, state, advanceMouseEvent);
            brush(dom, mouseEvent, state, advanceMouseEvent);
            dom.addEventListener('mousemove', (event: MouseEvent) => {
                mouseEvent.value.cursor = usePos(event, dom);
            });
            dom.addEventListener('mouseleave', () => {
                mouseEvent.value.cursor = undefined;
            });
        }
    });

    watch(state, (value) => {
        if (value === 'free') {
            mouseEvent.value.type = null;
            mouseEvent.value.points = [];
        }
    });
    return {
        state,
        mouseEvent: readonly(mouseEvent),
        onAdvanceMouseEvent: advanceMouseEvent.on,
    };
};

const free = (_: HTMLElement, mouseEvent: Ref<AdvanceMouseEvent>, state: Ref<MouseMode>, eventHook: EventHook<AdvanceMouseEvent>) => {
    watch(state, (value) => {
        if (value === 'free') {
            mouseEvent.value.type = null;
            mouseEvent.value.points = [];
            eventHook.trigger(mouseEvent.value);
        }
    }, { immediate: true });

    return { mouseEvent };
};

const brush = (dom: HTMLElement, mouseEvent: Ref<AdvanceMouseEvent>, state: Ref<MouseMode>, eventHook: EventHook<AdvanceMouseEvent>) => {
    const startDraw = (event: MouseEvent) => {
        const { x, y } = usePos(event, dom);
        mouseEvent.value.type = 'brushing';
        mouseEvent.value.points = [{ x, y }];
        const onMove = (event: MouseEvent) => {
            if (mouseEvent.value.points.length < 1) return;
            const { x, y } = usePos(event, dom);
            const { x: prevX, y: prevY } = mouseEvent.value.points[mouseEvent.value.points.length - 1];
            if ((x - prevX) * (x - prevX) + (y - prevY) * (y - prevY) > esp) {
                mouseEvent.value.points.push({ x, y });
            }
            eventHook.trigger(mouseEvent.value);
        };

        const onMouseUp = (event: MouseEvent) => {
            if (mouseEvent.value.points.length < 1) return;
            const { x, y } = usePos(event, dom);
            const { x: prevX, y: prevY } = mouseEvent.value.points[mouseEvent.value.points.length - 1];
            if ((x - prevX) * (x - prevX) + (y - prevY) * (y - prevY) > esp) {
                mouseEvent.value.points.push({ x, y });
            }
            if (mouseEvent.value.points.length > 2) {
                mouseEvent.value.type = 'brushed';
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

    watch(state, (value, oldValue) => {
        if (oldValue === 'brush') {
            dom.removeEventListener('mousedown', startDraw);
        }
        if (value === 'brush') {
            dom.addEventListener('mousedown', startDraw);
        }
    }, { immediate: true });

    return { mouseEvent };
};

const rect = (dom: HTMLElement, mouseEvent: Ref<AdvanceMouseEvent>, state: Ref<MouseMode>, eventHook: EventHook<AdvanceMouseEvent>) => {
    const startDraw = (event: MouseEvent) => {
        const { x, y } = usePos(event, dom);
        mouseEvent.value.type = 'recting';
        mouseEvent.value.points = [{ x, y }, { x, y }];
        const onMove = (event: MouseEvent) => {
            mouseEvent.value.points[mouseEvent.value.points.length - 1] = usePos(event, dom);
        };

        const onMouseUp = (event: MouseEvent) => {
            mouseEvent.value.points[mouseEvent.value.points.length - 1] = usePos(event, dom);

            const { x: prevX, y: prevY } = mouseEvent.value.points[0];
            const { x, y } = mouseEvent.value.points[1];
            if (((x - prevX) * (x - prevX) > esp) && ((y - prevY) * (y - prevY) > esp)) {
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

    watch(state, (value, oldValue) => {
        if (oldValue === 'rect') {
            dom.removeEventListener('mousedown', startDraw);
        }
        if (value === 'rect') {
            dom.addEventListener('mousedown', startDraw);
        }
    }, { immediate: true });

    return { mouseEvent };
};

const polyline = (dom: HTMLElement, mouseEvent: Ref<AdvanceMouseEvent>, state: Ref<MouseMode>, eventHook: EventHook<AdvanceMouseEvent>) => {
    const startDraw = (event: MouseEvent) => {
        if (event.target !== dom) return;
        const { x, y } = usePos(event, dom);
        mouseEvent.value.type = 'polylining';
        mouseEvent.value.points = [{ x, y }];
        const onMove = (event: MouseEvent) => {
            if (mouseEvent.value.points.length < 1) return;
            const { x, y } = usePos(event, dom);
            const { x: prevX, y: prevY } = mouseEvent.value.points[mouseEvent.value.points.length - 1];
            if ((x - prevX) * (x - prevX) + (y - prevY) * (y - prevY) > esp) {
                mouseEvent.value.points.push({ x, y });
            }
        };

        const onMouseUp = (event: MouseEvent) => {
            if (mouseEvent.value.points.length < 1) return;
            const { x, y } = usePos(event, dom);
            const { x: prevX, y: prevY } = mouseEvent.value.points[mouseEvent.value.points.length - 1];
            if ((x - prevX) * (x - prevX) + (y - prevY) * (y - prevY) > esp) {
                mouseEvent.value.points.push({ x, y });
            }
            if (mouseEvent.value.points.length > 2) {
                mouseEvent.value.type = 'polylined';
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

    watch(state, (value, oldValue) => {
        if (oldValue === 'polyline') {
            dom.removeEventListener('mousedown', startDraw);
        }
        if (value === 'polyline') {
            dom.addEventListener('mousedown', startDraw);
        }
    }, { immediate: true });

    return { mouseEvent };
};
