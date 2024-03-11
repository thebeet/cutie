import { useDrama, addNodeToContainer } from '@cutie/web3d';
import { storeToRefs } from 'pinia';
import { h } from 'vue';
import { useLineStore } from './stores';
import ToolBox from './components/ToolBox.vue';
import { point2dToPoint3d } from './hooks/currentPoint';
import * as THREE from 'three';
import { whenever } from '@vueuse/core';
import { AddLineOperation } from './operations/AddLineOperation';
import { useHotkeys } from './hotkeys';

export const usePlugin = () => {
    const { camera, primaryFrame, activeTool, toolbox,
        applyOperation, onAdvanceMouseEvent } = useDrama();
    const lineStore = useLineStore();
    const { draft } = storeToRefs(lineStore);
    const { newElement } = lineStore;

    whenever(() => activeTool.value !== 'line', () => draft.value = undefined);
    whenever(() => draft.value?.frameIndex !== primaryFrame.value.index, () => draft.value = undefined);

    onAdvanceMouseEvent((event) => {
        if (activeTool.value !== 'line') return;
        if (event.type === 'lining') {
            if (!draft.value) {
                draft.value = newElement();
            }
            const n = event.points.length;
            if (n < 2) return;
            const { x, y } = event.points[n - 1];

            const point = point2dToPoint3d(new THREE.Vector2(x, y), camera, primaryFrame.value);

            draft.value = {
                ...draft.value,
                points: new Float32Array([...draft.value.points.slice(0, (n - 1) * 3), point.x, point.y, point.z]),
            };
        } else if (event.type === 'lined') {
            if (draft.value && draft.value.points.length >= 2) {
                const n = event.points.length;
                const op = new AddLineOperation(primaryFrame.value, {
                    ...draft.value,
                    points: draft.value.points.slice(0, (n - 1) * 3)
                });
                applyOperation(op);
                draft.value = undefined;
            }
        }
    });

    useHotkeys();

    addNodeToContainer(h(ToolBox), toolbox);
};