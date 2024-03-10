import { defineStore, storeToRefs } from 'pinia';
import { useAnswerStore, usePageStore } from '@cutie/web3d';
import { AnswerContent } from '../types';
import { ShallowRef } from 'vue';

export const useParsingAnswerStore = defineStore('plugin::parsing-answer', () => {
    const answerStore = useAnswerStore();
    const { useSetupAnswer } = answerStore;
    const { answer } = storeToRefs(answerStore);
    const { page } = storeToRefs(usePageStore());

    useSetupAnswer(async (ctx, next) => {
        const parsingAnswer = ctx.answer as AnswerContent;
        if (!parsingAnswer.parsing) {
            (ctx.answer as AnswerContent) = {
                ...ctx.answer,
                parsing: {
                    instances: [{
                        id: 0,
                        kind: 'default',
                        name: 'default',
                        description: 'default',
                        color: '#ffffff',
                    }, {
                        id: 1,
                        kind: 'car',
                        name: 'car',
                        description: 'car',
                        color: '#ffff33',
                    }, {
                        id: 2,
                        kind: 'tree',
                        name: 'tree',
                        description: 'tree',
                        color: '#33ff33',
                    }],
                    frames: [{
                        index: 0,
                        label: new Int32Array(),
                    }, ...page.value.data.frames.map(frame => ({
                        index: frame.index,
                        label: new Int32Array(frame.points)
                    }))],
                }
            };
        }
        await next();
    });

    return {
        answer: answer as ShallowRef<AnswerContent>,
    } as const;
});