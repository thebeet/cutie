<template>
    <OverlayScrollbarsComponent
        v-show="panelVisible"
        class="projection-panel-container"
        :options="{ overflow: { x: 'scroll' }}"
        defer
    >
        <div class="container-inner">
            <Camera2DItem
                v-for="(camera, index) in cameras"
                :key="index"
                :camera="camera"
                class="camera-item"
            />
        </div>
    </OverlayScrollbarsComponent>
</template>

<script lang="ts" setup>
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue';
import 'overlayscrollbars/overlayscrollbars.css';
import Camera2DItem from './Camera2DItem.vue';

import { useProjection2DStore } from '../stores';
import { storeToRefs } from 'pinia';

const { cameras, panelVisible } = storeToRefs(useProjection2DStore());
</script>

<style scoped>
.projection-panel-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 384px;
    height: 216px;
    z-index: 100;
}

.container-inner {
    display: flex;
}

.camera-item {
    position: relative;
    width: 384px;
    height: 216px;
    flex-shrink: 0;
}
</style>