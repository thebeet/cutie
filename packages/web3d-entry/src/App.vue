<template>
    <PageView v-if="page" :page="page"/>
</template>
<script lang="ts" setup>
import './svg-icon';
import { Page } from './types';
import PageView from './views/PageView.vue';
import { ref } from 'vue';

const page = ref<Page>();

fetch('/200/page20.json').then((response) => response.json() as Promise<Page>).then(data => {
    page.value = data;
});
</script>