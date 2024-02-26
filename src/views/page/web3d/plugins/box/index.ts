import { useDrama } from '@web3d/hooks/drama';
import { toRaw, h, watch } from 'vue';
import { TBox } from '@web3d/plugins/box/three/TCube';
import ToolBox from './components/ToolBox.vue';
import InstanceDetail from './components/InstanceDetail.vue';
import { addNodeToContainer } from '..';
import { rectAction } from './actions/rect';
import { AddCubeFromPointsBoundingOperation } from './operations/AddCubeFromPointsBoundingOperation';
import { storeToRefs } from 'pinia';
import { useBoxStore } from './stores';
import * as THREE from 'three';
import { GroupOperation } from '@web3d/operator/Operation';
import { ModifyCubeOperation } from './operations/ModifyCubeOperation';
import { klona } from 'klona';
import { useHotkeys } from './hotkeys';

export const usePlugin = () => {
    const { activeTool, toolbox, rightsidebar,
        threeViewInner, camera,
        onAdvanceMouseEvent,
        applyOperation, onApplyOperation } = useDrama();
    const boxesStore = useBoxStore();
    const { focused } = storeToRefs(boxesStore);
    const { boxes } = boxesStore;

    watch(threeViewInner, (value) => {
        if (focused.value) {
            const op = new ModifyCubeOperation({
                ...toRaw(focused.value),
                ...toRaw(value)
            });
            applyOperation(op, false);
        }
    }, { deep: true });

    onAdvanceMouseEvent((event) => {
        if (activeTool.value === 'rect' && event.type === 'rected') {
            const results = rectAction(event.points, camera);
            const ops = results.map(([frame, index]) => new AddCubeFromPointsBoundingOperation(frame, index, new THREE.Euler(0, 0, camera.rotation.z)));
            if (ops.length === 1) {
                applyOperation(ops[0]);
            } else {
                applyOperation(new GroupOperation(ops));
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
                threeViewInner.value = klona(cube.box);
                focused.value = cube.box;
            } else {
                focused.value = undefined;
            }
        }
    });

    watch(focused, (value, oldValue) => {
        if (value && oldValue && value.uuid === oldValue.uuid) {
            return;
        }
        if (oldValue) {
            const cube = boxes.get(oldValue.uuid);
            cube?.dispatchEvent({ type: 'blur' });
        }
        if (value) {
            const cube = boxes.get(value.uuid);
            cube?.dispatchEvent({ type: 'focus' });
        } else {
            threeViewInner.value = undefined;
        }
    });

    onApplyOperation(({ operation }) => {
        if (operation instanceof AddCubeFromPointsBoundingOperation) {
            const o = operation as AddCubeFromPointsBoundingOperation;
            const frame = o.frame;
            const center = new THREE.Vector3(o.result.position.x, o.result.position.y, o.result.position.z).applyMatrix4(frame.matrixWorld);
            threeViewInner.value = {
                ...o.result,
                position: {
                    x: center.x,
                    y: center.y,
                    z: center.z,
                },
            };
            focused.value = o.result;
        }
        if (operation instanceof ModifyCubeOperation) {
            const o = operation as ModifyCubeOperation;
            const cube = boxes.get(o.newValue.uuid);
            if (cube) {
                cube.apply(o.newValue);
            }
        }
    });

    useHotkeys();

    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(InstanceDetail), rightsidebar);
};