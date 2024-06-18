import { MaybeRefOrGetter, readonly, ref, shallowRef, watchEffect } from 'vue';
import { Page } from '../types';
import { useScene } from './scene';
import { useAnswerStore } from '../stores/answer';
import { useMouse } from './mouse';
import { storeToRefs } from 'pinia';
import { usePageStore } from '../stores/page';
import { useFrame } from './frame';
import { useThreeView } from './threeview';
import { useShader } from './shader';
import * as THREE from 'three';

export type Drama = ReturnType<typeof setupDrama>;
let defaultDrama: Drama;
export const useDrama = (
    page?: Page,
    container?: MaybeRefOrGetter<HTMLDivElement | undefined>,
    toolbox?: MaybeRefOrGetter<HTMLDivElement | undefined>,
    footer?: MaybeRefOrGetter<HTMLDivElement | undefined>,
    rightsidebar?: MaybeRefOrGetter<HTMLDivElement | undefined>) => {

    if (defaultDrama === undefined) {
        if (container === undefined) {
            throw new Error('drama not setup');
        } else {
            const { page: storePage } = storeToRefs(usePageStore());
            storePage.value = page;
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
    const { controls, scene, renderer, camera, controlMode, transform, attachTransform, onRender, renderBeforeHook, onBeforeRender } = useScene(container);

    const { page } = usePageStore();
    const { frames, primaryFrame, activeFrames, selectFrame } = useFrame(page!, scene);

    const answerStore = useAnswerStore();
    const { answer } = storeToRefs(answerStore);
    const { setupAnswer, onSetupAnswer, useSetupAnswer, applyOperation, onApplyOperation } = answerStore;

    const {
        setup: setupThreeView,
        onSetup: onThreeViewSetup, onChange: onThreeViewChange, onConfirm: onThreeViewConfirm,
        confirmEvent: threeViewConfirmEventHook, changeEvent: threeViewChangeEventHook
    } = useThreeView();

    const { mode: shaderMode, material } = useShader();

    const launch = async () => {
        await setupAnswer({ elements: [] });
    };

    const { state: mouseState, eventHook: mouseEventHook } = useMouse();

    const activeTool = ref('');

    const focusedUUID = ref<string>();
    const highlightMat = ref<THREE.Matrix4>();
    const selectedUUIDs = shallowRef<Set<string>>(new Set<string>([]));

    watchEffect(() => {
        controls.enableRotate = mouseState.value === 'free';
    });

    return {
        normal: {
            container: container as MaybeRefOrGetter<HTMLDivElement>,
            toolbox: toolbox as MaybeRefOrGetter<HTMLDivElement>,
            footer: footer as MaybeRefOrGetter<HTMLDivElement>,
            rightsidebar: rightsidebar as MaybeRefOrGetter<HTMLDivElement>,
            mouseState, onAdvanceMouseEvent: mouseEventHook.on,
            frames, primaryFrame, activeFrames, selectFrame,
            activeTool, focusedUUID, selectedUUIDs, highlightMat,
            page: page!, answer: readonly(answer), useSetupAnswer, applyOperation, onApplyOperation,
            scene, camera,
            shaderMode, material,

            transform, attachTransform,

            launch,
            setupThreeView, onThreeViewSetup, onThreeViewChange, onThreeViewConfirm
        } as const,

        advance: {
            controls, renderer, controlMode, mouseEventHook, onRender, onBeforeRender, renderBeforeHook,
            threeViewConfirmEventHook, threeViewChangeEventHook,
            onSetupAnswer, originAnswer: answer
        } as const
    } as const;
};
