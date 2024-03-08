import { nextTick } from 'vue';
import { RBox } from '../types';
import { createEventHook } from '@vueuse/core';

export const useThreeView = () => {
    type RBoxWithUUID = RBox & { uuid: string };

    const setupEvent = createEventHook<RBoxWithUUID | undefined>();
    const confirmEvent = createEventHook<RBoxWithUUID>();
    const changeEvent = createEventHook<RBoxWithUUID>();

    const pending: Array<RBoxWithUUID | undefined> = [];
    const setup = (box?: RBoxWithUUID) => {
        pending.push(box);
        nextTick(() => {
            const box = pending.find(b => b !== undefined);
            pending.splice(0, pending.length);
            setupEvent.trigger(box);
        });
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
