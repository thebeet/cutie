import * as THREE from 'three';
import { watchEffect } from 'vue';
import { MaybeRefOrGetter, toValue, useResizeObserver } from '@vueuse/core';
import { useControls } from './controls';
import { TScene } from '@web3d/three/TScene';
import { useCamera } from './camera';
import { measure } from '@/stores/performance';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export const useScene = (container: MaybeRefOrGetter<HTMLDivElement | undefined>) => {
    const { camera } = useCamera(container);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.render = measure('web3d::renderer::render', renderer.render.bind(renderer));

    const renderer2 = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer2.setPixelRatio(window.devicePixelRatio);
    renderer2.domElement.style.position = 'absolute';
    renderer2.domElement.style.inset = '0';
    renderer2.domElement.style.pointerEvents = 'none';

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.inset = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';

    const { controls } = useControls(camera, renderer);

    const scene = new TScene();
    const scene2 = new TScene();
    let dirty = true;
    let dirty2 = true;
    controls.addEventListener('change', () => { dirty = true; dirty2 = true; });
    scene.addEventListener('change', () => { dirty = true; });
    scene2.addEventListener('change', () => { dirty2 = true; });

    const animate = () => {
        if (dirty) {
            dirty = false;
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
        }
        if (dirty2) {
            dirty2 = false;
            renderer2.render(scene2, camera);
        }
    };
    renderer.setAnimationLoop(animate);

    useResizeObserver(container, (entries) => {
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height);
        labelRenderer.setSize(width, height);
        renderer2.setSize(width, height);
        dirty = true;
        dirty2 = true;
    });

    watchEffect((onCleanup) => {
        const dom = toValue(container);
        if (dom) {
            dom.appendChild(renderer.domElement);
            dom.appendChild(labelRenderer.domElement);
            dom.appendChild(renderer2.domElement);
            onCleanup(() => {
                dom.removeChild(renderer.domElement);
                dom.appendChild(labelRenderer.domElement);
                dom.removeChild(renderer2.domElement);
            });
        }
    });

    return {
        scene, scene2,
        camera,
        renderer,
        controls,
    };
};