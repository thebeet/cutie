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
import { useBoxStore } from '../stores';

const { focused } = storeToRefs(useBoxStore());
</script>