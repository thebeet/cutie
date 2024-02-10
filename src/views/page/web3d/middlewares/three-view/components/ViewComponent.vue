<template>
    <div v-if="threeView.outer && threeView.inner" ref="container" class="three-views-container">
        <div ref="front" class="view-container">
            <ResizeableRect
                v-model="threeView.inner"
                :outer="threeView.outer"
                name="front"
                x="y"
                y="z"
                @confirm="confirm"
            />
        </div>
        <div ref="side" class="view-container">
            <ResizeableRect
                v-model="threeView.inner"
                :outer="threeView.outer"
                name="side"
                x="x"
                y="z"
                @confirm="confirm"
            />
        </div>
        <div ref="top" class="view-container">
            <ResizeableRect
                v-model="threeView.inner"
                :outer="threeView.outer"
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
import { klona } from 'klona';

const container = ref<HTMLDivElement>();
const front = ref<HTMLDivElement>();
const side = ref<HTMLDivElement>();
const top = ref<HTMLDivElement>();

const { threeView, scene } = useDrama();

const confirm = () => {
    threeView.value.outer = klona(threeView.value.inner);
    threeView.value.outer!.size = {
        length: threeView.value.inner!.size.length * 1.4,
        width: threeView.value.inner!.size.width * 1.4,
        height: threeView.value.inner!.size.height * 1.4,
    };
    scene.update();
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