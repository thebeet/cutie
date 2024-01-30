import { ref, readonly, DeepReadonly, markRaw, toRaw, Ref } from 'vue';
import { Page, AnswerContent } from '../types';
import localforage from 'localforage';
import { Operation } from '../operator/Operation';
import { useManualRefHistory } from '@vueuse/core';
import { usePageStore } from './page';
import { defineStore, storeToRefs } from 'pinia';
import { klona } from 'klona';
import { begin, measure } from '@/stores/performance';
import { Composer } from 'middleware-io';

const initAnswer = (page: DeepReadonly<Page>): AnswerContent => {
    const ret: AnswerContent = {
        elements: [],
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
    if (page.answers.length > 0) {
        ret.elements = klona(page.answers[page.answers.length - 1].content.elements);
    }
    return ret;
};

export const useAnswerStore = defineStore('answer', () => {
    const { page } = storeToRefs(usePageStore());
    const key = `answer-${page.value.response!.id}`;

    const state = ref<'init' | 'inited' | 'pending' | 'finish' | 'error'>('init');
    const answer = ref<AnswerContent>(initAnswer(page.value));
    const setSource = (source: Ref<AnswerContent>, value: AnswerContent): void  => {
        source.value = value;
        saveTmp();
    };
    const { history, commit: _commit, undo, redo, clear, canUndo, canRedo } = useManualRefHistory<AnswerContent>(answer, {
        capacity: 10,
        clone: klona,
        setSource: setSource
    });
    const commit = measure('web3d::answer::commit', _commit);
    if (page.value.response) {
        localforage.getItem<AnswerContent>(key).then((value) => {
            if (value !== null && value !== undefined) {
                setSource(answer, value);
                commit();
                clear();
            }
        }).finally(() => {
            state.value = 'inited';
        });
    } else {
        state.value = 'inited';
    }

    const saveTmp = measure('web3d::answer::savetmp', () => {
        state.value = 'pending';
        localforage.setItem(key, toRaw(answer.value)).then(() => {
            state.value = 'finish';
        }).catch(() => {
            state.value = 'error';
        });
    });

    const composedApplyOperation = new Composer<{ answer: AnswerContent, operation: Operation }>();
    composedApplyOperation.use(({ answer, operation }, next) => {
        operation.apply(answer);
        next();
    });
    const applyOperation = (operation: Operation, save: boolean = true) => {
        return composedApplyOperation.compose()({ answer: answer.value, operation }, () => {
            //applyOperationEvent.trigger({ answer: answer.value, operation });
            return Promise.resolve();
        });
    };

    return {
        answer: readonly(answer),
        undo, redo, history, canUndo, canRedo,
        applyOperation,
        useApplyOperation: composedApplyOperation.use.bind(composedApplyOperation)
    };
});