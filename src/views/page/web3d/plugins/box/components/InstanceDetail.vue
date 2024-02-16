<template>
    <div>
        <div class="title">
            Box Detail
        </div>
        <div class="content">
            {{ focused }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRectStore } from '../stores';

const { focused } = storeToRefs(useRectStore());
</script>