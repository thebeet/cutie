<template>
    <svg ref="container" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;position:absolute;inset: 0;z-index: 100;pointer-events: none;">
        <polyline
            v-if="mouseEvent.type === 'polylined'"
            :points="polylined.points"
            fill="none"
            style="stroke: #33ccff;stroke-width: 1;"
        />
        <polyline
            v-if="mouseEvent.type === 'polylined'"
            :points="polylined.bouding"
            fill="none"
            style="stroke: #ffaa00;stroke-width: 1;"
        />
        <polyline
            v-if="mouseEvent.type === 'polylined'"
            :points="polylined.convexHull"
            fill="none"
            style="stroke: #00ff00;stroke-width: 1;"
        />
        <polyline
            v-if="mouseEvent.type === 'polylined'"
            :points="polylined.rect"
            fill="none"
            style="stroke: #0033ff;stroke-width: 1;"
        />
    </svg>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDrama } from '@cutie/web3d';
import { useElementSize } from '@vueuse/core';
import { convexHull2D, pointsBox2DBounding, rotatingCalipers } from '../libs/ConvexHull2D';
import * as THREE from 'three';

const container = ref<HTMLDivElement>();

const { mouseEvent } = useDrama();

const { width: containerWidth, height: containerHeight } = useElementSize(container);

const polylined = computed(() => {
    const map = (points: THREE.Vector2[]) => {
        return points.map(p => `${(p.x + 1) * containerWidth.value / 2.0},${(-p.y + 1) * containerHeight.value / 2.0}`).join(' ');
    };
    const points = mouseEvent.value.points.map(({ x, y }) => new THREE.Vector2(x, y));
    const boundingRect = pointsBox2DBounding(points).rect;
    const convexHull = convexHull2D(points);
    const rect = rotatingCalipers(convexHull).rect;
    return {
        points: map(points),
        bouding: map(boundingRect),
        convexHull: map(convexHull),
        rect: map(rect),
    };
});
</script>