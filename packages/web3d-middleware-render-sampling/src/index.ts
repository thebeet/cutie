import * as THREE from 'three';
import { useAdvanceDrama } from '@cutie/web3d';
import { useMemoize, useRafFn } from '@vueuse/core';
import { watch, computed, ref } from 'vue';

export const useMiddleware = () => {
    const { controls, scene, frames, page, activeFrames } = useAdvanceDrama();
    const isSampled = ref(false);
    const activePoints = computed(() => activeFrames.value.reduce(
        (acc, frame) => acc + page.data.frames[frame.index - 1].points, 0));
    const thredhold = 1_000_000;
    const getAttrs = useMemoize((step: number) => {
        const arr = new Uint32Array(thredhold);
        for (let i = 0; i < thredhold; i++) {
            arr[i] = i * step;
        }
        return new THREE.BufferAttribute(arr, 1);
    });

    watch(isSampled, (value) => {
        if (value) {
            if (activePoints.value <= thredhold) {
                return;
            }
            const step = Math.ceil(activePoints.value / thredhold);
            const index = getAttrs(step);
            frames.forEach(frame => {
                if (frame.points) {
                    const geometry = frame.points.geometry;
                    const n = geometry.attributes.position.count;
                    geometry.setIndex(index);
                    geometry.setDrawRange(0, Math.floor(n / step));
                }
            });
        } else {
            frames.forEach(frame => {
                if (frame.points) {
                    const geometry = frame.points.geometry;
                    geometry.setIndex(null);
                    geometry.setDrawRange(0, Infinity);
                }
            });
            scene.update();
        }
    });

    let sampling = 0;
    controls.domElement.addEventListener('mousedown', () => {
        sampling = 6;
    });
    controls.domElement.addEventListener('mouseup', () => {
        sampling = 0;
        isSampled.value = false;
    });
    controls.addEventListener('change', () => {
        sampling = Math.max(sampling, 5);
        isSampled.value = true;
    });
    useRafFn(() => {
        if ((sampling > 0) && (sampling <= 5)) {
            if (--sampling === 0) {
                isSampled.value = false;
            }
        }
    });
};