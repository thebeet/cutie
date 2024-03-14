<template>
    <PageView v-if="page" :page="page"/>
</template>
<script lang="ts" setup>
import { Page } from '@cutie/web3d';
import PageView from './views/PageView.vue';
import { ref } from 'vue';

const page = ref<Page>();

fetch('/200/page.json').then((response) => response.json() as Promise<Page>).then(data => {
    page.value = data;
});
</script>