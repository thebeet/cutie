import { h, watch } from 'vue';
import ToolBox from './components/ToolBox.vue';
import { useDrama, addNodeToContainer, useSetFocusOnClick, RBox } from '@cutie/web3d';
import { rectAction } from './actions/rect';
import { AddBoxOperation } from './operations/AddBoxOperation';
import { storeToRefs } from 'pinia';
import { useBoxStore } from './stores';
import { ModifyBoxOperation } from './operations/ModifyBoxOperation';
import { useHotkeys } from './hotkeys';
import { TBox } from './three/TBox';
import * as THREE from 'three';

export const usePlugin = () => {
    const { activeTool, toolbox,
        camera, primaryFrame,
        setupThreeView, onThreeViewChange, onThreeViewConfirm,
        onAdvanceMouseEvent,
        applyOperation } = useDrama();
    const boxesStore = useBoxStore();
    const { focused, draft } = storeToRefs(boxesStore);
    const { boxes } = boxesStore;

    useSetFocusOnClick(focused, boxes, (box: Readonly<TBox>) => box.element);
    watch(focused, setupThreeView);

    onThreeViewChange((value: RBox) => {
        if (focused.value) {
            draft.value = {
                ...focused.value,
                ...value
            };
        }
    });
    onThreeViewConfirm((value: RBox) => {
        if (focused.value) {
            const op = new ModifyBoxOperation(focused.value.uuid, value);
            applyOperation(op);
        }
    });

    onAdvanceMouseEvent((event) => {
        if (activeTool.value === 'rect' && event.type === 'rected') {
            if (primaryFrame.value) {
                const results = rectAction(event.points, camera);
                applyOperation(new AddBoxOperation(primaryFrame.value, results, new THREE.Euler(0, 0, camera.rotation.z)));
            }
        }
    });

    useHotkeys();

    addNodeToContainer(h(ToolBox), toolbox);
};