import { defineStore } from 'pinia';
import { computed, watch } from 'vue';
import { TBox } from '../three/TBox';
import { ABox } from '../types';
import { useDrama, useFocus, useSync } from '@cutie/web3d';
import { ModifyBoxOperation } from '../operations/ModifyBoxOperation';

export const useBoxStore = defineStore('plugin::box', () => {
    const { frames, answer, transform, attachTransform, applyOperation } = useDrama();

    const elements = computed(() => answer.value.elements.filter(e => e.schema === 'box') as Readonly<ABox>[]);
    const boxes: Map<string, TBox> = new Map([]);
    const { draft } = useSync(frames, elements, boxes,
        el => new TBox(el), (obj, el) => obj.apply(el), obj => obj.dispose());
    const { focused } = useFocus(elements, boxes);
    watch(focused, value => {
        if (value === undefined) {
            draft.value = undefined;
            attachTransform();
        } else {
            transform.setSpace('local');
            attachTransform(boxes.get(value.uuid), (box) => {
                draft.value = {
                    ...value,
                    ...box
                };
            }, (box) => {
                const op = new ModifyBoxOperation(value.uuid, { ...value, ...box });
                applyOperation(op);
            });
        }
    });

    return {
        focused, draft,
        elements, boxes
    } as const;
});