<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Answer Cache</div>
        <button
            type="button"
            class="toolbox-button"
            @click="save"
        >Manual Save</button>

        <button
            type="button"
            class="toolbox-button"
            @click="switchAutoSave"
        >Auto Save {{ autoSave ? 'ON' : 'OFF' }}</button>
    </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useAnswerCacheStore } from '../stores';

const answerCacheStore = useAnswerCacheStore();
const { save } = answerCacheStore;
const { autoSave } = storeToRefs(answerCacheStore);

const switchAutoSave = () => {
    autoSave.value = !autoSave.value;
};

</script>
<style lang="less" scoped>
</style>