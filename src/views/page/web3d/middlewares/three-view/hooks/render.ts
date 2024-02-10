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

    const layers = new THREE.Layers();
    layers.enableAll();

    const getCamera = (center: THREE.Vector3, size: number, deep: number, toward: THREE.Vector3, up: THREE.Vector3, rotation: THREE.Quaternion) => {
        const camera = new THREE.OrthographicCamera(-size / 2, size / 2, size / 2, -size / 2, 0, deep);
        camera.up.set(...up.clone().applyQuaternion(rotation).toArray());
        camera.position.set(...center.clone().add(toward.clone().applyQuaternion(rotation).multiplyScalar(deep / 2)).toArray());
        camera.lookAt(...center.toArray());
        camera.layers = layers;
        camera.updateProjectionMatrix();
        return camera;
    };

    const X = new THREE.Vector3(1, 0, 0);
    const XUp = new THREE.Vector3(0, 0, 1);
    const Y = new THREE.Vector3(0, -1, 0);
    const YUp = new THREE.Vector3(0, 0, 1);
    const Z = new THREE.Vector3(0, 0, 1);
    const ZUp = new THREE.Vector3(0, 1, 0);

    const cameras = computed(() => {
        const outer = threeView.value.outer;
        if (outer) {
            const position = new THREE.Vector3(outer.position.x, outer.position.y, outer.position.z);
            const quaternion = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(outer.rotation.phi, outer.rotation.theta, outer.rotation.psi));

            const frontSize = Math.max(outer.size.width, outer.size.height);
            const front = getCamera(position, frontSize, outer.size.length, X, XUp, quaternion);

            const sideSize = Math.max(outer.size.length, outer.size.height);
            const side = getCamera(position, sideSize, outer.size.width, Y, YUp, quaternion);

            const topSize = Math.max(outer.size.length, outer.size.width);
            const top = getCamera(position, topSize, outer.size.height, Z, ZUp, quaternion);
            return {
                front, side, top,
            };
        }
        return undefined;
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
            if (cameras.value) {
                dirty = false;
                renderer.setScissorTest( false );
                renderer.clear();
                renderer.setScissorTest( true );
                renderTo(cameras.value.front, containers.front);
                renderTo(cameras.value.side, containers.side);
                renderTo(cameras.value.top, containers.top);
            }

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
    };
};