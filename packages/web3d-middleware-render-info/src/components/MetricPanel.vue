<template>
    <div v-if="info" class="metric-panel">
        {{ info }}
    </div>
</template>
<script setup lang="ts">
import { useRenderInfoStore } from '../stores';
import { storeToRefs } from 'pinia';

const { info } = storeToRefs(useRenderInfoStore());
</script>
<style scoped>
.metric-panel {
    background-color: #fff;
    color: #333;
    position: absolute;
    top: 0;
    left: 0;
    font-size: 12px;
    width: 128px;
    height: 256px;
}
</style>