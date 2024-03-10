import { watch, Ref, computed, nextTick } from 'vue';
import { AElement } from '../types';
import * as THREE from 'three';
import { useDrama } from '../hooks/drama';

export interface TFocusableEventMap extends THREE.Object3DEventMap {
    focus: {}
    blur: {}
}

/**
 * Custom hook for managing focus on elements.
 * @template A - Type of the answer element
 * @template T - Type of the threejs object
 * @param {Ref<A[]>} elements - Ref to the array of elements in answer
 * @param {Map<string, T>} objs - Map of threejs objects
 * @returns {Object} - Object containing the focused element and a function to stop watching focus changes.
 * @property {ComputedRef<A | undefined>} focused - Computed property representing the currently focused element.
 * @property {WatchStopHandle} stop - Function to stop watching focus changes.
 */
export const useFocus = <A extends AElement, T extends THREE.Object3D<TFocusableEventMap>>(
    elements: Ref<A[]>, objs: Map<string, T>) => {

    const { focusedUUID } = useDrama();
    const focused = computed({
        get: () => elements.value.find(item => item.uuid === focusedUUID.value),
        set: (v) => focusedUUID.value = v?.uuid
    });

    const stop = watch(focused, (value, oldValue) => {
        if (value?.uuid !== oldValue?.uuid) {
            if (oldValue) {
                const cube = objs.get(oldValue.uuid);
                cube?.dispatchEvent({ type: 'blur' });
            }
            if (value) {
                const cube = objs.get(value.uuid);
                cube?.dispatchEvent({ type: 'focus' });
            }
        }
    });

    return {
        focused,
        stop
    };
};

const candidates: {
    obj: AElement
    distance: number
}[] = [];

export const useSetFocusOnClick = <A extends AElement, T extends THREE.Object3D<TFocusableEventMap>>
    (focused: Ref<AElement | undefined>, objs: Map<string, T>, obj2element: (t: T) => A) => {
    const { onAdvanceMouseEvent, camera } = useDrama();

    const { off: stop } = onAdvanceMouseEvent((event) => {
        if (event.type === 'click') {
            const { x, y } = event.points[0];
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(
                new THREE.Vector2(x, y),
                camera
            );
            const items = Array.from(objs, (entry) => {
                return entry[1];
            }).filter(item => item.visible && item.parent?.visible);
            const result = raycaster.intersectObjects(items, false);
            if (result.length > 0) {
                let intersect = result[0];
                for (let i = 1; i < result.length; ++i) {
                    if (intersect.distance > result[i].distance) {
                        intersect = result[i];
                    }
                }
                const obj = intersect.object as T;
                candidates.push({
                    obj: obj2element(obj),
                    distance: intersect.distance
                });
                const focusTarget = obj2element(obj);

                nextTick(() => {
                    if (candidates.length > 0) {
                        let candidate = candidates[0];
                        for (let i = 1; i < candidates.length; ++i) {
                            if (candidates[i].distance < candidate.distance) {
                                candidate = candidates[i];
                            }
                        }
                        if (candidate.obj === focusTarget) {
                            focused.value = focusTarget;
                        } else {
                            focused.value = undefined;
                        }

                        nextTick(() => {
                            candidates.splice(0, candidates.length);
                        });
                    }
                });
            } else {
                focused.value = undefined;
            }
        }
    });
    return {
        stop
    } as const;
};
