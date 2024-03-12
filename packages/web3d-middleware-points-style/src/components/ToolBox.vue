<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">PointStyle</div>
        <button
            type="button"
            class="toolbox-button"
            @click="shaderMode='normal'"
        >
            Normal
        </button>
        <button
            type="button"
            class="toolbox-button"
            @click="shaderMode='label'"
        >
            label
        </button>
        <button
            type="button"
            class="toolbox-button"
            @click="shaderMode='intensity'"
        >
            intensity
        </button>
        <button
            type="button"
            class="toolbox-button"
            @click="shaderMode='deep'"
        >
            deep
        </button>
    </div>
</template>
<script setup lang="ts">
import { useDrama } from '@cutie/web3d';

const { shaderMode } = useDrama();

</script>