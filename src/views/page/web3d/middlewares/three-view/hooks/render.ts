import * as THREE from 'three';
import { useDrama } from '@web3d/hooks/drama';
import { MaybeRefOrGetter, computed, ref, toValue, watch, watchEffect } from 'vue';
import { useElementSize, useEventListener, useRafFn, useResizeObserver } from '@vueuse/core';
import { useThreeViewStore } from '../stores';

type Containers = {
    container: MaybeRefOrGetter<HTMLDivElement | undefined>;
    front: MaybeRefOrGetter<HTMLDivElement | undefined>;
    side: MaybeRefOrGetter<HTMLDivElement | undefined>;
    top: MaybeRefOrGetter<HTMLDivElement | undefined>;
}

export const useRender = (containers: Containers) => {
    const { scene, threeViewOuter } = useDrama();
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

    const zooms = ref({
        front: 1,
        side: 1,
        top: 1,
    });

    const getCamera = (name: 'front' | 'side' | 'top', center: THREE.Vector3, aspect: number,
        width: number, height: number, deep: number, toward: THREE.Vector3, up: THREE.Vector3, rotation: THREE.Quaternion) => {
        const xSize = Math.max(width, height * aspect);
        const ySize = Math.max(height, width / aspect);
        const camera = new THREE.OrthographicCamera(-xSize / 2, xSize / 2, ySize / 2, -ySize / 2, 0, deep);
        camera.up.set(...up.clone().applyQuaternion(rotation).toArray());
        camera.position.set(...center.clone().add(toward.clone().applyQuaternion(rotation).multiplyScalar(deep / 2)).toArray());
        camera.lookAt(...center.toArray());
        camera.zoom = zooms.value[name];
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();
        return camera;
    };

    const { X, XUp, Y, YUp, Z, ZUp } = useThreeViewStore();

    const frontContainerSize = useElementSize(containers.front);
    const sideContainerSize = useElementSize(containers.front);
    const topContainerSize = useElementSize(containers.front);

    const zoomCameraHandler = (name: 'front' | 'side' | 'top') => {
        return (event: WheelEvent) => {
            zooms.value[name] = Math.max(Math.min(zooms.value[name] - event.deltaY / 200, 2), .25);
            dirty = true;
        };
    };

    const cameras = computed(() => {
        const outer = threeViewOuter.value;
        if (outer) {
            const position = new THREE.Vector3(outer.position.x, outer.position.y, outer.position.z);
            const quaternion = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(outer.rotation.x, outer.rotation.y, outer.rotation.z));
            const front = getCamera('front', position, frontContainerSize.width.value / frontContainerSize.height.value,
                outer.size.y, outer.size.z, outer.size.x, X, XUp, quaternion);
            const side = getCamera('side', position, sideContainerSize.width.value / sideContainerSize.height.value,
                outer.size.x, outer.size.z, outer.size.y, Y, YUp, quaternion);
            const top = getCamera('top', position, topContainerSize.width.value / topContainerSize.height.value,
                outer.size.x, outer.size.y, outer.size.z, Z, ZUp, quaternion);
            return {
                front, side, top,
            };
        }
        return undefined;
    });

    useEventListener(containers.front, 'wheel', zoomCameraHandler('front'));
    useEventListener(containers.side, 'wheel', zoomCameraHandler('side'));
    useEventListener(containers.top, 'wheel', zoomCameraHandler('top'));

    scene.addEventListener('change', () => { dirty = true; });
    watch(threeViewOuter, () => { dirty = true; });

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
                renderer.setScissorTest(false);
                renderer.clear();
                renderer.setScissorTest(true);
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
                frontContainerSize.stop();
                sideContainerSize.stop();
                topContainerSize.stop();
                dom.removeChild(renderer.domElement);
                renderer.dispose();
                renderer.forceContextLoss();
            });
        }
    });

    return {
        cameras,
    };
};