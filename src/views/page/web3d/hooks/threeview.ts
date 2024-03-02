import { RBox } from '../types';
import { createEventHook } from '@vueuse/core';

export const useThreeView = () => {
    const setupEvent = createEventHook<RBox | undefined>();
    const confirmEvent = createEventHook<RBox>();
    const changeEvent = createEventHook<RBox>();

    const setup = (box?: RBox) => {
        setupEvent.trigger(box);
    };

    return {
        setup,
        onSetup: setupEvent.on,
        onConfirm: confirmEvent.on,
        onChange: changeEvent.on,

        confirmEvent,
        changeEvent
    } as const;
};
