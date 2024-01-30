import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const useControls = (camera: THREE.Camera, renderer: THREE.Renderer) => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minAzimuthAngle = -Math.PI / 2;
    controls.maxAzimuthAngle = Math.PI / 2;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.maxDistance = 1000;
    controls.minDistance = 10;
    controls.screenSpacePanning = false;
    controls.update();
    return {
        controls
    };
};