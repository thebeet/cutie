<template>
    <div class="main-wrap">
        <div class="header">header<svg-icon type="mdi" :path="mdiCar"></svg-icon></div>
        <div class="main-container">
            <div ref="toolbox" class="leftsidebar"/>
            <div class="main">
                <div ref="container" class="main-canvas"/>
                <div ref="footer" class="main-footer"/>
            </div>
            <div ref="rightsidebar" class="rightsidebar"/>
        </div>
        <div class="statusbar"/>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Page, runPlugin, useDrama } from '@cutie/web3d';
import { mdiCar } from '@mdi/js';

const props = defineProps<{
    page: Page
}>();

const container = ref<HTMLDivElement>();
const toolbox = ref<HTMLDivElement>();
const footer = ref<HTMLDivElement>();
const rightsidebar = ref<HTMLDivElement>();

const { launch } = useDrama(props.page, container, toolbox, footer, rightsidebar);

onMounted(async () => {
    const middlewares = [
        { name: 'camera-control', params: { } },
        { name: 'frame-pagination', params: { } },
        { name: 'answer-cache', params: { auto: false } },
        { name: 'answer-history', params: { } },
        { name: 'render-sampling', params: { } },
        { name: 'spatial-indexing', params: { impl: 'octree' } },
        { name: 'three-view', params: { } },
        { name: 'fullscreen', params: { } },
        { name: 'mouse', params: { } },
        { name: 'points-style', params: { mode: 'label' } },
        { name: 'pcd-loader', params: { } },
        { name: 'render-info', params: { } },
        { name: 'benchmark', params: { } },
    ];

    for (const middleware of middlewares) {
        await runPlugin(middleware.name).then(({ useMiddleware }) => {
            useMiddleware && useMiddleware(middleware.params);
        });
    }
    for (const plugin of props.page.template.plugins) {
        await runPlugin(plugin.name).then(({ usePlugin }) => {
            usePlugin && usePlugin(plugin.params);
        });
    }
    launch();
});
</script>

<style scoped>
.main-wrap {
    display: flex;
    flex-direction: column;
    height: 100vh;
}
.header {
    height: 60px;
}
.main-container {
    display: flex;
    flex-grow: 1;
    min-height: 1px;
}
.leftsidebar {
    width: 160px;
    flex-shrink: 0;
}
.main {
    flex-grow: 1;
    min-width: 1rem;
    display: flex;
    flex-direction: column;
}
.main-canvas {
    flex: 1;
    position: relative;
    background-color: black;
}

.rightsidebar {
    width: 320px;
    flex-shrink: 0;
}

.statusbar {
    height: 22px;
    background-color: grey;
}

</style>