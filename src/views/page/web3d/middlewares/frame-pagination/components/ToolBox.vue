<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Frames</div>
        <button
            type="button"
            class="toolbox-button"
            @click="play"
        >
            play
        </button>
        <button
            type="button"
            class="toolbox-button"
            @click="showAll"
        >
            showAll
        </button>
    </div>
</template>
<script lang="ts" setup>
import { useDrama } from '@web3d/hooks/drama';

const { frames, selectFrame } = useDrama();
const play = () => {
    let current = 0;
    const c = setInterval(() => {
        current++;
        if (current >= frames.length) {
            clearInterval(c);
        } else {
            selectFrame(current);
        }
    }, 100);
};

const showAll = () => {
    selectFrame(frames.map(f => f.index).filter(i => i > 0));
};
</script>
<style scoped>
</style>