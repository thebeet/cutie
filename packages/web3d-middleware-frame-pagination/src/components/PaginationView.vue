<template>
    <div class="frame-pagination-container">
        <div
            v-for="frame in frames"
            :key="frame.index"
            class="frame-pagination"
            :class="{active: isActive(frame), primary: isPrimary(frame)}"
            @click="() => selectFrame(frame.index)"
        >{{frame.index}}</div>
    </div>
</template>

<script setup lang="ts">
import { useDrama, TFrame } from '@cutie/web3d';

const { frames, activeFrames, primaryFrame, selectFrame } = useDrama();

const isActive = (frame: TFrame) => {
    return activeFrames.value.includes(frame);
};
const isPrimary = (frame: TFrame) => {
    return primaryFrame.value === frame;
};
</script>

<style scoped>
.frame-pagination-container {
    display: flex;
    flex-wrap: wrap;
    padding: 8px;
    column-gap: 8px;
}
.frame-pagination {
    width: 16px;
    height: 16px;
    border: 1px solid #333333;
    font-size: 12px;
    text-align: center;
    cursor: pointer;
}
.frame-pagination.active {
    border: 1px solid #3333ff;
}

.frame-pagination.primary {
    background-color: #ff0000;
}
</style>