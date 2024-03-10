<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Camera</div>
        <button
            type="button"
            class="toolbox-button"
            @click="free"
        >
            Free
        </button>
        <button
            type="button"
            class="toolbox-button"
            @click="topDown"
        >
            Top-down
        </button>
    </div>
</template>
<script lang="ts" setup>
import { useAdvanceDrama } from '@cutie/web3d';

const { mouseState, controlMode } = useAdvanceDrama();

const free = () => {
    mouseState.value = 'free';
    controlMode.value = 'free';
};

const topDown = () => {
    mouseState.value = 'free';
    controlMode.value = 'top-down';
};
</script>
<style scoped>
</style>