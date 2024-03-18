import { defineStore, storeToRefs } from 'pinia';
import { ref, watch, watchEffect } from 'vue';
import { useDrama } from '@cutie/web3d';
import * as THREE from 'three';
import { useParsingAnswerStore } from './answer';
import { ParsingInstance } from '../types';
export const useParsingStore = defineStore('plugin::parsing', () => {
    const mainLabelID = ref(1);
    const brushRadius = ref(0.01);

    const { scene, frames, material } = useDrama();
    const { answer } = storeToRefs(useParsingAnswerStore());

    const instanceStates = ref<{
        lock: boolean
        visible: boolean
    }[]>([]);
    const instanceCounts = ref<number[][]>([]);
    const instances = ref<ParsingInstance[]>([]);

    watch(() => answer.value.parsing?.instances, (answerInstances) => {
        if (instanceCounts.value.length === 0) {
            const arr = answerInstances.map(() => new Array(frames.length).fill(0));
            answer.value.parsing.frames.forEach(frame => {
                const res = new Uint32Array(answerInstances.length).fill(0); // use Uint32Array instead Array
                const N = frame.label.length;
                const label = frame.label;
                for (let i = 0; i < N; ++i) {
                    res[label[i]]++;
                }
                res.forEach((v, index) => arr[index][frame.index] = v);
            });
            instanceCounts.value = arr;
        }
        if (instanceStates.value.length === 0) {
            instanceStates.value = answerInstances.map(() => ({ lock: false, visible: true }));
        }
        instances.value = answerInstances.map((instance, index) => ({
            ...instance,
            ...instanceStates.value[index],
            counts: instanceCounts.value[index]
        }));
    });

    watchEffect(() => {
        const colorUniform = material.value.uniforms.instanceColor.value;
        for (let i = 0; i < instances.value.length; i++) {
            const inst = instances.value[i];
            const color = new THREE.Color(inst.color);
            colorUniform[i * 4] = color.r;
            colorUniform[i * 4 + 1] = color.g;
            colorUniform[i * 4 + 2] = color.b;
            colorUniform[i * 4 + 3] = inst.visible ? 1 : 0;
        }
        material.value.uniformsNeedUpdate = true;
        scene.update();
    });

    return {
        mainLabelID, brushRadius,
        instances
    } as const;
});
