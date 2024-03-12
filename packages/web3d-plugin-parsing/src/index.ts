import { watchEffect, h, watch } from 'vue';
import { useDrama, addNodeToContainer, useSync, useSetFocusOnClick } from '@cutie/web3d';
import { useParsingStore } from './stores';
import * as THREE from 'three';
import ToolBox from './components/ToolBox.vue';
import InstanceListView from './components/InstanceListView.vue';

import { rectAction } from './actions/rect';
import { polylineAction } from './actions/polygon';
import { storeToRefs } from 'pinia';
import { useParsingAnswerStore } from './stores/answer';
import { ParsingOperation } from './operations/ParsingOperation';
import { boxAction } from './actions/box';
import { useHotkeys } from './hotkeys';
import { TBox } from './three/TBox';
import { RBox } from './types';

export const usePlugin = () => {
    const {
        scene,
        toolbox, rightsidebar, activeTool, frames, camera,
        applyOperation, onApplyOperation, onAdvanceMouseEvent,
        setupThreeView, onThreeViewChange, onThreeViewConfirm
    } = useDrama();

    const parsingStore = useParsingStore();
    const { tboxes, updateBox } = parsingStore;
    const { instances, boxes, focused, boxParsing } = storeToRefs(parsingStore);
    const { answer } = storeToRefs(useParsingAnswerStore());

    useSync(frames, boxes, tboxes, box => new TBox(box), (box, el) => box.apply(el), box => box.dispose());
    useSetFocusOnClick(focused, tboxes, (box: Readonly<TBox>) => box.element);
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
    });

    useHotkeys();

    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(InstanceListView), rightsidebar);
};
