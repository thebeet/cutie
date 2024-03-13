import * as THREE from 'three';
import { watchEffect } from 'vue';
import { MaybeRefOrGetter, toValue, useResizeObserver } from '@vueuse/core';
import { useControls } from './controls';
import { TScene } from '../three/TScene';
import { useCamera } from './camera';
import { usePerformanceStore } from '../stores/performance';
import { CSS2DRenderer } from '../three/CSS2DRenderer';

export const useScene = (container: MaybeRefOrGetter<HTMLDivElement | undefined>) => {
    const { measure } = usePerformanceStore();
    const { camera } = useCamera(container);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.render = measure('web3d::renderer::render', renderer.render.bind(renderer));

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.inset = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    labelRenderer.render = measure('web3d::2drenderer::render', labelRenderer.render.bind(labelRenderer));

    const { controls, controlMode, transform } = useControls(camera, renderer);
    const scene = new TScene();
    let dirty = true;
    controls.addEventListener('change', () => { dirty = true; });
    transform.addEventListener('change', () => { dirty = true; });
    scene.addEventListener('change', () => { dirty = true; });
    scene.add(transform);

    const animate = () => {
        renderer.autoClear = false;
        if (dirty) {
            dirty = false;
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
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
            });
        }
    });

    return {
        scene, camera, renderer,
        controls, controlMode, transform,
    } as const;
};