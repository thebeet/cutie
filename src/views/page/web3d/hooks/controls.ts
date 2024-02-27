import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ref, watch } from 'vue';

export const useControls = (camera: THREE.Camera, renderer: THREE.Renderer) => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2;
    controls.maxDistance = 1000;
    controls.minDistance = 1;
    controls.screenSpacePanning = false;
    controls.zoomToCursor = true;
    controls.update();

    const mode = ref<string>('free');

    watch(mode, (value) => {
        if (value === 'top-down') {
            controls.maxPolarAngle = 0;
            controls.update();
        } else {
            controls.maxPolarAngle = Math.PI / 2;
        }
    });

    return {
        controls,
        controlMode: mode
    } as const;
};