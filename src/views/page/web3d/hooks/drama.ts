import { ref, watchEffect, MaybeRefOrGetter } from 'vue';
import { Annotation, AnswerContent, Operation, RBox } from '@web3d/types';
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
export const useDrama = (container?: MaybeRefOrGetter<HTMLDivElement | undefined>,
    toolbox?: MaybeRefOrGetter<HTMLDivElement | undefined>,
    footer?: MaybeRefOrGetter<HTMLDivElement | undefined>,
    rightsidebar?: MaybeRefOrGetter<HTMLDivElement | undefined>) => {

    if (defaultDrama === undefined) {
        if (container === undefined) {
            throw new Error('drama not setup');
        } else {
            defaultDrama = setupDrama(container, toolbox, footer, rightsidebar);
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

export const setupDrama = (container: MaybeRefOrGetter<HTMLDivElement | undefined>,
    toolbox: MaybeRefOrGetter<HTMLDivElement | undefined>,
    footer: MaybeRefOrGetter<HTMLDivElement | undefined>,
    rightsidebar?: MaybeRefOrGetter<HTMLDivElement | undefined>) => {
    const { controls, scene, renderer, camera, controlMode } = useScene(container);

    const { page } = usePageStore();
    const { frames, activeFrames, selectFrame } = useFrame();
    frames.forEach(frame => {
        scene.add(frame);
    });

    const answerStore = useAnswerStore();
    const { answer } = storeToRefs(answerStore);
    const { setupAnswer, applyOperation, onApplyOperation } = answerStore;

    const threeView = ref<{
        inner?: RBox
        outer?: RBox
    }>({});

    const launch = async () => {
        const tAnswer: AnswerContent = {
            elements: []
        };
        await setupAnswer(tAnswer);
        frames.forEach(frame => {
            if (frame.index === 0) {
                return;
            }
            const url = (frame.userData['data'] as Frame).url;
            loader.load(url).then((obj) => {
                frame.points = obj;
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
            container, toolbox, footer, rightsidebar,
            mouseEvent, mouseState, onAdvanceMouseEvent,
            frames, activeFrames, selectFrame,
            activeTool,
            page,
            answer, applyOperation, onApplyOperation,
            annotations,
            operations,
            camera: camera,
            scene: scene,

            launch,
            threeView,
        },

        advance: {
            controls, renderer, controlMode,
        }
    };
};
