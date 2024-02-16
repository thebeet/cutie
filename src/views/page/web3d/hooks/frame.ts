import { usePageStore } from '@web3d/stores/page';
import { TFrame } from '@web3d/three/TFrame';
import * as THREE from 'three';
import { shallowRef } from 'vue';

export const useFrame = () => {
    const { page } = usePageStore();
    const frame0 = new TFrame(0);
    frame0.visible = false;
    const frames = [frame0, ...page!.data.frames.map(frameData => {
        const frame = new TFrame(frameData.index);
        frame.visible = false;
        frame.userData['data'] = frameData;
        const position = new THREE.Vector3(frameData.pose[2], frameData.pose[3], frameData.pose[4]);
        const quaternion = new THREE.Quaternion(frameData.pose[5], frameData.pose[6], frameData.pose[7], frameData.pose[8]);
        const matrix4 = new THREE.Matrix4().makeRotationFromQuaternion(quaternion).setPosition(position);
        frame.applyMatrix4(matrix4);
        frame.updateMatrixWorld();
        return frame;
    })];
    const activeFrames = shallowRef<TFrame[]>([]);
    const selectFrame = (id: number | number[]) => {
        for (const frame of frames) {
            frame.visible = false;
        }
        if (id instanceof Array) {
            const ids = id as number[];
            activeFrames.value = ids.map(i => frames[i]);
        } else {
            const frame = frames[id as number];
            frame.visible = true;
            activeFrames.value = [frame];
        }
        activeFrames.value.forEach(f => {
            f.visible = true;
            f.update();
        });
    };
    selectFrame(1);

    return {
        frames, activeFrames,
        selectFrame,
    } as const;
};