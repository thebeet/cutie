import { useDrama } from '@cutie/web3d';
import localforage from 'localforage';
import { defineStore } from 'pinia';
import { ref, toRaw } from 'vue';

export const useAnswerCacheStore = defineStore('plugin::answer-cache', () => {
    const { page, answer, onApplyOperation } = useDrama();
    const key = `answer-${page.response!.id}`;

    const autoSave = ref(false);

    const save = () => {
        localforage.setItem(key, toRaw(answer.value));
    };

    onApplyOperation(() => {
        if (autoSave.value) save();
    });

    return {
        key,
        autoSave,
        save
    };
});