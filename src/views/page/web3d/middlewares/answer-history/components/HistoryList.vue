<template>
    <div>
        <table>
            <tr v-for="(operation, index) in operations" :key="index">
                <td>{{ operation.description }}</td>
            </tr>
        </table>
    </div>
</template>
<script setup lang="ts">
import { useAnswerHistoryStore } from '../stores/answer';
import { storeToRefs } from 'pinia';

const answerHistoryStore = useAnswerHistoryStore();
const { operations } = storeToRefs(answerHistoryStore);
</script>