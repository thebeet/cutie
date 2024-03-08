<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Box</div>
        <button type="button" class="toolbox-button" @click="click('rect')">Rect</button>
    </div>
</template>
<script lang="ts" setup>
import { useDrama } from '@web3d/hooks/drama';

const { activeTool, mouseState } = useDrama();
const click = (mode: string) => {
    activeTool.value = 'rect';
    mouseState.value = mode;
};
</script>
<style scoped>
</style>