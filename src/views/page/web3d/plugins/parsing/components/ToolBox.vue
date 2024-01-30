<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Parsing</div>
        <button type="button" class="toolbox-button" @click="click('rect')">Rect</button>
        <button type="button" class="toolbox-button" @click="click('polyline')">Polyline</button>
        <button type="button" class="toolbox-button" @click="click('brush')">Brush</button>
    </div>
</template>
<script lang="ts" setup>
import { useDrama } from '@web3d/hooks/drama';
import { MouseMode } from '@web3d/hooks/mouse';
const { activeTool, mouseState } = useDrama();
const click = (mode: string) => {
    activeTool.value = 'parsing';
    mouseState.value = mode as MouseMode;
};
</script>
<style scoped>
</style>