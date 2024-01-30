import { defineStore, storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { PointsLabelInstanceColorMaterial } from '../three/material';
import _ from 'lodash';
import { useDrama } from '@web3d/hooks/drama';
import * as THREE from 'three';
import { ParsingInstanceType } from '../types';
import { useParsingAnswerStore } from './answer';

export const useParsingStore = defineStore('plugin::parsing', () => {
    const mainLabelID = ref(1);
    const brushRadius = ref(0.01);
    const showIDOnly = ref(-1);

    const { scene } = useDrama();
    const { answer } = storeToRefs(useParsingAnswerStore());

    const pointsMaterial = new PointsLabelInstanceColorMaterial({ size: 1.0 });
    const instances = ref<ParsingInstanceType[]>([]);

    watch([() => answer.value.parsing?.instances, showIDOnly], ([value, showIDOnly]) => {
        if (value) {
            instances.value = value.map(ins => {
                return {
                    ...ins,
                    lock: false,
                    visible: showIDOnly === -1 || ins.id === showIDOnly,
                } as ParsingInstanceType;
            });
        }
    }, { immediate: true, deep: true });

    watch(() => instances.value.map(ins => ({
        color: ins.color,
        visible: ins.visible
    })), (value) => {
        pointsMaterial.uniforms.instanceColor.value = _.flatten(value?.map(c => {
            const color = new THREE.Color(c.color);
            return [color.r, color.g, color.b, c.visible ? 1.0 : 0.0];
        }));
        pointsMaterial.uniformsNeedUpdate = true;
        scene.update();
    }, { immediate: true, deep: true });

    return {
        mainLabelID, brushRadius,
        instances,
        showIDOnly,
        pointsMaterial
    };
});
