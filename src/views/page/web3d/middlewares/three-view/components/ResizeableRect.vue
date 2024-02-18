<template>
    <svg
        ref="container"
        xmlns="http://www.w3.org/2000/svg"
        class="svg-container"
        @mousemove="mouseMove"
        @mouseup="deselectControlPoint"
        @mouseleave="deselectControlPoint"
    >
        <rect
            :x="rect.x"
            :y="rect.y"
            :width="rect.width"
            :height="rect.height"
        />
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
    </svg>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { computed, ref } from 'vue';
import { RBox } from '@web3d/types';
import { useBoxHelper } from '../hooks/boxHelper';

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
}>();

const modelValue = defineModel<RBox>({
    required: true
});

const emits = defineEmits<{
    (e: 'confirm', value: RBox): void
}>();

const { getBoxSize, getBoxPosition, setBoxSize, setBoxPosition } = useBoxHelper();

const innerBoxX = computed({
    get: () => getBoxPosition(modelValue.value, props.name, props.x),
    set: (value) => {
        setBoxPosition(modelValue.value, props.name, props.x, value);
    },
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

const outerBoxX = computed(() => getBoxPosition(props.outer, props.name, props.x));
const outerBoxY = computed(() => getBoxPosition(props.outer, props.name, props.y));
const outerBoxWidth = computed(() => Math.max(getBoxSize(props.outer, props.x), getBoxSize(props.outer, props.y) * aspect.value));
const outerBoxHeight = computed(() => Math.max(getBoxSize(props.outer, props.x) / aspect.value, getBoxSize(props.outer, props.y)));

const rect = computed(() => ({
    x: ((innerBoxX.value - innerBoxWidth.value / 2) - (outerBoxX.value - outerBoxWidth.value / 2)) / outerBoxWidth.value * width.value,
    y: ((innerBoxY.value - innerBoxHeight.value / 2) - (outerBoxY.value - outerBoxHeight.value / 2)) / outerBoxHeight.value * height.value,
    width: innerBoxWidth.value / outerBoxWidth.value * width.value,
    height: innerBoxHeight.value / outerBoxHeight.value * height.value,
}));

const controlPoints = computed(() => {
    const points: ControlPoint[] = [];
    // 四个角的控制点
    points.push({ x: rect.value.x, y: rect.value.y, cursor: 'nw-resize' }); // 左上角
    points.push({ x: rect.value.x + rect.value.width, y: rect.value.y, cursor: 'ne-resize' }); // 右上角
    points.push({ x: rect.value.x, y: rect.value.y + rect.value.height, cursor: 'sw-resize' }); // 左下角
    points.push({ x: rect.value.x + rect.value.width, y: rect.value.y + rect.value.height, cursor: 'se-resize' }); // 右下角
    // 四条边的中点控制点
    points.push({ x: rect.value.x + rect.value.width / 2, y: rect.value.y, cursor: 'n-resize' }); // 上中点
    points.push({ x: rect.value.x, y: rect.value.y + rect.value.height / 2, cursor: 'w-resize' }); // 左中点
    points.push({ x: rect.value.x + rect.value.width, y: rect.value.y + rect.value.height / 2, cursor: 'e-resize' }); // 右中点
    points.push({ x: rect.value.x + rect.value.width / 2, y: rect.value.y + rect.value.height, cursor: 's-resize' }); // 下中点
    return points;
});

const selectedControlPoint = ref<ControlPoint>();
const initialMousePosition = ref({ x: 0, y: 0 });

const selectControlPoint = (point: ControlPoint, event: MouseEvent) => {
    selectedControlPoint.value = point;
    initialMousePosition.value = { x: event.clientX, y: event.clientY };
    event.preventDefault();
};

const deselectControlPoint = () => {
    selectedControlPoint.value = undefined;
    emits('confirm', modelValue.value);
};

const mouseMove = (event: MouseEvent) => {
    if (!selectedControlPoint.value) return;
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