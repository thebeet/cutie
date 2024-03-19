import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { ref, watch } from 'vue';
import { RBox } from '../types';

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
    transform.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
            obj.material.name = 'transform';
        } else if (obj instanceof THREE.Sprite) {
            obj.material.name = 'transform::sprite';
        } else if (obj instanceof THREE.Line) {
            obj.material.name = 'transform::line';
        }
    });

    type ChangeCallBack = (box: RBox) => void;
    let changeCallback: ChangeCallBack | undefined = undefined;
    let confirmCallback: ChangeCallBack | undefined = undefined;
    let attachedObj: THREE.Object3D | undefined = undefined;
    transform.addEventListener('dragging-changed', (event) => {
        controls.enabled = !event.value;
        if (!event.value && confirmCallback && transform.object && (attachedObj === transform.object)) {
            const box = {
                position: { x: transform.object.position.x, y: transform.object.position.y, z: transform.object.position.z },
                rotation: { x: transform.object.rotation.x, y: transform.object.rotation.y, z: transform.object.rotation.z },
                size: { x: transform.object.scale.x, y: transform.object.scale.y, z: transform.object.scale.z }
            } as RBox;
            confirmCallback(box);
        }
    });

    transform.addEventListener('change', () => {
        transform.updateMatrixWorld();
        if (transform.object && changeCallback) {
            transform.object.updateMatrix();
            if (attachedObj === transform.object) {
                const box = {
                    position: { x: transform.object.position.x, y: transform.object.position.y, z: transform.object.position.z },
                    rotation: { x: transform.object.rotation.x, y: transform.object.rotation.y, z: transform.object.rotation.z },
                    size: { x: transform.object.scale.x, y: transform.object.scale.y, z: transform.object.scale.z }
                } as RBox;
                changeCallback(box);
            }
        }
    });


    const attachTransform = (obj?: THREE.Object3D, onChange?: ChangeCallBack, onConfirm?: ChangeCallBack) => {
        if (obj) {
            transform.attach(obj);
            attachedObj = obj;
            changeCallback = onChange;
            confirmCallback = onConfirm;
        } else {
            transform.detach();
        }
    };

    return {
        controls,
        controlMode: mode,

        transform, attachTransform
    } as const;
};