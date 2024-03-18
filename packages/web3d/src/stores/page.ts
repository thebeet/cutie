import { shallowRef } from 'vue';
import { Page } from '../types';
import { defineStore } from 'pinia';

export const usePageStore = defineStore('page', () => {
    const page = shallowRef<Page>();
    return {
        page
    } as const;
});