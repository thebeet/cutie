import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const useControls = (camera: THREE.Camera, renderer: THREE.Renderer) => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2;
    controls.maxDistance = 1000;
    controls.minDistance = 10;
    controls.screenSpacePanning = false;
    controls.update();
    return {
        controls
    };
};