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
            v-if="hasView && controlPoints.length === 8"
            :x1="controlPoints[1].x"
            :y1="controlPoints[1].y"
            :x2="rotatePoint!.x"
            :y2="rotatePoint!.y"
            stroke="white"
        />
        <rect
            v-if="rotatePoint"
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
import { computed, onMounted, ref } from 'vue';
import { RBox } from '@cutie/web3d';
import { useBoxHelper } from '../hooks/boxHelper';
import * as THREE from 'three';
import { storeToRefs } from 'pinia';
import { useThreeViewStore } from '../stores';

const controlPointSize = 10;
type ControlPoint = {
    x: number
    y: number
    cursor: string
};
const props = defineProps<{
    outer: RBox
    name: 'front' | 'side' | 'top'
    camera: THREE.OrthographicCamera
}>();

const modelValue = defineModel<RBox>({
    required: true
});

const emits = defineEmits<{
    (e: 'confirm', value: RBox): void
}>();

const { isChanging } = storeToRefs(useThreeViewStore());

const { getBoxSize, getBoxPosition, setBoxRotation, getControlPoints, getRotateControlPoint, setBoxPositionAndSize } = useBoxHelper(props.name);

const innerBoxX = computed(() => getBoxPosition(modelValue.value, 'x'));
const innerBoxY = computed(() => getBoxPosition(modelValue.value, 'y'));
const innerBoxWidth = computed(() => getBoxSize(modelValue.value, 'x'));
const innerBoxHeight = computed(() => getBoxSize(modelValue.value, 'y'));

const container = ref<SVGElement>();
const { width, height } = useElementSize(container);

const hasView = computed(() => width.value > 0 && height.value > 0 && props.camera);
const aspect = computed(() => height.value > 0 ? width.value / height.value : 1);

const outerBoxWidth = computed(() => Math.max(getBoxSize(props.outer, 'x'), getBoxSize(props.outer, 'y') * aspect.value));
const outerBoxHeight = computed(() => Math.max(getBoxSize(props.outer, 'x') / aspect.value, getBoxSize(props.outer, 'y')));

const controlPoints = computed<ControlPoint[]>(() => hasView.value ? getControlPoints(modelValue.value).map(({ pos, point }) => {
    const p = point.clone().project(props.camera!);
    return {
        x: (p.x + 1) / 2 * width.value,
        y: (1 - p.y) / 2 * height.value,
        cursor: pos + '-resize'
    };
}) : []);

const rotatePoint = computed<ControlPoint | undefined>(() => {
    if (!hasView.value) { return undefined; }
    const boxAspect = innerBoxWidth.value / innerBoxHeight.value;
    const point = getRotateControlPoint(modelValue.value, Math.min(Math.max(1, boxAspect / aspect.value) * 0.2, 1));
    const p = point.clone().project(props.camera!);
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
    if (isChanging.value[props.name]) {
        isChanging.value[props.name] = false;
        selectedControlPoint.value = undefined;
        initialRotatePosition.value = undefined;
        emits('confirm', modelValue.value);
    }
};

const rotatePointMouseMove = (event: MouseEvent) => {
    if (initialRotatePosition.value) {
        isChanging.value[props.name] = true;
        const before = new THREE.Vector2(0, height.value / 2);
        const current = new THREE.Vector2(event.clientX - initialRotatePosition.value.x, event.clientY - initialRotatePosition.value.y + height.value / 2);
        const angle = Math.atan2(current.y, current.x) - Math.atan2(before.y, before.x);
        modelValue.value = setBoxRotation(modelValue.value, angle);
        initialRotatePosition.value = { x: event.clientX, y: event.clientY };
    }
};

const mouseMove = (event: MouseEvent) => {
    rotatePointMouseMove(event);
    if (selectedControlPoint.value && props.camera) {
        isChanging.value[props.name] = true;
        const dx = (event.clientX - initialMousePosition.value.x) * outerBoxWidth.value / width.value / props.camera.zoom;
        const dy = (event.clientY - initialMousePosition.value.y) * outerBoxHeight.value / height.value / props.camera.zoom;
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
        if (current.width < controlPointSize) {
            current.x = innerBoxX.value;
            current.width = innerBoxWidth.value;
        } else {
            initialMousePosition.value.x = event.clientX;
        }
        if (current.height < controlPointSize) {
            current.y = innerBoxY.value;
            current.height = innerBoxHeight.value;
        } else {
            initialMousePosition.value.y = event.clientY;
        }
        const delta = {
            x: current.x - innerBoxX.value,
            y: current.y - innerBoxY.value,
            width: current.width - innerBoxWidth.value,
            height: current.height - innerBoxHeight.value,
        };
        modelValue.value = setBoxPositionAndSize(modelValue.value, delta);
    }
};

onMounted(() => {
    isChanging.value[props.name] = false;
});
</script>

<style scope>
.svg-container {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
}
</style>