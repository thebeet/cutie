<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Fullscreen</div>
        <button
            type="button"
            class="toolbox-button"
            @click="fullscreen"
        >
            fullscreen
        </button>
    </div>
</template>
<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import { useDrama } from '@web3d/hooks/drama';
import { Ref } from 'vue';

const { container } = useDrama();

const { enter: fullscreen } = useFullscreen(container as Ref<HTMLElement>);
</script>