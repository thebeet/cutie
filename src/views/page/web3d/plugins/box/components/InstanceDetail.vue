<template>
    <div>
        <div class="title">
            Box Detail
        </div>
        <div class="content">
            {{ draft }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useBoxStore } from '../stores';

const { draft } = storeToRefs(useBoxStore());
</script>