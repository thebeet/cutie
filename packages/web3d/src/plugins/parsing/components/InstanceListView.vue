<template>
    <div>
        <div>current {{ mainLabelID }}</div>
        <table>
            <tbody>
                <tr v-for="instance in instances" :key="instance.id" @click="setMainLabelID(instance.id)">
                    <td>{{ instance.id }}</td>
                    <td>
                        <svg-icon
                            v-if="instance.visible"
                            type="mdi"
                            :path="mdiEye"
                            @click.stop="hide(instance.id)"
                        ></svg-icon>
                        <svg-icon
                            v-else
                            type="mdi"
                            :path="mdiEyeOff"
                            style="color: grey"
                            @click.stop="show(instance.id)"
                        ></svg-icon>
                    </td>
                    <td><input v-model="instance.color" type="color" @change="changeColor(instance.id, instance.color)"></td>
                    <td>{{ instance.name }}</td>
                    <td>{{ activeFrames.reduce((sum, frame) => sum + instance.counts[frame.index], 0) }}</td>
                    <td>
                        <svg-icon
                            v-if="instance.lock"
                            type="mdi"
                            :path="mdiLock"
                            @click.stop="unlock(instance.id)"
                        ></svg-icon>
                        <svg-icon
                            v-else
                            type="mdi"
                            :path="mdiLockOpen"
                            style="color: grey"
                            @click.stop="lock(instance.id)"
                        ></svg-icon>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script lang="ts" setup>
import { useParsingStore } from '../stores';
import { storeToRefs } from 'pinia';
import { useDrama } from '@web3d/hooks/drama';
import { mdiEye, mdiEyeOff, mdiLock, mdiLockOpen } from '@mdi/js';
import { useActions } from '../actions';

const { activeFrames } = useDrama();
const { mainLabelID, instances } = storeToRefs(useParsingStore());

const {
    show, hide, lock, unlock,
    setMainLabelID,
    changeColor
} = useActions();
</script>
<style lang="less" scoped>
</style>