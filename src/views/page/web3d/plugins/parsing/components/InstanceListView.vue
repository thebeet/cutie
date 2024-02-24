<template>
    <div>
        <div>current {{ mainLabelID }}</div>
        <table>
            <tbody>
                <tr v-for="instance in instances" :key="instance.id" @click="select(instance.id)">
                    <td>{{ instance.id }}</td>
                    <td>
                        <svg-icon
                            v-if="instance.visible"
                            type="mdi"
                            :path="mdiEye"
                            @click="hide(instance.id)"
                        ></svg-icon>
                        <svg-icon
                            v-else
                            type="mdi"
                            :path="mdiEyeOff"
                            @click="show(instance.id)"
                        ></svg-icon>
                    </td>
                    <td><input v-model="instance.color" type="color" @change="changeColor(instance.id, instance.color)"></td>
                    <td>{{ instance.name }}</td>
                    <td>{{ activeFrames.reduce((sum, frame) => sum + instance.counts[frame.index], 0) }}</td>
                    <td>
                        <svg-icon v-if="instance.lock" type="mdi" :path="mdiLock"></svg-icon>
                        <svg-icon
                            v-else
                            type="mdi"
                            :path="mdiLockOpen"
                            style="color: grey"
                        ></svg-icon>
                    </td>
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

const { activeFrames, applyOperation } = useDrama();

const { mainLabelID, instances } = storeToRefs(useParsingStore());

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
    instances.value[id].visible = true;
};

const hide = (id: number) => {
    instances.value[id].visible = false;
};
</script>
<style lang="less" scoped>
</style>