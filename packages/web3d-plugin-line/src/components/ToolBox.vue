<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Line</div>
        <button type="button" class="toolbox-button" @click="click('line')">Line</button>
        <button type="button" class="toolbox-button" @click="autoGeneratePointsForFocus">Auto</button>
    </div>
</template>
<script lang="ts" setup>
import { useDrama } from '@cutie/web3d';
import { useAutoAction } from '../actions/auto';

const { activeTool, mouseState } = useDrama();
const click = (mode: string) => {
    activeTool.value = 'line';
    mouseState.value = mode;
};

const { autoGeneratePointsForFocus } = useAutoAction();

</script>
<style scoped>
</style>