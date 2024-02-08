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

        <button
            type="button"
            class="toolbox-button"
            @click="toggleLabel"
        >
            toggleLabel
        </button>
    </div>
</template>
<script lang="ts" setup>
import { useAdvanceDrama } from '@web3d/hooks/drama';
import { LAYER_ELEMENT } from '@web3d/constants';

const { scene, camera, mouseState, controlMode } = useAdvanceDrama();

const free = () => {
    mouseState.value = 'free';
    controlMode.value = 'free';
};

const topDown = () => {
    mouseState.value = 'free';
    controlMode.value = 'top-down';
};

const toggleLabel = () => {
    camera.layers.toggle(LAYER_ELEMENT);
    scene.update();
};

</script>
<style scoped>
</style>