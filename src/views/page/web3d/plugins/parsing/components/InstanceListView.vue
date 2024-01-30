<template>
    <div>
        <div>current {{ mainLabelID }}</div>
        <table>
            <tbody>
                <tr v-for="instance in instances" :key="instance.id" @click="select(instance.id)">
                    <td>{{ instance.id }}</td>
                    <td><input v-model="instance.color" type="color" @change="changeColor(instance.id, instance.color)"></td>
                    <td>{{ instance.name }}</td>
                    <td><button @click="show(instance.id)">show</button></td>
                </tr>
            </tbody>
            <tfoot>
                <button @click="add">add</button>
            </tfoot>
        </table>
    </div>
</template>
<script lang="ts" setup>
import { ParsingInstanceModifyColorOperation } from '../operations/ParsingInstanceModifyColorOperation';
import { useParsingStore } from '../stores';
import { storeToRefs } from 'pinia';
import { useDrama } from '@web3d/hooks/drama';

const parsingPluginStore = useParsingStore();
const { applyOperation } = useDrama();

const { mainLabelID, instances, showIDOnly } = storeToRefs(parsingPluginStore);
const select = (id: number) => {
    mainLabelID.value = id;
};

const changeColor = (id: number, color: string) => {
    const operation = new ParsingInstanceModifyColorOperation(id, color);
    applyOperation(operation);
};

const add = () => {

};

const show = (id: number) => {
    if (showIDOnly.value === id) {
        showIDOnly.value = -1;
    } else {
        showIDOnly.value = id;
    }
};
</script>
<style lang="less" scoped>
</style>