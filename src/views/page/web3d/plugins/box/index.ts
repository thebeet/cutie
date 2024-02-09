import { useDrama } from '@web3d/hooks/drama';
import { h, watch } from 'vue';
import { TCube } from '@web3d/plugins/box/three/TCube';
import ToolBox from './components/ToolBox.vue';
import { addNodeToContainer } from '..';
import { watchPausable } from '@vueuse/core';
import { rectAction } from './actions/rect';
import { AddCubeFromPointsBoundingOperation } from './operations/AddCubeFromPointsBoundingOperation';
import { TFrame } from '@web3d/three/TFrame';
import { storeToRefs } from 'pinia';
import { useRectStore } from './stores';
import * as THREE from 'three';
import { GroupOperation } from '@web3d/operator/Operation';

const watchMouseAction = () => {
    const { camera, mouseEvent, applyOperation } = useDrama();

    return watchPausable(() => ({
        type: mouseEvent.value.type,
        points: mouseEvent.value.points
    }), (value) => {
        if (value.type === 'rected') {
            const results = rectAction(value.points, camera);
            const ops = results.map(([frame, index]) => new AddCubeFromPointsBoundingOperation(frame, index, new THREE.Euler(0, 0, camera.rotation.z)));
            if (ops.length === 1) {
                applyOperation(ops[0]);
            } else {
                applyOperation(new GroupOperation(ops));
            }
        }
    }, { deep: true });
};

export const usePlugin = () => {
    const { frames, activeTool, toolbox, onApplyOperation, threeView } = useDrama();
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

    const { pause, resume } = watchMouseAction();
    watch(activeTool, (value) => {
        value === 'rect' ? resume() : pause();
    });

    onApplyOperation(({ operation }) => {
        if (operation instanceof AddCubeFromPointsBoundingOperation) {
            const o = operation as AddCubeFromPointsBoundingOperation;
            const frame = o.frame;
            threeView.value = { ...o.result };
            const center = new THREE.Vector3(o.result.position.x, o.result.position.y, o.result.position.z).applyMatrix4(frame.matrixWorld);
            threeView.value.position = {
                x: center.x,
                y: center.y,
                z: center.z,
            };
            focused.value = o.result;
        }
    });

    addNodeToContainer(h(ToolBox), toolbox);
};