<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Box</div>
        <button type="button" class="toolbox-button" @click="click('rect')">Rect</button>
        <button type="button" class="toolbox-button" @click="copyNextFocus()">copyNext</button>
    </div>
</template>
<script lang="ts" setup>
import { useDrama } from '@cutie/web3d';
import { useCopyNextAction } from '../actions/copynext';

const { activeTool, mouseState } = useDrama();
const click = (mode: string) => {
    activeTool.value = 'rect';
    mouseState.value = mode;
};
const { copyNextFocus } = useCopyNextAction();
</script>
<style scoped>
</style>