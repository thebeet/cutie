import * as THREE from 'three';
import { useAdvanceDrama } from '@cutie/web3d';
import { useRafFn } from '@vueuse/core';
import { computed } from 'vue';

export const useMiddleware = () => {
    const { controls, scene, frames, page, activeFrames } = useAdvanceDrama();

    const maxPointsCounts = Math.max(0, ...page.data.frames.map(f => f.points));

    const activePoints = computed(() => activeFrames.value.reduce(
        (acc, frame) => acc + page.data.frames[frame.index - 1].points, 0));

    const thredhold = 1_000_000;

    const steps = [
        2, 3, 4, 5, 6, 8, 10,
        12, 14, 16, 18, 20,
        25, 30, 35, 40, 45, 50,
    ];
    const sampleAttributes = new Map(steps.map(step => {
        const n = Math.floor(maxPointsCounts / step);
        const arr = new Uint32Array(n);
        for (let i = 0; i < n; i++) {
            arr[i] = i * step;
        }
        return [step, new THREE.BufferAttribute(arr, 1)];
    }));

    scene.addEventListener('downsampling', () => {
        if (activePoints.value <= thredhold) {
            return;
        }
        const t = Math.floor(activePoints.value / thredhold);
        const step = steps.reduce((acc, item) => t <= item ? Math.min(acc, item) : acc, 50);
        const sampleAttribute = sampleAttributes.get(step)!;
        frames.forEach(frame => {
            if (frame.points) {
                const geometry = frame.points.geometry;
                const n = geometry.attributes.position.count;
                geometry.setIndex(sampleAttribute);
                geometry.setDrawRange(0, Math.floor(n / step));
            }
        });
    });
    scene.addEventListener('resetsampling', () => {
        frames.forEach(frame => {
            if (frame.points) {
                const geometry = frame.points.geometry;
                geometry.setIndex(null);
                geometry.setDrawRange(0, Infinity);
            }
        });
    });

    const setPointCloudSampled = (isSampled: boolean) => {
        // @ts-ignore
        scene.dispatchEvent({ 'type': isSampled ? 'downsampling' : 'resetsampling' });
    };
    let sampling = 0;
    controls.domElement.addEventListener('mousedown', () => {
        if (controls.enabled && sampling < 6) {
            sampling = 6;
            setPointCloudSampled(true);
        }
    });
    controls.domElement.addEventListener('mouseup', () => {
        if (controls.enabled && sampling !== 0) {
            sampling = 0;
            setPointCloudSampled(false);
            scene.update();
        }
    });
    controls.addEventListener('change', () => {
        if (sampling < 5) {
            if (sampling === 0) {
                setPointCloudSampled(true);
            }
            sampling = 5;
        }
    });

    useRafFn(() => {
        if ((sampling > 0) && (sampling <= 5)) {
            if (--sampling === 0) {
                setPointCloudSampled(false);
                scene.update();
            }
        }
    });
};