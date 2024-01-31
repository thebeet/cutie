<template>
    <div ref="container" class="three-views-container">
        <div ref="front" class="front-view-container view-container"></div>
        <div ref="side" class="side-view-container view-container"></div>
        <div ref="top" class="top-view-container view-container"></div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRender } from '../hooks/render';

const container = ref<HTMLDivElement>();
const front = ref<HTMLDivElement>();
const side = ref<HTMLDivElement>();
const top = ref<HTMLDivElement>();

useRender({
    container, front, side, top
});
</script>
<style scoped>
.three-views-container {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 70%;
    background-color: aquamarine;
    z-index: 100;
    display: flex;
    flex-direction: column;
    row-gap: 4px;
    padding: 4px;
}

.view-container {
    background-color: black;
    width: 100%;
    height: 100%;
}
</style>