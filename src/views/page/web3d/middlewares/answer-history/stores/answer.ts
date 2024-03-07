import { defineStore, storeToRefs } from 'pinia';
import { useAnswerStore } from '@web3d/stores/answer';
import { useManualRefHistory } from '@vueuse/core';
import { AnswerContent } from '@web3d/types';
import { shallowRef } from 'vue';
import { Operation } from '@web3d/operator/Operation';

const MAX_HISTORY_COUNT = 10;

export const useAnswerHistoryStore = defineStore('plugin::answer-history', () => {
    const answerStore = useAnswerStore();
    const { originAnswer } = storeToRefs(answerStore);
    const { onSetupAnswer, onApplyOperation } = answerStore;
    const { history, commit, undo, redo, clear, canUndo, canRedo } = useManualRefHistory<AnswerContent>(originAnswer, {
        capacity: MAX_HISTORY_COUNT,
    });
    const operations = shallowRef<Operation[]>([]);

    onSetupAnswer(() => {
        commit();
        clear();
    });

    onApplyOperation(({ operation, save }) => {
        if (save) {
            commit();
            operations.value = [operation, ...operations.value.slice(0, MAX_HISTORY_COUNT - 1)];
        }
    });

    const reset = () => {
        originAnswer.value = {
            ...originAnswer.value,
            elements: []
        };
        clear();
    };

    return {
        history, operations,
        undo, redo, clear, canUndo, canRedo, reset,
    };
});