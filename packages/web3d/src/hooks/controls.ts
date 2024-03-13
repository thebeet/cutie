import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { ref, watch } from 'vue';

export const useControls = (camera: THREE.Camera, renderer: THREE.Renderer) => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2;
    controls.maxDistance = 2000;
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

    const transform = new TransformControls(camera, renderer.domElement);
    transform.layers.enableAll();
    transform.addEventListener('dragging-changed', (event) => {
        controls.enabled = ! event.value;
    });

    return {
        controls,
        controlMode: mode,

        transform
    } as const;
};