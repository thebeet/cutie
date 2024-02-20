import { useDrama } from '@web3d/hooks/drama';
import { toRaw, h, watch } from 'vue';
import { TCube } from '@web3d/plugins/box/three/TCube';
import ToolBox from './components/ToolBox.vue';
import InstanceDetail from './components/InstanceDetail.vue';
import { addNodeToContainer } from '..';
import { rectAction } from './actions/rect';
import { AddCubeFromPointsBoundingOperation } from './operations/AddCubeFromPointsBoundingOperation';
import { TFrame } from '@web3d/three/TFrame';
import { storeToRefs } from 'pinia';
import { useRectStore } from './stores';
import * as THREE from 'three';
import { GroupOperation } from '@web3d/operator/Operation';
import { ModifyCubeOperation } from './operations/ModifyCubeOperation';

export const usePlugin = () => {
    const { frames, activeTool, toolbox, rightsidebar,
        threeViewInner, camera,
        onAdvanceMouseEvent,
        applyOperation, onApplyOperation } = useDrama();
    const cubes: Map<string, TCube> = new Map([]);
    const { focused, elements } = storeToRefs(useRectStore());
    watch(elements, (newValue) => {
        if (newValue) {
            const used: Map<string, boolean> = new Map([]);
            for (const key of cubes.keys()) {
                used.set(key, false);
            }
            newValue.forEach((element) => {
                const cube = cubes.get(element.uuid);
                if (cube) {
                    used.set(element.uuid, true);
                    cube.apply(element);
                } else {
                    const frame = frames[element.frameIndex];
                    const cube = new TCube(element);
                    cubes.set(element.uuid, cube);
                    frame!.add(cube);
                    frame.update();
                }
            });
            for (const [key, value] of used.entries()) {
                if (!value) {
                    const cube = cubes.get(key);
                    if (cube) {
                        const frame = cube.parent as TFrame;
                        cube.removeFromParent();
                        cube.dispose();
                        frame.update();
                        cubes.delete(key);
                    }
                }
            }
        }
    });

    watch(threeViewInner, (value, oldValue) => {
        if (focused.value) {
            const op = new ModifyCubeOperation({
                ...toRaw(focused.value),
                ...toRaw(value)
            });
            applyOperation(op, value !== oldValue);

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
            const cube = cubes.get(o.newValue.uuid);
            if (cube) {
                cube.apply(o.newValue);
            }
        }
    });

    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(InstanceDetail), rightsidebar);
};