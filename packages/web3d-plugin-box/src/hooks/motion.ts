import { Ref, shallowRef, watch } from 'vue';
import * as THREE from 'three';
import { AElement, TFrame, useDrama } from '@cutie/web3d';

type TracedAElement = AElement & {
    readonly traceId: string;
    readonly position: {
        readonly x: number;
        readonly y: number;
        readonly z: number;
    }
};
type Motion = {
    readonly speed: THREE.Vector3;
    readonly acceleration: THREE.Vector3;
};

export const useMotions = <T extends TracedAElement>(elements: Ref<T[]>) => {
    const { frames } = useDrama();
    type ELE = T & { motion: Motion };
    const elementsWithMotion = shallowRef<ELE[]>([]);
    watch(elements, (value) => {
        const result = new Map<string, TracedAElement[]>([]);
        value.forEach(el => {
            if (result.has(el.traceId)) {
                const arr = result.get(el.traceId);
                arr?.push(el);
            } else {
                result.set(el.traceId, [el]);
            }
        });
        const results: (readonly [string, Motion])[] = [];
        for (const [, value] of result) {
            if (value.length > 1) {
                value.sort((a, b) => a.frameIndex - b.frameIndex);
                results.push(...calculateMotion(value, frames));
            } else {
                results.push([value[0].uuid, {
                    speed: new THREE.Vector3(0, 0, 0),
                    acceleration: new THREE.Vector3(0, 0, 0)
                }]);
            }
        }

        const motions = new Map(results);
        elementsWithMotion.value = elements.value.map(el => ({
            ...el,
            motion: motions.get(el.uuid)!
        }));
    });
    return {
        elementsWithMotion
    };
};

const calculateMotion = (sortedElements: readonly TracedAElement[], frames: readonly TFrame[]) => {
    const itemSpeed = sortedElements.map((el, index, arr) => {
        const prevId = Math.max(index - 1, 0);
        const nextId = Math.min(index + 1, arr.length - 1);
        const [prev, next] = [arr[prevId], arr[nextId]];
        const timeDelta = frames[next.frameIndex].timestamp - frames[prev.frameIndex].timestamp;

        return [el.uuid, new THREE.Vector3(
            next.position.x - prev.position.x,
            next.position.y - prev.position.y,
            next.position.z - prev.position.z
        ).multiplyScalar(1 / timeDelta)] as const;
    });
    return itemSpeed.map(([uuid, speed], index, arr) => {
        const prevId = Math.max(index - 1, 0);
        const nextId = Math.min(index + 1, arr.length - 1);
        const [prev, next] = [arr[prevId][1], arr[nextId][1]];
        const timeDelta = frames[sortedElements[nextId].frameIndex].timestamp - frames[sortedElements[prevId].frameIndex].timestamp;
        return [uuid, {
            speed,
            acceleration: new THREE.Vector3(
                next.x - prev.x,
                next.y - prev.y,
                next.z - prev.z
            ).multiplyScalar(1 / timeDelta)
        }] as const;
    });
};