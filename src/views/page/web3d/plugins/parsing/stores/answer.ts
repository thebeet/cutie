import { defineStore, storeToRefs } from 'pinia';
import { useAnswerStore } from '@web3d/stores/answer';
import { AnswerContent } from '../types';
import { Ref, markRaw, DeepReadonly } from 'vue';
import { usePageStore } from '@web3d/stores/page';

export const useParsingAnswerStore = defineStore('plugin::parsing-answer', () => {
    const answerStore = useAnswerStore();
    const { useSetupAnswer } = answerStore;
    const { answer } = storeToRefs(answerStore);
    const { page } = storeToRefs(usePageStore());

    useSetupAnswer(async (ctx, next) => {
        const parsingAnswer = ctx.answer as AnswerContent;
        if (!parsingAnswer.parsing) {
            parsingAnswer.parsing = {
                instances: [{
                    id: 0,
                    kind: 'default',
                    name: 'default',
                    description: 'default',
                    color: '#ffffff',
                    count: 0,
                }, {
                    id: 1,
                    kind: 'car',
                    name: 'car',
                    description: 'car',
                    color: '#ffff33',
                    count: 0,
                }, {
                    id: 2,
                    kind: 'tree',
                    name: 'tree',
                    description: 'tree',
                    color: '#33ff33',
                    count: 0,
                }],
                frames: [{
                    index: 0,
                    label: new Int32Array(),
                }, ...page.value.data.frames.map(frame => (markRaw({
                    index: frame.index,
                    label: new Int32Array(frame.points)
                })))],
            };
        }
        await next();
    });

    return {
        answer: answer as Ref<DeepReadonly<AnswerContent>>,
    };
});