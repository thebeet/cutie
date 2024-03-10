<template>
    <div class="toolbox-panel">
        <div class="toolbox-title">Parsing</div>
        <button type="button" class="toolbox-button" @click="click('rect')">Rect</button>
        <button type="button" class="toolbox-button" @click="click('polyline')">Polyline</button>
        <button type="button" class="toolbox-button" @click="box()">Box</button>
        <button type="button" class="toolbox-button" @click="dump()">Dump</button>
    </div>
</template>
<script lang="ts" setup>
import { useDrama } from '@cutie/web3d';
import { dumpBinary, PCDField, FieldX, FieldY, FieldZ } from '../features/dump';
import { useParsingStore } from '../stores';
import { storeToRefs } from 'pinia';
import * as THREE from 'three';

const { activeTool, mouseState, frames } = useDrama();
const { instances, boxParsing } = storeToRefs(useParsingStore());

const click = (mode: string) => {
    activeTool.value = 'parsing';
    mouseState.value = mode;
    boxParsing.value = false;
};

const box = () => {
    activeTool.value = 'parsing';
    mouseState.value = 'rect';
    boxParsing.value = true;
};

const dump = () => {
    const rgbColors = instances.value.map((instance) => {
        const c = new THREE.Color(instance.color);
        return c.getHex();
    });
    const fieldRGB: PCDField = {
        name: 'rgb',
        type: 'I',
        size: 4,
        value: (geometry, index) => rgbColors[geometry.attributes.label.array[index]] ?? 0xffffff,
    };
    const buffer = dumpBinary(frames[1].points!, [
        FieldX, FieldY, FieldZ, fieldRGB,
    ]);

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl);
};
</script>
<style scoped>
</style>