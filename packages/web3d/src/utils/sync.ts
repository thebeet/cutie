import { watch, Ref, ref } from 'vue';
import { AElement } from '../types';
import * as THREE from 'three';
import { TFrame } from '../three/TFrame';

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
export const useSync = <A extends AElement, T extends THREE.Object3D>(
    frames: readonly TFrame[],
    elements: Ref<A[]>,
    objs: Map<string, T>,
    create: (a: A) => T,
    modify: (t: T, a: A) => void,
    dispose: (t: T) => void = () => {}
) => {
    const draft = ref<A>();
    const stop = watch([elements, draft], ([newValue, newDraft]) => {
        const used: Map<string, boolean> = new Map([]);
        for (const key of objs.keys()) {
            used.set(key, false);
        }
        newValue.forEach((element) => {
            const obj = objs.get(element.uuid);
            if (obj) {
                used.set(element.uuid, true);
                modify(obj, element);
                const frame = obj.parent as TFrame;
                frame.update();
            } else {
                const frame = frames[element.frameIndex];
                const obj = create(element);
                objs.set(element.uuid, obj);
                frame.add(obj);
                frame.update();
            }
        });
        if (newDraft) {
            const obj = objs.get(newDraft.uuid);
            if (obj) {
                used.set(newDraft.uuid, true);
                const frame = obj.parent as TFrame;
                modify(obj, newDraft);
                frame.update();
            } else {
                const frame = frames[newDraft.frameIndex];
                const obj = create(newDraft);
                objs.set(newDraft.uuid, obj);
                frame.add(obj);
                frame.update();
            }
        }
        for (const [key, value] of used.entries()) {
            if (!value) {
                const obj = objs.get(key);
                if (obj) {
                    const frame = obj.parent as TFrame;
                    obj.removeFromParent();
                    dispose(obj);
                    frame.update();
                    objs.delete(key);
                }
            }
        }
    }, { immediate: true });
    return {
        draft,
        stop
    } as const;
};