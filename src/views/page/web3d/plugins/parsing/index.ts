import { watch, h, Ref } from 'vue';
import { useDrama } from '@web3d/hooks/drama';
import { watchPausable } from '@vueuse/core';
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
import { capsuleAction as _capsuleAction } from './actions/capsule';
import { AnswerContent } from './types';
const rectAction = measure('web3d::parsing::rect', _rectAction);
const polylineAction = measure('web3d::parsing::polyline', _polylineAction);
const capsuleActionBrushing = measure('web3d::parsing::brushing', _capsuleAction);
const capsuleActionBrushed = measure('web3d::parsing::brushed', _capsuleAction);

const watchMouseAction = () => {
    const { camera, applyOperation, mouseEvent } = useDrama();

    return watchPausable(() => ({
        type: mouseEvent.value.type,
        points: mouseEvent.value.points
    }), (value) => {
        if (value.type === 'rected') {
            const operation = rectAction(value.points, camera);
            if (operation) {
                applyOperation(operation);
            }
        }
        if (value.type === 'polylined') {
            const operation = polylineAction(value.points, camera);
            if (operation) {
                applyOperation(operation);
            }
        }
        if (value.type === 'brushing') {
            if (value.points.length > 1) {
                const operation = capsuleActionBrushing(value.points, camera);
                if (operation) {
                    applyOperation(operation, false);
                }
            }
        }
        if (value.type === 'brushed') {
            if (value.points.length > 1) {
                const operation = capsuleActionBrushed(value.points, camera);
                if (operation) {
                    applyOperation(operation);
                }
            }
        }
    }, { deep: true });
};

export const usePlugin = () => {
    const { toolbox, container, rightsidebar, activeTool, frames, answer: _answer } = useDrama();
    const { pointsMaterial } = useParsingStore();

    const answer = _answer as Ref<AnswerContent>;

    frames.forEach(frame => {
        frame.onPointsLoaded.then(({ points }) => {
            points.material = pointsMaterial;
            const geometry = points.geometry;
            const label = answer.value.parsing!.frames[frame.index].label;
            geometry.setAttribute('label', new THREE.BufferAttribute(label, 1));
        });
    });
    watch(() => answer.value.parsing!.frames.map(frame => ({
        frame,
        points: frames[frame.index]!.points
    })), (value) => {
        value.forEach(({ frame, points }) => {
            if (points) {
                const geometry = points.geometry;
                const labelAttribute = geometry.getAttribute('label');
                if (labelAttribute.array !== frame.label) {
                    geometry.setAttribute('label', new THREE.BufferAttribute(frame.label, 1));
                }
            }
        });
    }, { immediate: true });

    const { pause, resume } = watchMouseAction();
    watch(activeTool, (value) => {
        value === 'parsing' ? resume() : pause();
    });

    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(MouseActionDebugView), container);
    addNodeToContainer(h(MouseActionPreview), container);
    addNodeToContainer(h(InstanceListView), rightsidebar);
};
