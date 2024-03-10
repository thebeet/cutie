<template>
    <div v-show="outer && inner" ref="container" class="three-views-container">
        <div v-if="outer && inner" ref="front" class="view-container">
            <ResizeableRect
                v-if="frontCamera"
                v-model="inner"
                :outer="outer"
                name="front"
                :camera="frontCamera"
                @confirm="confirm"
            />
        </div>
        <div v-if="outer && inner" ref="side" class="view-container">
            <ResizeableRect
                v-if="sideCamera"
                v-model="inner"
                :outer="outer"
                name="side"
                :camera="sideCamera"
                @confirm="confirm"
            />
        </div>
        <div v-if="outer && inner" ref="top" class="view-container">
            <ResizeableRect
                v-if="topCamera"
                v-model="inner"
                :outer="outer"
                name="top"
                :camera="topCamera"
                @confirm="confirm"
            />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRender } from '../hooks/render';
import ResizeableRect from './ResizeableRect.vue';
import { useThreeViewStore } from '../stores';
import { storeToRefs } from 'pinia';

const container = ref<HTMLDivElement>();
const front = ref<HTMLDivElement>();
const side = ref<HTMLDivElement>();
const top = ref<HTMLDivElement>();

const threeViewStore = useThreeViewStore();
const { confirm } = threeViewStore;
const { inner, outer } = storeToRefs(threeViewStore);

const { cameras: { front: frontCamera, side: sideCamera, top: topCamera } } = useRender({
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
    z-index: 1000;
    display: flex;
    flex-direction: column;
    row-gap: 4px;
    padding: 4px;
}

.view-container {
    background-color: black;
    width: 100%;
    height: 100%;
    position: relative;
}
</style>