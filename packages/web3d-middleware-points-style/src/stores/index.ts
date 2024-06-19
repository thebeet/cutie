import { useDrama } from '@cutie/web3d';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { PointsAllInOneMaterial } from '../three/material';

export const usePointsStyleStore = defineStore('plugin::points-style', () => {
    const { shaderMode, material, frames, scene, highlightMat } = useDrama();
    const pointSize = ref(1);

    material.value = new PointsAllInOneMaterial({ size: pointSize.value });

    frames.forEach(frame => {
        frame.onPointsLoaded.then(({ points }) => {
            points.material = material.value;
        });
    });
    watch(material, (value) => {
        frames.forEach(frame => {
            if (frame.points) {
                frame.points.material = value;
            }
        });
    });

    watch([pointSize, shaderMode, highlightMat], ([size, mode, mat]) => {
        if (mode === 'normal') material.value.uniforms.mode.value = 0;
        if (mode === 'label') {
            material.value.defines.USE_LABEL = '';
            material.value.uniforms.mode.value = 1;
        } else {
            if (Object.prototype.hasOwnProperty.call(material.value.defines, 'USE_LABEL')) {
                delete material.value.defines.USE_LABEL;
            }
        }
        if (mode === 'intensity') material.value.uniforms.mode.value = 2;
        if (mode === 'deep') material.value.uniforms.mode.value = 3;
        if (mat) {
            material.value.defines.USE_HIGHLIGHT = '';
            material.value.uniforms.highlightMat.value = mat;
            material.value.uniforms.highlightColor.value = [1.0, 0.0, 0.0, 1.0];
        } else {
            if (Object.prototype.hasOwnProperty.call(material.value.defines, 'USE_HIGHLIGHT')) {
                delete material.value.defines.USE_HIGHLIGHT;
            }
        }
        material.value.uniforms.pointSize.value = size;
        material.value.needsUpdate = true;
        scene.update();
    }, { immediate: true });

    return {
        shaderMode, material, pointSize
    } as const;
});