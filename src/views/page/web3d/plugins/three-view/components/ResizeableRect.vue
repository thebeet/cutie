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
import { computed, reactive, ref, watchEffect } from 'vue';

const controlPointSize = 10;

type ControlPoint = {
    x: number
    y: number
    cursor: string
};
const props = defineProps<{
    current: {
        x: number
        y: number
        width: number
        height: number
    }
}>();

const container = ref<SVGElement>();

const rect = reactive({
    x: 50,
    y: 10,
    width: 100,
    height: 50
});

watchEffect(() => {
    if (container.value) {
        const domRect = container.value.getBoundingClientRect();
        rect.x = props.current.x * domRect.width;
        rect.y = props.current.y * domRect.height;
        rect.width = props.current.width * domRect.width;
        rect.height = props.current.height * domRect.height;
    }
});

const controlPoints = computed(() => {
    const points: ControlPoint[] = [];
    // 四个角的控制点
    points.push({ x: rect.x, y: rect.y, cursor: 'nw-resize' }); // 左上角
    points.push({ x: rect.x + rect.width, y: rect.y, cursor: 'ne-resize' }); // 右上角
    points.push({ x: rect.x, y: rect.y + rect.height, cursor: 'sw-resize' }); // 左下角
    points.push({ x: rect.x + rect.width, y: rect.y + rect.height, cursor: 'se-resize' }); // 右下角
    // 四条边的中点控制点
    points.push({ x: rect.x + rect.width / 2, y: rect.y, cursor: 'n-resize' }); // 上中点
    points.push({ x: rect.x, y: rect.y + rect.height / 2, cursor: 'w-resize' }); // 左中点
    points.push({ x: rect.x + rect.width, y: rect.y + rect.height / 2, cursor: 'e-resize' }); // 右中点
    points.push({ x: rect.x + rect.width / 2, y: rect.y + rect.height, cursor: 's-resize' }); // 下中点
    return points;
});


const selectedControlPoint = ref<ControlPoint>();
const initialMousePosition = ref({ x: 0, y: 0 });

const selectControlPoint = (point: ControlPoint, event: MouseEvent) => {
    selectedControlPoint.value = point;
    initialMousePosition.value = { x: event.clientX, y: event.clientY };
    // 防止拖动时发生选中页面上的文本，导致不必要的UI问题
    event.preventDefault();
};

const deselectControlPoint = () => {
    selectedControlPoint.value = undefined;
};

const mouseMove = (event: MouseEvent) => {
    if (!selectedControlPoint.value) return;
    // 计算鼠标位置的变化
    const dx = event.clientX - initialMousePosition.value.x;
    const dy = event.clientY - initialMousePosition.value.y;
    // 更新矩形的位置和大小
    switch (selectedControlPoint.value.cursor) {
    case 'nw-resize':
        rect.x += dx;
        rect.y += dy;
        rect.width -= dx;
        rect.height -= dy;
        break;
    case 'ne-resize':
        rect.y += dy;
        rect.width += dx;
        rect.height -= dy;
        break;
    case 'sw-resize':
        rect.x += dx;
        rect.width -= dx;
        rect.height += dy;
        break;
    case 'se-resize':
        rect.width += dx;
        rect.height += dy;
        break;
    case 'n-resize':
        rect.y += dy;
        rect.height -= dy;
        break;
    case 's-resize':
        rect.height += dy;
        break;
    case 'w-resize':
        rect.x += dx;
        rect.width -= dx;
        break;
    case 'e-resize':
        rect.width += dx;
        break;
    }
    rect.width = Math.max(rect.width, controlPointSize);
    rect.height = Math.max(rect.height, controlPointSize);
    // 更新初始鼠标位置
    initialMousePosition.value = { x: event.clientX, y: event.clientY };
};
</script>

<style scope>
.svg-container {
    width:100%;
    height:100%;
}
</style>