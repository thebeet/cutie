<template>
    <svg ref="container" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;position:absolute;inset: 0;z-index: 100;pointer-events: none;">
        <rect
            v-if="mouseEvent.type === 'recting'"
            :x="rectPreview.x"
            :y="rectPreview.y"
            :width="rectPreview.width"
            :height="rectPreview.height"
            style="stroke: #33ccff;stroke-width: 1;fill-opacity: .25;"
        />
        <polyline
            v-if="mouseEvent.type === 'polylining'"
            :points="polylinePreview.points"
            fill="none"
            style="stroke: #33ccff;stroke-width: 1;"
        />
    </svg>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useElementSize } from '@vueuse/core';
import { useDrama } from '@cutie/web3d';

const container = ref<HTMLDivElement>();
const { mouseEvent } = useDrama();

const { width: containerWidth, height: containerHeight } = useElementSize(container);

const rectPreview = computed(() => {
    const x = (Math.min(mouseEvent.value.points[0].x, mouseEvent.value.points[1].x) + 1) * containerWidth.value / 2.0;
    const y = (-Math.max(mouseEvent.value.points[0].y, mouseEvent.value.points[1].y) + 1) * containerHeight.value / 2.0;
    const width = Math.abs(mouseEvent.value.points[0].x - mouseEvent.value.points[1].x) * containerWidth.value / 2.0;
    const height = Math.abs(mouseEvent.value.points[0].y - mouseEvent.value.points[1].y) * containerHeight.value / 2.0;
    return {
        x, y, width, height
    };
});

const polylinePreview = computed(() => {
    return {
        points: mouseEvent.value.points.map(p => `${(p.x + 1) * containerWidth.value / 2.0},${(-p.y + 1) * containerHeight.value / 2.0}`).join(' ')
    };
});
</script>