import { RBox } from '../types';
import { createEventHook } from '@vueuse/core';

export const useThreeView = () => {
    const confirmEvent = createEventHook<RBox>();
    const changeEvent = createEventHook<RBox>();

    const setup = (box: RBox) => {
        confirmEvent.trigger(box);
    };

    return {
        setup,
        onConfirm: confirmEvent.on,
        onChange: changeEvent.on,

        confirmEvent,
        changeEvent
    } as const;
};
