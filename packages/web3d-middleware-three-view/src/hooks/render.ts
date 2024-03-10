import * as THREE from 'three';
import { useDrama, RBox } from '@cutie/web3d';
import { MaybeRefOrGetter, computed, ref, toValue, watch, watchEffect } from 'vue';
import { useElementSize, useEventListener, useRafFn, useResizeObserver } from '@vueuse/core';

import { axis2d, views } from '../constants';
import { useThreeViewStore } from '../stores';
import { storeToRefs } from 'pinia';

type Containers = {
    container: MaybeRefOrGetter<HTMLDivElement | undefined>;
    front: MaybeRefOrGetter<HTMLDivElement | undefined>;
    side: MaybeRefOrGetter<HTMLDivElement | undefined>;
    top: MaybeRefOrGetter<HTMLDivElement | undefined>;
}

export const useRender = (containers: Containers) => {
    const { scene } = useDrama();
    const { inner, outer, isChanging } = storeToRefs(useThreeViewStore());
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

    const canvasSize = {
        front: useElementSize(containers.front),
        side: useElementSize(containers.side),
        top: useElementSize(containers.top),
    };
    const getCamera = (name: 'front' | 'side' | 'top', rbox: MaybeRefOrGetter<RBox | undefined>) => {
        const vbox = toValue(rbox);
        if (!vbox) return;
        const box = isChanging.value[name] ? vbox : {
            ...vbox,
            rotation: inner.value?.rotation ?? { x: 0, y: 0, z: 0 }
        };
        const containerSize = {
            width: canvasSize[name].width.value,
            height: canvasSize[name].height.value,
        };
        if (box && containerSize.width > 0 && containerSize.height > 0) {
            const aspect = containerSize.width / containerSize.height;
            const center = new THREE.Vector3(box.position.x, box.position.y, box.position.z);
            const width = box.size[axis2d[name].x];
            const height = box.size[axis2d[name].y];
            const deep = box.size[axis2d[name].z];
            const xSize = Math.max(width, height * aspect);
            const ySize = Math.max(height, width / aspect);
            const rotation = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(box.rotation.x, box.rotation.y, box.rotation.z));
            const camera = new THREE.OrthographicCamera(-xSize / 2, xSize / 2, ySize / 2, -ySize / 2, 0, deep);
            camera.up.set(...views[name].UP.clone().applyQuaternion(rotation).toArray());
            camera.position.set(...center.clone().add(views[name].z.clone().applyQuaternion(rotation).multiplyScalar(deep / 2)).toArray());
            camera.lookAt(...center.toArray());
            camera.zoom = zooms.value[name];
            camera.updateMatrixWorld();
            camera.updateProjectionMatrix();
            return camera;
        }
    };

    const cameras = {
        front: computed(() => getCamera('front', outer)),
        side: computed(() => getCamera('side', outer)),
        top: computed(() => getCamera('top', outer)),
    };

    const zoomCameraHandler = (name: 'front' | 'side' | 'top') => {
        return (event: WheelEvent) => {
            zooms.value[name] = Math.max(Math.min(zooms.value[name] - event.deltaY / 400, 3), .25);
            dirty = true;
            event.preventDefault();
            event.stopPropagation();
        };
    };
    useEventListener(containers.front, 'wheel', zoomCameraHandler('front'), { passive: false });
    useEventListener(containers.side, 'wheel', zoomCameraHandler('side'), { passive: false });
    useEventListener(containers.top, 'wheel', zoomCameraHandler('top'), { passive: false });

    scene.addEventListener('change', () => { dirty = true; });
    watch(outer, () => { dirty = true; });

    const renderTo = (cameraRef: MaybeRefOrGetter<THREE.Camera | undefined>, container: MaybeRefOrGetter<HTMLDivElement | undefined>) => {
        const dom = toValue(container);
        const camera = toValue(cameraRef);
        if (dom && camera) {
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
        if (dirty && cameras.front.value && cameras.side.value && cameras.top.value) {
            dirty = false;
            renderer.setScissorTest(false);
            renderer.clear();
            renderer.setScissorTest(true);
            renderTo(cameras.front, containers.front);
            renderTo(cameras.side, containers.side);
            renderTo(cameras.top, containers.top);
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
                canvasSize.front.stop();
                canvasSize.side.stop();
                canvasSize.top.stop();
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