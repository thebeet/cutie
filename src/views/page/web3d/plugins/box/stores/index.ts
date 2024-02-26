import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useDrama } from '@web3d/hooks/drama';
import { ABox } from '../types';
import { TBox } from '../three/TCube';
import { TFrame } from '@web3d/three/TFrame';

export const useBoxStore = defineStore('plugin::box', () => {
    const { answer, frames } = useDrama();

    const boxes: Map<string, TBox> = new Map([]);
    const focusedUUID = ref<string>('');
    const focused = computed({
        get: () => boxes.get(focusedUUID.value)?.box,
        set: (v) => focusedUUID.value = v?.uuid ?? ''
    });

    const elements = computed(() => {
        return answer.value.elements.filter(e => e.schema === 'cube') as ABox[];
    });

    watch(elements, (newValue) => {
        if (newValue) {
            const used: Map<string, boolean> = new Map([]);
            for (const key of boxes.keys()) {
                used.set(key, false);
            }
            newValue.forEach((element) => {
                const cube = boxes.get(element.uuid);
                if (cube) {
                    used.set(element.uuid, true);
                    cube.apply(element);
                } else {
                    const frame = frames[element.frameIndex];
                    const cube = new TBox(element);
                    boxes.set(element.uuid, cube);
                    frame!.add(cube);
                    frame.update();
                }
            });
            for (const [key, value] of used.entries()) {
                if (!value) {
                    const cube = boxes.get(key);
                    if (cube) {
                        const frame = cube.parent as TFrame;
                        cube.removeFromParent();
                        cube.dispose();
                        frame.update();
                        boxes.delete(key);
                    }
                }
            }
        }
    });

    return {
        focused,
        elements, boxes
    };
});