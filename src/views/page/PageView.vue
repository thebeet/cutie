<template>
    <component :is="pageComponent" :page="page"/>
</template>
<script lang="ts" setup>
import type { Page } from '@/types';
import { type Component, defineAsyncComponent, ref, markRaw } from 'vue';

const pageComponent = ref<Component>();
const page = ref<Page>();

fetch('/200/page.json').then((response) => response.json() as Promise<Page>).then(data => {
    page.value = data;
    pageComponent.value = markRaw(
        defineAsyncComponent(() => import(`./${page.value?.template.name}/PageView.vue`))
    );
});
</script>
<style scoped>
</style>