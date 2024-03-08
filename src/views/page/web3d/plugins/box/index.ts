import { useDrama } from '@web3d/hooks/drama';
import { h } from 'vue';
import ToolBox from './components/ToolBox.vue';
import InstanceDetail from './components/InstanceDetail.vue';
import { addNodeToContainer } from '..';
import { rectAction } from './actions/rect';
import { AddBoxOperation } from './operations/AddBoxOperation';
import { storeToRefs } from 'pinia';
import { useBoxStore } from './stores';
import { ModifyBoxOperation } from './operations/ModifyBoxOperation';
import { useHotkeys } from './hotkeys';
import { useSync } from '@web3d/utils/sync';
import { useSetFocusOnClick, useSetThreeViewOnFocus } from '@web3d/utils/focus';
import { RBox } from '../../types';
import { TBox } from './three/TBox';

export const usePlugin = () => {
    const { activeTool, toolbox, rightsidebar,
        frames, camera, primaryFrame,
        onThreeViewChange, onThreeViewConfirm,
        onAdvanceMouseEvent,
        applyOperation } = useDrama();
    const boxesStore = useBoxStore();
    const { elements, focused } = storeToRefs(boxesStore);
    const { boxes } = boxesStore;

    useSync(frames, elements, boxes, el => new TBox(el));
    useSetFocusOnClick(focused, boxes, (box: Readonly<TBox>) => box.box);
    useSetThreeViewOnFocus(focused);

    const onThreeViewModify = (isConfirm: boolean) => (value: RBox) => {
        if (focused.value && value) {
            const op = new ModifyBoxOperation(focused.value.uuid, value);
            applyOperation(op, isConfirm);
        }
    };
    onThreeViewChange(onThreeViewModify(false));
    onThreeViewConfirm(onThreeViewModify(true));

    onAdvanceMouseEvent((event) => {
        if (activeTool.value === 'rect' && event.type === 'rected') {
            if (primaryFrame.value) {
                const results = rectAction(event.points, camera);
                applyOperation(new AddBoxOperation(primaryFrame.value, results, camera.rotation));
            }
        }
    });

    useHotkeys();

    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(InstanceDetail), rightsidebar);
};