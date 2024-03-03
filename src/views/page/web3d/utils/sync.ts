import { watch, Ref } from 'vue';
import { AElement } from '@web3d/types';
import * as THREE from 'three';
import { TFrame } from '@web3d/three/TFrame';

/**
 * Synchronizes elements with objects in a 3D scene.
 * @template A - The type of the elements.
 * @template T - The type of the objects in the scene.
 * @param {TFrame[]} frames - An array of frames in the scene.
 * @param {Ref<A[]>} elements - A reference to an array of elements to synchronize.
 * @param {Map<string, T>} objs - A map of objects in the scene, with keys as UUIDs and values as objects.
 * @param {function(A): T} create - A function that creates a new object of type T from an element of type A.
 * @returns {object} - An object containing a `stop` function to stop the watch listener.
 */
export const useSync = <A extends AElement, T extends THREE.Object3D & { apply: (t: A) => void, dispose: () => void }>(
    frames: TFrame[], elements: Ref<A[]>, objs: Map<string, T>, create: (a: A) => T) => {
    const stop = watch(elements, (newValue) => {
        if (newValue) {
            const used: Map<string, boolean> = new Map([]);
            for (const key of objs.keys()) {
                used.set(key, false);
            }
            newValue.forEach((element) => {
                const obj = objs.get(element.uuid);
                if (obj) {
                    used.set(element.uuid, true);
                    obj.apply(element);
                } else {
                    const frame = frames[element.frameIndex];
                    const obj = create(element);
                    objs.set(element.uuid, obj);
                    frame.add(obj);
                    frame.update();
                }
            });
            for (const [key, value] of used.entries()) {
                if (!value) {
                    const obj = objs.get(key);
                    if (obj) {
                        const frame = obj.parent as TFrame;
                        obj.removeFromParent();
                        obj.dispose();
                        frame.update();
                        objs.delete(key);
                    }
                }
            }
        }
    });
    return {
        stop
    };
};