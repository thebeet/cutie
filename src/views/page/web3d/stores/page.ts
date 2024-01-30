import { readonly, shallowRef } from 'vue';
import { Page } from '../types';
import { defineStore } from 'pinia';

export const usePageStore = (initPage?: Page) => {
    return defineStore('page', () => {
        const page = shallowRef<Page>(initPage!);
        return {
            page: readonly(page)
        };
    })();
};