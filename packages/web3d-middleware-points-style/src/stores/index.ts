import { useDrama } from '@cutie/web3d';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { PointsAllInOneMaterial } from '../three/material';

export const usePointsStyleStore = defineStore('plugin::points-style', () => {
    const { shaderMode, material, frames, scene } = useDrama();
    const pointSize = ref(1);

    material.value = new PointsAllInOneMaterial({ size: 1 });

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

    watch(shaderMode, (mode) => {
        if (mode === 'normal') material.value.uniforms.mode.value = 0;
        if (mode === 'label') material.value.uniforms.mode.value = 1;
        if (mode === 'intensity') material.value.uniforms.mode.value = 2;
        if (mode === 'deep') material.value.uniforms.mode.value = 3;
        material.value.needsUpdate = true;
        scene.update();
    }, { immediate: true });

    return {
        shaderMode, material, pointSize
    } as const;
});