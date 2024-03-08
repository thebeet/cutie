<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Projection2D</div>
        <button
            type="button"
            class="toolbox-button"
            @click="() => toggleVisible()"
        >
            show
        </button>
    </div>
</template>
<script lang="ts" setup>
import { useToggle } from '@vueuse/core';
import { useProjection2DStore } from '../stores';
import { storeToRefs } from 'pinia';

const { panelVisible } = storeToRefs(useProjection2DStore());
const toggleVisible = useToggle(panelVisible);
</script>
<style scoped>
</style>