import { useAdvanceDrama } from '@cutie/web3d';
import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useRenderInfoStore = defineStore('plugin::render-info', () => {
    const { onRender } = useAdvanceDrama();

    const info = shallowRef<any>();
    onRender(({ renderer }) => {
        info.value = {
            memory: { ...renderer.info.memory },
            render: { ...renderer.info.render },
            programs: renderer.info.programs ? [...renderer.info.programs!.map((program) => `${program.name}(${program.usedTimes})`)] : [],
        };
    });

    return {
        info
    } as const;
});