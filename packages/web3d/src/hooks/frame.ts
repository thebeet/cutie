import { Page } from '../types';
import { TFrame } from '../three/TFrame';
import * as THREE from 'three';
import { shallowRef } from 'vue';

export const useFrame = (page: Page, scene: THREE.Scene) => {
    const frame0 = new TFrame(0, 0);
    frame0.visible = true;
    const frames: readonly TFrame[] = [frame0, ...page!.data.frames.map(frameData => {
        const frame = new TFrame(frameData.index, frameData.timestamp);
        frame.visible = false;
        frame.userData['data'] = frameData;
        const position = new THREE.Vector3(frameData.pose[2], frameData.pose[3], frameData.pose[4]);
        const quaternion = new THREE.Quaternion(frameData.pose[5], frameData.pose[6], frameData.pose[7], frameData.pose[8]);
        const matrix4 = new THREE.Matrix4().makeRotationFromQuaternion(quaternion).setPosition(position);
        frame.local.applyMatrix4(matrix4);
        frame.local.updateMatrixWorld();
        return frame;
    })];
    frames.forEach(frame => scene.add(frame));
    const activeFrames = shallowRef<readonly TFrame[]>([]);
    const primaryFrame = shallowRef<TFrame>(frame0);
    const selectFrame = (id: number | number[]) => {
        for (let i = 1; i < frames.length; i++) {
            frames[i].visible = false;
        }
        if (id instanceof Array) {
            const ids = id as number[];
            activeFrames.value = ids.map(i => frames[i]);
            primaryFrame.value = ids.length > 0 ? frames[ids[0]] : frames[0];
        } else {
            const frame = frames[id as number];
            primaryFrame.value = frame;
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
        frames, activeFrames, primaryFrame,
        selectFrame,
    } as const;
};