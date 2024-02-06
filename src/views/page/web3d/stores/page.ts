import { readonly, shallowRef } from 'vue';
import { Page } from '../types';
import { defineStore } from 'pinia';

export const usePageStore = (initPage?: Page) => {
    return defineStore('page', () => {
        initPage?.data.frames.splice(5);
        const page = shallowRef<Page>(initPage!);
        return {
            page: readonly(page)
        };
    })();
};