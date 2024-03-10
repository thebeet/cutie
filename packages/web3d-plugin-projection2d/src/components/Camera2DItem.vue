<template>
    <div ref="container" class="camera-item" :class="{'zoom': zoom}">
        <div class="button-group">
            <button type="button" @click="() => togglePointsVisible()">{{ pointsVisible ? 'Show' : 'Hide'}}</button>
            <button type="button" @click="() => toggleDistortionVisible()">{{ distortionVisible ? 'Distortion' : 'Normal'}}</button>
            <button type="button" @click="() => toggleZoom()">Zoom</button>
        </div>
        <img class="camera-img" :src="camera.url">
        <div class="camera-title">{{ camera.name }} - {{ camera.params.distortionType }}</div>
    </div>
</template>
<script lang="ts" setup>
import { useDrama } from '@cutie/web3d';
import { Camera2D } from '@cutie/web3d';
import { useProjection2d } from '../hooks';
import { ref } from 'vue';
import { useToggle } from '@vueuse/core';

const props = defineProps<{
    camera: Camera2D
}>();

const [zoom, toggleZoom] = useToggle(false);
const { scene } = useDrama();
const container = ref<HTMLDivElement>();

const {
    pointsVisible, togglePointsVisible,
    distortionVisible, toggleDistortionVisible,
} = useProjection2d(container, scene, props.camera.params);
</script>
<style scoped>
.camera-item {
    position: relative;
}

.camera-item.zoom {
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 100;
}

.camera-title {
    position: absolute;
    bottom: 20px;
    left: 0;
    width: 100%;
    line-height: 16px;
    background-color: #33333333;
    color: #eeeeee;
}

.camera-img {
    position: absolute;
    width: 100%;
    height: 100%;
    inset: 0;
    z-index: -10;
}

.camera-canvas {
    position: absolute;
    width: 100%;
    height: 100%;
    inset: 0;
    z-index: 1;
}
.button-group {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 20;
    display: flex;
}

.points-visible-button {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
}
</style>