import { ref, watchEffect, MaybeRefOrGetter } from 'vue';
import { Annotation, Operation } from '../types';
import { useScene } from '@web3d/hooks/scene';
import { usePCDCachedLoader } from '@web3d/hooks/loader';
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
import { useAnswerStore } from '@web3d/stores/answer';
import { useMouseEvent } from '@web3d/hooks/mouse';
import { storeToRefs } from 'pinia';
import { usePageStore } from '@web3d/stores/page';
import { Frame } from '@web3d/types';
import { useFrame } from './frame';

const loader = usePCDCachedLoader(new PCDLoader());

export type Drama = ReturnType<typeof setupDrama>;
let defaultDrama: Drama;
export const useDrama = (container?: MaybeRefOrGetter<HTMLDivElement | undefined>, toolbox?: MaybeRefOrGetter<HTMLDivElement | undefined>, rightsidebar?: MaybeRefOrGetter<HTMLDivElement | undefined>) => {
    if (defaultDrama === undefined) {
        if (container === undefined) {
            throw new Error('drama not setup');
        } else {
            defaultDrama = setupDrama(container, toolbox, rightsidebar);
        }
    }
    return defaultDrama.normal;
};

export const useAdvanceDrama = () => {
    return {
        ...defaultDrama.normal,
        ...defaultDrama.advance
    }!;
};

const setupDrama = (container: MaybeRefOrGetter<HTMLDivElement | undefined>, toolbox: MaybeRefOrGetter<HTMLDivElement | undefined>, rightsidebar?: MaybeRefOrGetter<HTMLDivElement | undefined>) => {
    const { controls, scene, renderer, camera, scene2 } = useScene(container);

    const { page } = usePageStore();
    const { frames, activeFrames, selectFrame } = useFrame();
    frames.forEach(frame => scene.add(frame));

    const answerStore = useAnswerStore();
    const { answer, canUndo, canRedo } = storeToRefs(answerStore);
    const { applyOperation, undo, redo } = answerStore;

    const launch = () => {
        frames.forEach(frame => {
            if (frame.index === 0) {
                return;
            }
            const url = (frame.userData['data'] as Frame).url;
            loader.load(url).then((obj) => {
                frame.points = obj;
                scene.update();
            });
        });
    };

    const { mouseEvent, state: mouseState, onAdvanceMouseEvent } = useMouseEvent(container);
    const activeTool = ref('');
    const annotations = ref<Annotation<any>[]>([]);
    const operations = ref<Operation<any>[]>([]);

    watchEffect(() => {
        controls.enabled = mouseState.value === 'free';
    });
    return {
        normal: {
            container, toolbox, rightsidebar,
            mouseEvent, mouseState, onAdvanceMouseEvent,
            frames, activeFrames, selectFrame,
            activeTool,
            page,
            answer, applyOperation, undo, redo, canUndo, canRedo,
            annotations,
            operations,
            camera: camera,
            scene: scene,
            scene2: scene2,

            launch,
        },

        advance: {
            controls, renderer,
        }
    };
};
