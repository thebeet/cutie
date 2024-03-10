<template>
    <svg ref="container" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;position:absolute;inset: 0;z-index: 100;pointer-events: none;">
        <circle
            v-if="(activeTool === 'parsing') && (mouseState === 'brush') && mouseEvent.cursor"
            :cx="(mouseEvent.cursor.x + 1.0) / 2.0 * containerWidth"
            :cy="(1.0 - mouseEvent.cursor.y) / 2.0 * containerHeight "
            :r="containerWidth * brushRadius"
            style="stroke: #33ccff;stroke-width: 1;fill-opacity: .25;"
        />
    </svg>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useElementSize } from '@vueuse/core';
import { useDrama } from '@cutie/web3d';
import { useParsingStore } from '../stores';
import { storeToRefs } from 'pinia';

const container = ref<HTMLDivElement>();
const { mouseEvent } = useDrama();

const { width: containerWidth, height: containerHeight } = useElementSize(container);

const { activeTool, mouseState } = useDrama();
const { brushRadius } = storeToRefs(useParsingStore());

</script>