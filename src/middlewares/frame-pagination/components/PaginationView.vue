<template>
    <div class="frame-pagination-container">
        <div
            v-for="frame in frames"
            :key="frame.index"
            class="frame-pagination"
            @click="() => selectFrame(frame.index)"
        >{{frame.index}}</div>
    </div>
</template>

<script setup lang="ts">
import { useDrama } from '@web3d/hooks/drama';

const { frames, selectFrame } = useDrama();

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
</style>