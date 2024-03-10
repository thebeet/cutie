import { defineStore, storeToRefs } from 'pinia';
import { ref, watch, watchEffect } from 'vue';
import { PointsLabelInstanceColorMaterial } from '../three/material';
import _ from 'lodash';
import { useDrama } from '@cutie/web3d';
import * as THREE from 'three';
import { useParsingAnswerStore } from './answer';
import { ParsingBox, ParsingInstance } from '../types';
import { rbox2Matrix } from '@cutie/web3d';
import { TBox } from '../three/TBox';
import { useFocus } from '@cutie/web3d';

export const useParsingStore = defineStore('plugin::parsing', () => {
    const mainLabelID = ref(1);
    const brushRadius = ref(0.01);
    const boxParsing = ref(false);

    const { scene, frames } = useDrama();
    const { answer } = storeToRefs(useParsingAnswerStore());

    const instanceStates = ref<{
        lock: boolean
        visible: boolean
    }[]>([]);
    const instanceCounts = ref<number[][]>([]);
    const instances = ref<ParsingInstance[]>([]);

    const boxes = ref<ParsingBox[]>([]);
    const tboxes = new Map<string, TBox>([]);
    const { focused } = useFocus(boxes, tboxes);

    const updateBox = (newBox: Partial<ParsingBox>) => {
        boxes.value = boxes.value.map(box => (box.uuid === newBox.uuid) ? { ...box, ...newBox } : box);
    };

    const pointsMaterial = new PointsLabelInstanceColorMaterial({ size: 1.0 });

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
        pointsMaterial.uniforms.instanceColor.value = _.flatten(instances.value.map(c => {
            const color = new THREE.Color(c.color);
            return [color.r, color.g, color.b, c.visible ? 1.0 : 0.0];
        }));
        pointsMaterial.uniforms.previewBoxCount.value = Math.min(boxes.value.length, 64);
        if (boxes.value.length > 0) {
            const color = new THREE.Color(instances.value[mainLabelID.value].color);
            pointsMaterial.uniforms.previewColor.value = [color.r, color.g, color.b, instances.value[mainLabelID.value].visible ? 1.0 : 0.0];
            const mats = boxes.value.map(box => rbox2Matrix(box).invert());
            for (let i = mats.length; i < 64; i++) {
                mats.push(new THREE.Matrix4());
            }
            pointsMaterial.uniforms.previewBoxMatrixs.value = mats.slice(0, 64);
            pointsMaterial.uniforms.instanceLock.value = instances.value.map(i => i.lock ? 1 : 0);
        }
        pointsMaterial.uniformsNeedUpdate = true;
        scene.update();
    });

    return {
        mainLabelID, brushRadius, boxParsing,
        boxes, tboxes, focused, updateBox,
        instances,
        pointsMaterial
    } as const;
});
