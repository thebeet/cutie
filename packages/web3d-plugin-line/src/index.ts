import { useDrama, addNodeToContainer } from '@cutie/web3d';
import { storeToRefs } from 'pinia';
import { h } from 'vue';
import { useLineStore } from './stores';
import ToolBox from './components/ToolBox.vue';
import { point2dToPoint3d } from './hooks/currentPoint';
import * as THREE from 'three';

export const usePlugin = () => {
    const { camera, primaryFrame, activeTool, toolbox, onAdvanceMouseEvent } = useDrama();
    const lineStore = useLineStore();
    const { lines, draft } = storeToRefs(lineStore);
    const { newElement } = lineStore;

    onAdvanceMouseEvent((event) => {
        if (activeTool.value !== 'line') return;
        if (event.type === 'lining') {
            if (!draft.value) {
                draft.value = newElement();
            }
            const n = event.points.length;
            if (n === 0) return;
            const { x, y } = event.points[n - 1];

            const point = point2dToPoint3d(new THREE.Vector2(x, y), camera, primaryFrame.value);

            draft.value = {
                ...draft.value,
                points: new Float32Array([...draft.value.points.slice(0, (n - 1) * 3), point.x, point.y, point.z]),
            };
        }
    });

    addNodeToContainer(h(ToolBox), toolbox);
};