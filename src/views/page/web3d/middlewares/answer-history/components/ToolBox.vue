<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Answer</div>
        <button
            type="button"
            class="toolbox-button"
            @click="reset"
        >reset</button>
        <button
            type="button"
            class="toolbox-button"
            :disabled="!canUndo"
            @click="undo"
        >undo</button>
        <button
            type="button"
            class="toolbox-button"
            :disabled="!canRedo"
            @click="redo"
        >redo</button>
    </div>
</template>
<script lang="ts" setup>
import { useAnswerHistoryStore } from '../stores/answer';
import { storeToRefs } from 'pinia';

const answerHistoryStore = useAnswerHistoryStore();
const { canUndo, canRedo } = storeToRefs(answerHistoryStore);
const { undo, redo, reset } = answerHistoryStore;
</script>
<style lang="less" scoped>
</style>