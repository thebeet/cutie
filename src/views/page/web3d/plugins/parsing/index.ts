import { watchEffect, h } from 'vue';
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
import { GroupOperation } from '../../operator/Operation';
import { boxAction } from './actions/box';
import { useHotkeys } from './hotkeys';
import { useSync } from '@web3d/utils/sync';
import { useSetFocusOnClick } from '@web3d/utils/focus';
import { TBox } from './three/TBox';

const rectAction = measure('web3d::parsing::rect', _rectAction);
const polylineAction = measure('web3d::parsing::polyline', _polylineAction);

export const usePlugin = () => {
    const {
        toolbox, container, rightsidebar, activeTool, frames, camera,
        applyOperation, onApplyOperation, onAdvanceMouseEvent,
    } = useDrama();

    const parsingStore = useParsingStore();
    const { pointsMaterial, tboxes } = parsingStore;
    const { instances, boxes, focused, boxParsing } = storeToRefs(parsingStore);
    const { answer } = storeToRefs(useParsingAnswerStore());

    useSync(frames, boxes, tboxes, box => new TBox(box));
    useSetFocusOnClick(focused, tboxes, (box: Readonly<TBox>) => box.box);

    frames.forEach(frame => {
        frame.onPointsLoaded.then(({ points }) => {
            points.material = pointsMaterial;
            const geometry = points.geometry;
            const label = answer.value.parsing!.frames[frame.index].label;
            geometry.setAttribute('label', new THREE.BufferAttribute(label, 1));
        });
    });
    watchEffect(() => {
        answer.value.parsing?.frames.forEach((frame) => {
            const points = frames[frame.index]!.points;
            if (points) {
                const geometry = points.geometry;
                const labelAttribute = geometry.getAttribute('label');
                if (labelAttribute.array !== frame.label) {
                    geometry.setAttribute('label', new THREE.BufferAttribute(frame.label, 1));
                }
            }
        });
    });

    onAdvanceMouseEvent((event) => {
        if (activeTool.value === 'parsing') {
            if (event.type === 'rected') {
                if (boxParsing.value) {
                    const newBox = boxAction(event.points, camera);
                    if (newBox) {
                        boxes.value = [...boxes.value, newBox];
                    }
                    return;
                }
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
        if (operation instanceof GroupOperation) {
            (operation as GroupOperation).forEach((op) => (op as ParsingOperation).effect(instances.value));
        }
    });

    useHotkeys();

    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(MouseActionDebugView), container);
    addNodeToContainer(h(MouseActionPreview), container);
    addNodeToContainer(h(InstanceListView), rightsidebar);
};
