import { defineStore, storeToRefs } from 'pinia';
import { useAnswerStore } from '@web3d/stores/answer';
import { useManualRefHistory } from '@vueuse/core';
import { AnswerContent } from '@web3d/types';
import { klona } from 'klona';

export const useAnswerHistoryStore = defineStore('plugin::answer-history', () => {
    const answerStore = useAnswerStore();
    const { originAnswer } = storeToRefs(answerStore);
    const { onSetupAnswer, onApplyOperation } = answerStore;
    const { history, commit, undo, redo, clear, canUndo, canRedo } = useManualRefHistory<AnswerContent>(originAnswer, {
        capacity: 10,
        clone: klona
    });

    onSetupAnswer(() => {
        commit();
        clear();
    });

    onApplyOperation(({ save }) => {
        if (save) {
            commit();
        }
    });

    return {
        history,
        undo, redo, clear, canUndo, canRedo,
    };
});