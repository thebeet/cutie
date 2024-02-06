import { ref, watchEffect, MaybeRefOrGetter } from 'vue';
import { Annotation, AnswerContent, Operation } from '../types';
import { useScene } from '@web3d/hooks/scene';
import { usePCDCachedLoader } from '@web3d/hooks/loader';
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
import { useAnswerStore } from '@web3d/stores/answer';
import { useMouseEvent } from '@web3d/hooks/mouse';
import { storeToRefs } from 'pinia';
import { usePageStore } from '@web3d/stores/page';
import { Frame } from '@web3d/types';
import { useFrame } from './frame';
import * as THREE from 'three';

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
    const { controls, scene, renderer, camera } = useScene(container);

    const { page } = usePageStore();
    const { frames, activeFrames, selectFrame } = useFrame();
    frames.forEach(frame => {
        scene.add(frame);
    });

    const answerStore = useAnswerStore();
    const { answer } = storeToRefs(answerStore);
    const { setupAnswer, applyOperation, onApplyOperation } = answerStore;

    const threeView = ref({
        position: { x: 0.42, y: 2.72, z: 1.04 },
        size: { length: 4.2, width: 2.1, height: 1.35 },
        rotation: {
            phi: 0,
            psi: 0,
            theta: 0
        },
    });

    const launch = async () => {
        const tAnswer: AnswerContent = {
            elements: []
        };
        for (let i = 1; i < frames.length; ++i) {
            const frame = frames[i];
            for (let j = 0; j < 300; j++) {
                tAnswer.elements.push({
                    uuid: THREE.MathUtils.generateUUID(),
                    schema: 'cube',
                    type: 'cube',
                    frameIndex: frame.index,
                    label: 'label',
                    description: 'description',
                    position: {
                        x: Math.random() * 50 - 25,
                        y: Math.random() * 50 - 25,
                        z: 1,
                    },
                    size: {
                        length: 2,
                        width: 3,
                        height: 1,
                    },
                    rotation: {
                        phi: 0,
                        psi: 0,
                        theta: 0
                    }
                });
            }
        }
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
            container, toolbox, rightsidebar,
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
            controls, renderer,
        }
    };
};
