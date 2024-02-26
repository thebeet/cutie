import { useDrama } from '@web3d/hooks/drama';
import * as THREE from 'three';
import { watch } from 'vue';
import { useLineStore } from './stores';
import { storeToRefs } from 'pinia';
import { TLine } from './three/TLine';


export const useLine = () => {
    const { frames } = useDrama();
    const lines: Map<string, TLine> = new Map([]);
    const { focused, elements } = storeToRefs(useLineStore());
    return {
        elements, lines,
        focused
    };
};