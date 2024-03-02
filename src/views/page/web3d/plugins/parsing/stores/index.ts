import { defineStore, storeToRefs } from 'pinia';
import { ref, watch, watchEffect } from 'vue';
import { PointsLabelInstanceColorMaterial } from '../three/material';
import _ from 'lodash';
import { useDrama } from '@web3d/hooks/drama';
import * as THREE from 'three';
import { useParsingAnswerStore } from './answer';
import { ParsingInstance, RBox } from '../types';
import { rbox2Matrix } from '@web3d/utils/rbox';
import { TBox } from '../three/TBox';

export const useParsingStore = defineStore('plugin::parsing', () => {
    const mainLabelID = ref(1);
    const brushRadius = ref(0.01);
    const boxParsing = ref(false);

    const { scene, frames } = useDrama();
    const { answer } = storeToRefs(useParsingAnswerStore());

    const box = ref<RBox>();
    let tbox: TBox;

    watch(box, (value) => {
        if (value) {
            if (!tbox) {
                tbox = new TBox(value);
            } else {
                tbox.apply(value);
                scene.update();
            }
            if (!tbox.parent) {
                frames[1].add(tbox);
            }
        }
    }, { deep: true });



    const pointsMaterial = new PointsLabelInstanceColorMaterial({ size: 1.0 });

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
        pointsMaterial.uniforms.instanceColor.value = _.flatten(instances.value.map(c => {
            const color = new THREE.Color(c.color);
            return [color.r, color.g, color.b, c.visible ? 1.0 : 0.0];
        }));
        if (box.value) {
            pointsMaterial.uniforms.previewBox.value = true;
            const color = new THREE.Color(instances.value[mainLabelID.value].color);
            pointsMaterial.uniforms.previewColor.value = [color.r, color.g, color.b, instances.value[mainLabelID.value].visible ? 1.0 : 0.0];
            pointsMaterial.uniforms.previewBoxMatrix.value = rbox2Matrix(box.value).invert();
        } else {
            pointsMaterial.uniforms.previewBox.value = false;
        }
        pointsMaterial.uniformsNeedUpdate = true;
        scene.update();
    });

    return {
        mainLabelID, brushRadius, box, boxParsing,
        instances,
        pointsMaterial
    } as const;
});
