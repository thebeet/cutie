<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Common</div>
        <button type="button" class="toolbox-button" @click="click">Free</button>
    </div>
</template>
<script lang="ts" setup>
import { useDrama } from '@web3d/hooks/drama';

const { activeTool, mouseState } = useDrama();
const click = () => {
    activeTool.value = '';
    mouseState.value = 'free';
};

</script>
<style lang="less" scoped>
</style>