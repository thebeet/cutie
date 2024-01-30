import { useDrama } from '@web3d/hooks/drama';
import { h, watch } from 'vue';
import { TCube } from '@web3d/plugins/rect/three/TCube';
import ToolBox from './components/ToolBox.vue';
import { addNodeToContainer } from '..';
import { watchPausable } from '@vueuse/core';
import { rectAction } from './actions/rect';
import { AddCubeFromPointsBoundingOperation } from './operations/AddCubeFromPointsBoundingOperation';
import { Cube } from './types';
import { TFrame } from '../../three/TFrame';

const watchMouseAction = () => {
    const { camera, mouseEvent, applyOperation } = useDrama();

    return watchPausable(() => ({
        type: mouseEvent.value.type,
        points: mouseEvent.value.points
    }), (value) => {
        if (value.type === 'rected') {
            const results = rectAction(value.points, camera);
            results.forEach(([frame, index]) => {
                const op = new AddCubeFromPointsBoundingOperation(frame, index);
                applyOperation(op);
            });
        }
    }, { deep: true });
};

export const usePlugin = () => {
    const { frames, activeTool, toolbox, answer } = useDrama();
    const cubes: Map<string, TCube> = new Map([]);
    watch(() => answer.value.elements.filter(e => e.schema === 'cube'), (newValue) => {
        if (newValue) {
            const used: Map<string, boolean> = new Map([]);
            for (const key of cubes.keys()) {
                used.set(key, false);
            }
            newValue.forEach((element) => {
                const cube = cubes.get(element.uuid);
                if (cube) {
                    used.set(element.uuid, true);
                    //cube.apply(element); modify
                } else {
                    const frame = frames[element.frameIndex];
                    const cube = new TCube(element as Cube);
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
    }, { immediate: true });

    const { pause, resume } = watchMouseAction();
    watch(activeTool, (value) => {
        value === 'rect' ? resume() : pause();
    });

    addNodeToContainer(h(ToolBox), toolbox);
};