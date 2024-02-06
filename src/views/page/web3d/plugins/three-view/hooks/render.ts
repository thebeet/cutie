import * as THREE from 'three';
import { useDrama } from '@web3d/hooks/drama';
import { MaybeRefOrGetter, computed, toValue, watchEffect } from 'vue';
import { useRafFn, useResizeObserver } from '@vueuse/core';

type Containers = {
    container: MaybeRefOrGetter<HTMLDivElement | undefined>;
    front: MaybeRefOrGetter<HTMLDivElement | undefined>;
    side: MaybeRefOrGetter<HTMLDivElement | undefined>;
    top: MaybeRefOrGetter<HTMLDivElement | undefined>;
}

export const useRender = (containers: Containers) => {
    const { scene, threeView } = useDrama();
    const renderer = new THREE.WebGLRenderer({
        powerPreference: 'high-performance',
        antialias: false,
        alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.setScissorTest(true);

    let dirty = true;

    const padding = 0.2;

    const calcRect = (w: number, h: number) => {
        const m = Math.max(w, h);
        const fullPadding = 1 + padding * 2;
        return {
            x: (1 - w / m + 2 * padding) / 2 / fullPadding,
            width: w / m / fullPadding,
            y: (1 - h / m + 2 * padding) / 2 / fullPadding,
            height: h / m / fullPadding,
        };
    };

    const rects = computed(() => {
        return {
            front: calcRect(threeView.value.size.width, threeView.value.size.height),
            side: calcRect(threeView.value.size.length, threeView.value.size.height),
            top: calcRect(threeView.value.size.length, threeView.value.size.width),
        };
    });

    const cameras = computed(() => {
        const frontSize = Math.max(threeView.value.size.width, threeView.value.size.height) * (0.5 + padding);
        const front = new THREE.OrthographicCamera(
            -frontSize, frontSize, frontSize, -frontSize,
            0, threeView.value.size.length * (1 + padding * 2));
        front.up.set(0, 0, 1);
        front.position.set(
            threeView.value.position.x - threeView.value.size.length * (0.5 + padding),
            threeView.value.position.y, threeView.value.position.z);
        front.lookAt(
            threeView.value.position.x, threeView.value.position.y, threeView.value.position.z);
        front.updateProjectionMatrix();
        const sideSize = Math.max(threeView.value.size.length, threeView.value.size.height) * (0.5 + padding);
        const side = new THREE.OrthographicCamera(
            -sideSize, sideSize, sideSize, -sideSize,
            0, threeView.value.size.width * (1 + padding * 2));
        side.up.set(0, 0, 1);
        side.position.set(
            threeView.value.position.x,
            threeView.value.position.y - threeView.value.size.width * (0.5 + padding),
            threeView.value.position.z);
        side.lookAt(threeView.value.position.x, threeView.value.position.y, threeView.value.position.z);
        side.updateProjectionMatrix();
        const topSize = Math.max(threeView.value.size.length, threeView.value.size.width) * (0.5 + padding);
        const top = new THREE.OrthographicCamera(
            -topSize, topSize, topSize, -topSize,
            0, threeView.value.size.height * (1 + padding * 2));
        top.up.set(0, 1, 0);
        top.position.set(
            threeView.value.position.x, threeView.value.position.y,
            threeView.value.position.z + threeView.value.size.height * (0.5 + padding));
        top.lookAt(threeView.value.position.x, threeView.value.position.y, threeView.value.position.z);
        top.updateProjectionMatrix();
        return {
            front, side, top,
        };
    });

    scene.addEventListener('change', () => { dirty = true; });
    const renderTo = (camera: THREE.Camera, container: MaybeRefOrGetter<HTMLDivElement | undefined>) => {
        const dom = toValue(container);
        if (dom) {
            const domRect = dom.getBoundingClientRect();
            const parentRect = dom.parentElement!.getBoundingClientRect();
            const left = domRect.left - parentRect.left;
            const bottom = parentRect.bottom - domRect.bottom;
            renderer.setViewport(left, bottom, domRect.width, domRect.height);
            renderer.setScissor(left, bottom, domRect.width, domRect.height);
            renderer.render(scene, camera);
        }
    };
    useRafFn(() => {
        if (dirty) {
            dirty = false;
            renderer.setScissorTest( false );
            renderer.clear();
            renderer.setScissorTest( true );
            renderTo(cameras.value.front, containers.front);
            renderTo(cameras.value.side, containers.side);
            renderTo(cameras.value.top, containers.top);
        }
    });

    useResizeObserver(containers.container, (entries) => {
        const entry = entries[0];
        const { width, height } = entry.target.getBoundingClientRect();
        renderer.setSize(width, height);
        dirty = true;
    });

    watchEffect((onCleanup) => {
        const dom = toValue(containers.container);
        if (dom) {
            dom.appendChild(renderer.domElement);
            dirty = true;
            onCleanup(() => {
                dom.removeChild(renderer.domElement);
                renderer.dispose();
                renderer.forceContextLoss();
            });
        }
    });

    return {
        rects,
    };
};