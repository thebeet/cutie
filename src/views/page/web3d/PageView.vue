<template>
    <div class="main-wrap">
        <div class="header">header</div>
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
import { ref, onMounted } from 'vue';
import { Page } from '@web3d/types';
import { useDrama } from '@web3d/hooks/drama';
import { usePageStore } from '@web3d/stores/page';
import MouseActionPreview from '@web3d/components/MouseActionPreview.vue';

const props = defineProps<{
    page: Page
}>();

const container = ref<HTMLDivElement>();
const toolbox = ref<HTMLDivElement>();
const footer = ref<HTMLDivElement>();
const rightsidebar = ref<HTMLDivElement>();

usePageStore(props.page);
const { launch } = useDrama(container, toolbox, footer, rightsidebar);

onMounted(async () => {
    const middlewares = [
        { name: 'camera-control' },
        { name: 'frame-pagination' },
        { name: 'answer-cache' },
        { name: 'answer-history' },
        { name: 'render-sampling' },
        { name: 'spatial-indexing', params: { impl: 'octree' } },
        { name: 'three-view' },
        { name: 'fullscreen' },
        { name: 'mouse' },
    ];
    for (const middleware of middlewares) {
        await import(`./middlewares/${middleware.name}/index.ts`).then(({ useMiddleware }) => {
            useMiddleware(middleware);
        });
    };
    for (const plugin of props.page.template.plugins) {
        await import(`./plugins/${plugin.name}/index.ts`).then(({ usePlugin }) => {
            usePlugin(plugin);
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
}

.statusbar {
    height: 22px;
    background-color: grey;
}

</style>