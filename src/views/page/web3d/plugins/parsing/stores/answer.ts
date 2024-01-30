import { defineStore, storeToRefs } from 'pinia';
import { klona } from 'klona';
import { useAnswerStore } from '@web3d/stores/answer';
import { Page, AnswerContent } from '../types';
import { DeepReadonly, ref, Ref, markRaw } from 'vue';
import { usePageStore } from '@web3d/stores/page';

const answerInit = (page: Page) => {
    const ret: AnswerContent = {
        parsing: {
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
            frames: markRaw([{
                index: 0,
                label: new Int32Array(),
            }, ...page.data.frames.map(frame => ({
                index: frame.index,
                label: new Int32Array(frame.points)
            }))]),
        }
    };
    return ret;
};

export const useParsingAnswerStore = defineStore('parsing-answer', () => {
    const answerStore = useAnswerStore();
    const { page } = storeToRefs(usePageStore());
    const answer = ref<AnswerContent>(answerInit(page.value));

    return {
        ...answerStore,
        answer
    };
});