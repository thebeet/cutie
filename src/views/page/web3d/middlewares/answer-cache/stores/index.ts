import { useAnswerStore } from '@web3d/stores/answer';
import { klona } from 'klona';
import localforage from 'localforage';
import { useDrama } from '@web3d/hooks/drama';
import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';

export const useAnswerCacheStore = defineStore('plugin::answer-cache', () => {
    const { answer } = storeToRefs(useAnswerStore());
    const { page, onApplyOperation } = useDrama();
    const key = `answer-${page.response!.id}`;

    const autoSave = ref(false);

    const save = () => {
        localforage.setItem(key, klona(answer.value));
    };

    onApplyOperation(({ save: opSave }) => {
        if (opSave && autoSave.value) save();
    });

    return {
        key,
        autoSave,
        save
    };
});