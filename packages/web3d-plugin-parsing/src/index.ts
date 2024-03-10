import { watchEffect, h, watch } from 'vue';
import { useDrama } from '@cutie/web3d';
import { useParsingStore } from './stores';
import * as THREE from 'three';
import ToolBox from './components/ToolBox.vue';
import MouseActionDebugView from './components/MouseActionDebugView.vue';
import MouseActionPreview from './components/MouseActionPreview.vue';
import InstanceListView from './components/InstanceListView.vue';
import { addNodeToContainer } from '@cutie/web3d';

import { rectAction } from './actions/rect';
import { polylineAction } from './actions/polygon';
import { storeToRefs } from 'pinia';
import { useParsingAnswerStore } from './stores/answer';
import { ParsingOperation } from './operations/ParsingOperation';
import { GroupOperation } from '@cutie/web3d';
import { boxAction } from './actions/box';
import { useHotkeys } from './hotkeys';
import { useSync } from '@cutie/web3d';
import { useSetFocusOnClick } from '@cutie/web3d';
import { TBox } from './three/TBox';
import { RBox } from './types';

export const usePlugin = () => {
    const {
        scene,
        toolbox, container, rightsidebar, activeTool, frames, camera,
        applyOperation, onApplyOperation, onAdvanceMouseEvent,
        setupThreeView, onThreeViewChange, onThreeViewConfirm
    } = useDrama();

    const parsingStore = useParsingStore();
    const { pointsMaterial, tboxes, updateBox } = parsingStore;
    const { instances, boxes, focused, boxParsing } = storeToRefs(parsingStore);
    const { answer } = storeToRefs(useParsingAnswerStore());

    useSync(frames, boxes, tboxes, box => new TBox(box), (box, el) => box.apply(el), box => box.dispose());
    useSetFocusOnClick(focused, tboxes, (box: Readonly<TBox>) => box.box);
    watch(focused, setupThreeView);

    const onThreeViewModify = (value: RBox & { uuid: string }) => {
        if (focused.value?.uuid === value.uuid) {
            updateBox(value);
        }
    };
    onThreeViewChange(onThreeViewModify);
    onThreeViewConfirm(onThreeViewModify);

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
                    scene.update();
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
