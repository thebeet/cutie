import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useDrama, useFocus, useSetFocusOnClick, useSync } from '@cutie/web3d';
import { ALine } from '../types';
import { TLine } from '../three/TLine';
import * as THREE from 'three';

export const useLineStore = defineStore('plugin::line', () => {
    const { answer, frames, primaryFrame } = useDrama();

    const elements = computed(() => {
        return answer.value.elements.filter(e => e.schema === 'line') as ALine[];
    });
    const lines: Map<string, TLine> = new Map([]);
    const { draft } = useSync(frames, elements, lines,
        el => new TLine(el), (obj, el) => obj.apply(el), obj => obj.dispose());
    const { focused } = useFocus(elements, lines);
    useSetFocusOnClick(focused, lines, obj => obj.element);


    const newElement = () => ({
        uuid: THREE.MathUtils.generateUUID(),
        schema: 'line',
        type: 'line',
        label: 'label',
        description: 'description',
        frameIndex: primaryFrame.value.index,
        points: [],
    } as ALine);

    return {
        newElement,

        draft, focused,
        elements, lines
    };
});