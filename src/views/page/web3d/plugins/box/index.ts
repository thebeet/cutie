import { useDrama } from '@web3d/hooks/drama';
import { h, watch } from 'vue';
import { TBox } from '@web3d/plugins/box/three/TBox';
import ToolBox from './components/ToolBox.vue';
import InstanceDetail from './components/InstanceDetail.vue';
import { addNodeToContainer } from '..';
import { rectAction } from './actions/rect';
import { AddBoxOperation } from './operations/AddBoxOperation';
import { storeToRefs } from 'pinia';
import { useBoxStore } from './stores';
import * as THREE from 'three';
import { ModifyBoxOperation } from './operations/ModifyBoxOperation';
import { useHotkeys } from './hotkeys';
import { RBox } from '../../types';

export const usePlugin = () => {
    const { activeTool, toolbox, rightsidebar,
        camera, primaryFrame,
        setupThreeView, onThreeViewChange, onThreeViewConfirm,
        onAdvanceMouseEvent,
        applyOperation, onApplyOperation } = useDrama();
    const boxesStore = useBoxStore();
    const { focused } = storeToRefs(boxesStore);
    const { boxes } = boxesStore;

    const onThreeViewModify = (isConfirm: boolean) => (value: RBox) => {
        if (focused.value && value) {
            const op = new ModifyBoxOperation(focused.value.uuid, value);
            applyOperation(op, isConfirm);
        }
    };
    onThreeViewChange(onThreeViewModify(false));
    onThreeViewConfirm(onThreeViewModify(true));

    watch(() => focused.value?.uuid, () => {
        if (focused.value) {
            setupThreeView({ position: focused.value.position, rotation: focused.value.rotation, size: focused.value.size });
        } else {
            setupThreeView();
        }
    });

    onAdvanceMouseEvent((event) => {
        if (activeTool.value === 'rect' && event.type === 'rected') {
            if (primaryFrame.value) {
                const results = rectAction(event.points, camera);
                applyOperation(new AddBoxOperation(primaryFrame.value, results, camera.rotation));
            }
        }
        if (event.type === 'click') {
            const { x, y } = event.points[0];
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(
                new THREE.Vector2(x, y),
                camera
            );
            const items = Array.from(boxes, (entry) => {
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
                const cube = intersect.object as TBox;
                focused.value = cube.box;
            } else {
                focused.value = undefined;
            }
        }
    });

    onApplyOperation(({ operation }) => {
        if (operation instanceof AddBoxOperation) {
            const o = operation as AddBoxOperation;
            focused.value = o.result;
        }
    });

    useHotkeys();

    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(InstanceDetail), rightsidebar);
};