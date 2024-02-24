import { watch, h } from 'vue';
import { useDrama } from '@web3d/hooks/drama';
import { measure } from '@/stores/performance';
import { useParsingStore } from './stores';
import * as THREE from 'three';
import ToolBox from './components/ToolBox.vue';
import MouseActionDebugView from './components/MouseActionDebugView.vue';
import MouseActionPreview from './components/MouseActionPreview.vue';
import InstanceListView from './components/InstanceListView.vue';
import { addNodeToContainer } from '..';

import { rectAction as _rectAction } from './actions/rect';
import { polylineAction as _polylineAction } from './actions/polygon';
import { storeToRefs } from 'pinia';
import { useParsingAnswerStore } from './stores/answer';
import { ParsingOperation } from './operations/ParsingOperation';
const rectAction = measure('web3d::parsing::rect', _rectAction);
const polylineAction = measure('web3d::parsing::polyline', _polylineAction);

export const usePlugin = () => {
    const { toolbox, container, rightsidebar, activeTool, frames, camera,
        applyOperation, onApplyOperation, onAdvanceMouseEvent } = useDrama();
    const { pointsMaterial } = useParsingStore();
    const { instances } = storeToRefs(useParsingStore());

    const { answer } = storeToRefs(useParsingAnswerStore());

    frames.forEach(frame => {
        frame.onPointsLoaded.then(({ points }) => {
            points.material = pointsMaterial;
            const geometry = points.geometry;
            const label = answer.value.parsing!.frames[frame.index].label;
            geometry.setAttribute('label', new THREE.BufferAttribute(label, 1));
        });
    });
    watch(() => answer.value.parsing?.frames.map(frame => ({
        frame,
        points: frames[frame.index]!.points
    })), (value) => {
        value?.forEach(({ frame, points }) => {
            if (points) {
                const geometry = points.geometry;
                const labelAttribute = geometry.getAttribute('label');
                if (labelAttribute.array !== frame.label) {
                    geometry.setAttribute('label', new THREE.BufferAttribute(frame.label, 1));
                }
            }
        });
    }, { immediate: true });

    onAdvanceMouseEvent((event) => {
        if (activeTool.value === 'parsing') {
            if (event.type === 'rected') {
                const operation = rectAction(event.points, camera);
                if (operation) {
                    applyOperation(operation);
                }
            }
            if (event.type === 'polylined') {
                const operation = polylineAction(event.points, camera);
                if (operation) {
                    applyOperation(operation);
                }
            }
        }
    });

    onApplyOperation(({ operation }) => {
        if (operation instanceof ParsingOperation) {
            (operation as ParsingOperation).effect(instances.value);
        }
    });

    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(MouseActionDebugView), container);
    addNodeToContainer(h(MouseActionPreview), container);
    addNodeToContainer(h(InstanceListView), rightsidebar);
};
