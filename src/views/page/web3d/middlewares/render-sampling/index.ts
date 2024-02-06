import * as THREE from 'three';
import { useAdvanceDrama } from '@web3d/hooks/drama';
import { useRafFn } from '@vueuse/core';

export const useMiddleware = () => {
    const { controls, scene, frames, page } = useAdvanceDrama();

    let pointsCountTotal = 0;
    let maxPointsCounts = 1;
    page.data.frames.forEach((frameData) => {
        pointsCountTotal += frameData.points;
        maxPointsCounts = Math.max(maxPointsCounts, frameData.points);
    });

    const sampleStep = Math.floor(pointsCountTotal / 2_000_000) + 1;
    const thredhold = 500_000;
    const n = Math.floor(maxPointsCounts / sampleStep);
    const indexArr = new Uint32Array(n);
    for (let i = 0; i < n; i++) {
        indexArr[i] = i * sampleStep;
    }
    const indexAttribute = new THREE.BufferAttribute(indexArr, 1);

    scene.addEventListener('downsampling', () => {
        frames.forEach(frame => {
            if (frame.points) {
                const geometry = frame.points.geometry;
                const n = geometry.attributes.position.count;
                if (n > thredhold) {
                    geometry.setIndex(indexAttribute);
                    geometry.setDrawRange(0, Math.floor(n / sampleStep));
                }
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