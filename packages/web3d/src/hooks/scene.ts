import * as THREE from 'three';
import { watchEffect } from 'vue';
import { MaybeRefOrGetter, createEventHook, toValue, useResizeObserver } from '@vueuse/core';
import { useControls } from './controls';
import { TScene } from '../three/TScene';
import { useCamera } from './camera';
import { CSS2DRenderer } from '../three/CSS2DRenderer';

export const useScene = (container: MaybeRefOrGetter<HTMLDivElement | undefined>) => {
    const { camera } = useCamera(container);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.inset = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';

    const { controls, controlMode, transform, attachTransform } = useControls(camera, renderer);
    const scene = new TScene();
    let dirty = true;
    controls.addEventListener('change', () => { dirty = true; });
    scene.addEventListener('change', () => { dirty = true; });
    scene.add(transform);

    const renderHook = createEventHook<{renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera}>();
    const renderBeforeHook = createEventHook<{renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera}>();
    const animate = () => {
        renderer.autoClear = false;
        if (dirty) {
            dirty = false;
            transform.updateMatrixWorld();
            renderBeforeHook.trigger({ renderer, scene, camera });
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
            renderHook.trigger({ renderer, scene, camera });
        }
    };
    renderer.setAnimationLoop(animate);

    useResizeObserver(container, (entries) => {
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height);
        labelRenderer.setSize(width, height);
        dirty = true;
    });

    watchEffect((onCleanup) => {
        const dom = toValue(container);
        if (dom) {
            dom.appendChild(renderer.domElement);
            dom.appendChild(labelRenderer.domElement);
            onCleanup(() => {
                dom.removeChild(renderer.domElement);
                dom.appendChild(labelRenderer.domElement);
                renderer.dispose();
                renderer.forceContextLoss();
            });
        }
    });

    return {
        scene, camera, renderer,
        controls, controlMode, transform, attachTransform,
        onBeforeRender: renderBeforeHook.on,
        onRender: renderHook.on
    } as const;
};