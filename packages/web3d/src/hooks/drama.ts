import { ref, watchEffect, MaybeRefOrGetter } from 'vue';
import { AnswerContent, Frame } from '../types';
import { useScene } from './scene';
import { usePCDCachedLoader } from './loader';
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
import { useAnswerStore } from '../stores/answer';
import { useMouse } from './mouse';
import { storeToRefs } from 'pinia';
import { usePageStore } from '../stores/page';
import { useFrame } from './frame';
import { useThreeView } from './threeview';
import { useShader } from './shader';

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
    const { controls, scene, renderer, camera, controlMode, transform } = useScene(container);

    const { page } = usePageStore();
    const { frames, primaryFrame, activeFrames, selectFrame } = useFrame(scene);

    const answerStore = useAnswerStore();
    const { answer } = storeToRefs(answerStore);
    const { setupAnswer, applyOperation, onApplyOperation, useSetupAnswer } = answerStore;

    const {
        setup: setupThreeView,
        onSetup: onThreeViewSetup, onChange: onThreeViewChange, onConfirm: onThreeViewConfirm,
        confirmEvent: threeViewConfirmEventHook, changeEvent: threeViewChangeEventHook
    } = useThreeView();

    const { mode: shaderMode, material } = useShader();

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

    const { mouseEvent, state: mouseState, eventHook: mouseEventHook } = useMouse();
    const activeTool = ref('');

    const focusedUUID = ref<string>();

    watchEffect(() => {
        controls.enableRotate = mouseState.value === 'free';
    });

    return {
        normal: {
            container: container as MaybeRefOrGetter<HTMLDivElement>,
            toolbox: toolbox as MaybeRefOrGetter<HTMLDivElement>,
            footer: footer as MaybeRefOrGetter<HTMLDivElement>,
            rightsidebar: rightsidebar as MaybeRefOrGetter<HTMLDivElement>,
            mouseEvent, mouseState, onAdvanceMouseEvent: mouseEventHook.on,
            frames, primaryFrame, activeFrames, selectFrame,
            activeTool, focusedUUID,
            page, answer, applyOperation, onApplyOperation,
            scene, camera,
            shaderMode, material,

            transform,

            launch,
            setupThreeView, onThreeViewSetup, onThreeViewChange, onThreeViewConfirm
        } as const,

        advance: {
            controls, renderer, controlMode, mouseEventHook,
            threeViewConfirmEventHook, threeViewChangeEventHook,
            useSetupAnswer,
        } as const
    } as const;
};
