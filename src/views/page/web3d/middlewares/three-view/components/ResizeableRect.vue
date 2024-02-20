<template>
    <svg
        ref="container"
        xmlns="http://www.w3.org/2000/svg"
        class="svg-container"
        :style="{ cursor: initialRotatePosition ? 'grabbing' : 'auto' }"
        @mousedown.stop
        @mousemove.stop="mouseMove"
        @mouseup.stop="deselectControlPoint"
        @mouseleave="deselectControlPoint"
    >
        <rect
            v-for="(point, index) in controlPoints"
            :key="'control-point-' + index"
            :x="point.x - controlPointSize / 2"
            :y="point.y - controlPointSize / 2"
            :width="controlPointSize"
            :height="controlPointSize"
            fill="white"
            :style="{ cursor: point.cursor }"
            @mousedown.prevent.stop="selectControlPoint(point, $event)"
        />
        <line
            :x1="controlPoints[4].x"
            :y1="controlPoints[4].y"
            :x2="rotatePoint.x"
            :y2="rotatePoint.y"
            stroke="white"
        />
        <rect
            :x="rotatePoint.x - controlPointSize / 2"
            :y="rotatePoint.y - controlPointSize / 2"
            :width="controlPointSize"
            :height="controlPointSize"
            fill="white"
            :style="{ cursor: rotatePoint.cursor }"
            @mousedown.prevent.stop="rotateControlPoint($event)"
        />
    </svg>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { computed, ref } from 'vue';
import { RBox } from '@web3d/types';
import { useBoxHelper } from '../hooks/boxHelper';
import * as THREE from 'three';

const controlPointSize = 10;

type ControlPoint = {
    x: number
    y: number
    cursor: string
};
const props = defineProps<{
    outer: RBox
    name: 'front' | 'side' | 'top'
    x: 'x' | 'y' | 'z'
    y: 'x' | 'y' | 'z'
    camera: THREE.Camera
}>();

const modelValue = defineModel<RBox>({
    required: true
});

const emits = defineEmits<{
    (e: 'confirm', value: RBox): void
}>();

const { getBoxSize, getBoxPosition, setBoxSize, setBoxPosition, setBoxRotation, getControlPoints, getRotateControlPoint } = useBoxHelper();

const innerBoxX = computed({
    get: () => getBoxPosition(modelValue.value, props.name, props.x),
    set: (value) => setBoxPosition(modelValue.value, props.name, props.x, value),
});
const innerBoxY = computed({
    get: () => getBoxPosition(modelValue.value, props.name, props.y),
    set: (value) => setBoxPosition(modelValue.value, props.name, props.y, value),
});
const innerBoxWidth = computed({
    get: () => getBoxSize(modelValue.value, props.x),
    set: (value) => setBoxSize(modelValue.value, props.x, value),
});
const innerBoxHeight = computed({
    get: () => getBoxSize(modelValue.value, props.y),
    set: (value) => setBoxSize(modelValue.value, props.y, value),
});

const container = ref<SVGElement>();
const { width, height } = useElementSize(container);
const aspect = computed(() => height.value > 0 ? width.value / height.value : 1);

const outerBoxWidth = computed(() => Math.max(getBoxSize(props.outer, props.x), getBoxSize(props.outer, props.y) * aspect.value));
const outerBoxHeight = computed(() => Math.max(getBoxSize(props.outer, props.x) / aspect.value, getBoxSize(props.outer, props.y)));

const controlPoints = computed(() => getControlPoints(modelValue.value, props.x, props.y).map(({ pos, point }) => {
    const p = point.clone().project(props.camera);
    return {
        x: (p.x + 1) / 2 * width.value,
        y: (1 - p.y) / 2 * height.value,
        cursor: pos + '-resize'
    };
}) as ControlPoint[]);

const rotatePoint = computed(() => {
    const boxAspect = innerBoxWidth.value / innerBoxHeight.value;
    const point = getRotateControlPoint(modelValue.value, props.x, props.y, Math.min(Math.max(1, boxAspect / aspect.value) * 0.2, 1));
    const p = point.clone().project(props.camera);
    return {
        x: (p.x + 1) / 2 * width.value,
        y: (1 - p.y) / 2 * height.value,
        cursor: 'grab'
    };
});

const selectedControlPoint = ref<ControlPoint>();
const initialMousePosition = ref({ x: 0, y: 0 });

const selectControlPoint = (point: ControlPoint, event: MouseEvent) => {
    selectedControlPoint.value = point;
    initialMousePosition.value = { x: event.clientX, y: event.clientY };
    event.preventDefault();
};

const initialRotatePosition = ref<{x: number; y: number}>();
const rotateControlPoint = (event: MouseEvent) => {
    initialRotatePosition.value = { x: event.clientX, y: event.clientY };
};

const deselectControlPoint = () => {
    selectedControlPoint.value = undefined;
    initialRotatePosition.value = undefined;
    emits('confirm', modelValue.value);
};

const rotatePointMouseMove = (event: MouseEvent) => {
    if (initialRotatePosition.value) {
        const before = new THREE.Vector2(0, height.value / 2);
        const current = new THREE.Vector2(event.clientX - initialRotatePosition.value.x, event.clientY - initialRotatePosition.value.y + height.value / 2);
        const angle = Math.atan2(current.y, current.x) - Math.atan2(before.y, before.x);
        setBoxRotation(modelValue.value, props.name, angle);
        initialRotatePosition.value = { x: event.clientX, y: event.clientY };
    }
};

const mouseMove = (event: MouseEvent) => {
    rotatePointMouseMove(event);
    if (selectedControlPoint.value) {
        const dx = (event.clientX - initialMousePosition.value.x) * outerBoxWidth.value / width.value;
        const dy = (event.clientY - initialMousePosition.value.y) * outerBoxHeight.value / height.value;
        const current = {
            x: innerBoxX.value,
            y: innerBoxY.value,
            width: innerBoxWidth.value,
            height: innerBoxHeight.value,
        };
        switch (selectedControlPoint.value.cursor) {
        case 'nw-resize':
            current.x += dx / 2;
            current.y += dy / 2;
            current.width -= dx;
            current.height -= dy;
            break;
        case 'ne-resize':
            current.x += dx / 2;
            current.y += dy / 2;
            current.width += dx;
            current.height -= dy;
            break;
        case 'sw-resize':
            current.x += dx / 2;
            current.y += dy / 2;
            current.width -= dx;
            current.height += dy;
            break;
        case 'se-resize':
            current.x += dx / 2;
            current.y += dy / 2;
            current.width += dx;
            current.height += dy;
            break;
        case 'n-resize':
            current.y += dy / 2;
            current.height -= dy;
            break;
        case 's-resize':
            current.y += dy / 2;
            current.height += dy;
            break;
        case 'w-resize':
            current.x += dx / 2;
            current.width -= dx;
            break;
        case 'e-resize':
            current.x += dx / 2;
            current.width += dx;
            break;
        }
        const controlPointSize = 10 * outerBoxHeight.value / height.value;
        if (current.width >= controlPointSize) {
            innerBoxX.value = current.x;
            innerBoxWidth.value = current.width;
            initialMousePosition.value.x = event.clientX;
        }
        if (current.height >= controlPointSize) {
            innerBoxY.value = current.y;
            innerBoxHeight.value = current.height;
            initialMousePosition.value.y = event.clientY;
        }
    }
};
</script>

<style scope>
.svg-container {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
}
</style>