<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Parsing</div>
        <button type="button" class="toolbox-button" @click="click('rect')">Rect</button>
        <button type="button" class="toolbox-button" @click="click('polyline')">Polyline</button>
        <button type="button" class="toolbox-button" @click="dump()">Dump</button>
    </div>
</template>
<script lang="ts" setup>
import { useDrama } from '@cutie/web3d';
import { FieldXYZ, PCDFields, dumpBinary } from '../features/dump';
import { useParsingStore } from '../stores';
import { storeToRefs } from 'pinia';
import * as THREE from 'three';

const { activeTool, mouseState, activeFrames } = useDrama();
const { instances } = storeToRefs(useParsingStore());

const click = (mode: string) => {
    activeTool.value = 'parsing';
    mouseState.value = mode;
};

const dump = () => {
    const rgbColors = instances.value.map((instance) => {
        const c = new THREE.Color(instance.color);
        return c.getHex();
    });
    const fieldRGB: PCDFields = {
        name: ['rgb'],
        type: ['I'],
        size: [4],
        value: (geometry, index) => [rgbColors[geometry.attributes.label.array[index]] ?? 0xffffff],
    };
    const buffer = dumpBinary(activeFrames.value, [
        FieldXYZ, fieldRGB,
    ]);

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl);
};
</script>
<style scoped>
</style>