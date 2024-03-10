import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useDrama } from '@cutie/web3d';
import { ALine } from '../types';
import { TLine } from '../three/TLine';

export const useLineStore = defineStore('plugin::line', () => {
    const { answer, frames } = useDrama();

    const elements = computed(() => {
        return [
            { uuid: 'xxx', schema: 'line', type: 'line', label: 'label',
                description: 'des',
                frameIndex: 1,
                points: new Float32Array([0, 1, 2, 2, 3, 2, 4, 5, 2, 6, 5, 2]) } as ALine,
        ];
        return answer.value.elements.filter(e => e.schema === 'line') as ALine[];
    });

    const lines: Map<string, TLine> = new Map([]);

    const focusedUUID = ref<string>('');
    const focused = computed({
        get: () => elements.value.find(item => item.uuid === focusedUUID.value),
        set: (v) => focusedUUID.value = v?.uuid ?? ''
    });

    watch(elements, (newValue) => {
        if (newValue) {
            const used: Map<string, boolean> = new Map([]);
            for (const key of lines.keys()) {
                used.set(key, false);
            }
            newValue.forEach((element) => {
                const line = lines.get(element.uuid);
                if (line) {
                    used.set(element.uuid, true);
                    //line.apply(element);
                } else {
                    const frame = frames[element.frameIndex];
                    const line = new TLine(element);
                    lines.set(element.uuid, line);
                    frame.add(line);
                    frame.update();
                }
            });
            for (const [key, value] of used.entries()) {
                if (!value) {
                    const line = lines.get(key);
                    if (line) {
                        const frame = line.parentFrame;
                        line.removeFromParent();
                        line.dispose();
                        frame.update();
                        lines.delete(key);
                    }
                }
            }
        }
    }, { immediate: true });

    return {
        focused,
        elements, lines
    };
});