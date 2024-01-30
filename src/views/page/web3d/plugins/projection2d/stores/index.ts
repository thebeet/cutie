import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usePageStore } from '@web3d/stores/page';
import { useDrama } from '@web3d/hooks/drama';
import { storeToRefs } from 'pinia';
import * as THREE from 'three';
import _ from 'lodash';

export const useProjection2DStore = defineStore('plugin::projection2d', () => {
    const panelVisible = ref(false);
    const { page } = storeToRefs(usePageStore());
    const { activeFrames } = useDrama();

    const cameras = computed(() => _.flatten(activeFrames.value.map(frame => {
        const m = frame.matrixWorld.clone().invert();
        return page.value.data.frames[frame.index - 1].cameras.map(camera => {
            const matrixM = new THREE.Matrix4().fromArray([...camera.params.M]);
            matrixM.multiply(m);
            return {
                ...camera,
                params: {
                    ...camera.params,
                    M: matrixM.elements
                }
            };
        });
    })));

    return {
        cameras,
        panelVisible
    };
});
