<template>
    <div v-show="threeViewOuter && threeViewInner" ref="container" class="three-views-container">
        <div v-if="threeViewOuter && threeViewInner" ref="front" class="view-container">
            <ResizeableRect
                v-if="frontCamera"
                v-model="threeViewInner"
                :outer="threeViewOuter"
                name="front"
                :camera="frontCamera"
                @confirm="confirm"
            />
        </div>
        <div v-if="threeViewOuter && threeViewInner" ref="side" class="view-container">
            <ResizeableRect
                v-if="sideCamera"
                v-model="threeViewInner"
                :outer="threeViewOuter"
                name="side"
                :camera="sideCamera"
                @confirm="confirm"
            />
        </div>
        <div v-if="threeViewOuter && threeViewInner" ref="top" class="view-container">
            <ResizeableRect
                v-if="topCamera"
                v-model="threeViewInner"
                :outer="threeViewOuter"
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
import { useDrama } from '@web3d/hooks/drama';

const container = ref<HTMLDivElement>();
const front = ref<HTMLDivElement>();
const side = ref<HTMLDivElement>();
const top = ref<HTMLDivElement>();

const { threeViewInner, threeViewOuter, threeViewRejust } = useDrama();

const confirm = () => {
    threeViewRejust();
};

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