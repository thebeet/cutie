<template>
    <div v-if="threeViewOuter && threeViewInner" ref="container" class="three-views-container">
        <div ref="front" class="view-container">
            <ResizeableRect
                v-model="threeViewInner"
                :outer="threeViewOuter"
                name="front"
                x="y"
                y="z"
                @confirm="confirm"
            />
        </div>
        <div ref="side" class="view-container">
            <ResizeableRect
                v-model="threeViewInner"
                :outer="threeViewOuter"
                name="side"
                x="x"
                y="z"
                @confirm="confirm"
            />
        </div>
        <div ref="top" class="view-container">
            <ResizeableRect
                v-model="threeViewInner"
                :outer="threeViewOuter"
                name="top"
                x="x"
                y="y"
                @confirm="confirm"
            />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRender } from '../hooks/render';
import ResizeableRect from './ResizeableRect.vue';
import { useDrama } from '@web3d/hooks/drama';

const container = ref<HTMLDivElement>();
const front = ref<HTMLDivElement>();
const side = ref<HTMLDivElement>();
const top = ref<HTMLDivElement>();

const { threeViewInner, threeViewOuter, threeViewRejust } = useDrama();

const confirm = () => {
    threeViewRejust();
};

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
}
</style>