<template>
    <div>
        <div>current {{ mainLabelID }}</div>
        <table>
            <tbody>
                <tr v-for="instance in instances" :key="instance.id" @click="select(instance.id)">
                    <td>{{ instance.id }}</td>
                    <td>
                        <svg-icon v-if="instance.visible" type="mdi" :path="mdiEye"></svg-icon>
                        <svg-icon v-else type="mdi" :path="mdiEyeOff"></svg-icon>
                    </td>
                    <td><input v-model="instance.color" type="color" @change="changeColor(instance.id, instance.color)"></td>
                    <td>{{ instance.name }}</td>
                    <td>
                        <svg-icon v-if="instance.lock" type="mdi" :path="mdiLock"></svg-icon>
                        <svg-icon
                            v-else
                            type="mdi"
                            :path="mdiLockOpen"
                            style="color: grey"
                        ></svg-icon>
                    </td>
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
import { mdiEye, mdiEyeOff, mdiLock, mdiLockOpen } from '@mdi/js';

const { applyOperation } = useDrama();

const { mainLabelID, instances, showIDOnly } = storeToRefs(useParsingStore());

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