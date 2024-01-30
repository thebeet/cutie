<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Common</div>
        <button type="button" class="toolbox-button" @click="click">Free</button>
        <button
            type="button"
            class="toolbox-button"
            :disabled="!canUndo"
            @click="undo"
        >undo</button>
        <button
            type="button"
            class="toolbox-button"
            :disabled="!canRedo"
            @click="redo"
        >redo</button>
    </div>
</template>
<script lang="ts" setup>
import { useDrama } from '@web3d/hooks/drama';

const { activeTool, mouseState, undo, redo, canUndo, canRedo } = useDrama();
const click = () => {
    activeTool.value = '';
    mouseState.value = 'free';
};

</script>
<style lang="less" scoped>
</style>