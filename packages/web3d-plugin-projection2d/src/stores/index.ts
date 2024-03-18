import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDrama, Camera2D } from '@cutie/web3d';
import * as THREE from 'three';

export const useProjection2DStore = defineStore('plugin::projection2d', () => {
    const panelVisible = ref(false);
    const { page, primaryFrame } = useDrama();

    const cameras = computed(() => {
        const frame = primaryFrame.value;
        const m = frame.matrixWorld.clone().invert();
        return page.data.frames[frame.index - 1].cameras.map(camera => {
            const matrixM = new THREE.Matrix4().fromArray([...camera.params.M]);
            matrixM.premultiply(m);
            return {
                ...camera,
                params: {
                    ...camera.params,
                    M: matrixM.elements
                }
            } as Camera2D;
        });
    });

    return {
        cameras,
        panelVisible
    } as const;
});
