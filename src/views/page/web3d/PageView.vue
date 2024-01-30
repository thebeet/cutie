<template>
    <div class="main-wrap">
        <div class="header">header</div>
        <div class="main-container">
            <div ref="toolbox" class="leftsidebar">
                <CommonToolBox/>
            </div>
            <div class="main">
                <div ref="container" class="main-canvas">
                    <MouseActionPreview/>
                </div>
                <div ref="footer" class="main-footer">
                    <div class="frame-pagination-container">
                        <div
                            v-for="frame in frames"
                            :key="frame.index"
                            class="frame-pagination"
                            @click="() => selectFrame(frame.index)"
                        >{{frame.index}}</div>
                    </div>
                </div>
            </div>
            <div ref="rightsidebar" class="rightsidebar">
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Page } from '@web3d/types';
import { useDrama } from '@web3d/hooks/drama';
import { usePageStore } from '@web3d/stores/page';
import MouseActionPreview from '@web3d/components/MouseActionPreview.vue';
import CommonToolBox from '@web3d/components/CommonToolBox.vue';

const props = defineProps<{
    page: Page
}>();

const container = ref<HTMLDivElement>();
const toolbox = ref<HTMLDivElement>();
const rightsidebar = ref<HTMLDivElement>();

usePageStore(props.page);
const { frames, selectFrame, launch } = useDrama(container, toolbox, rightsidebar);

onMounted(async () => {
    const middlewares = [
        { name: 'render-sampling' },
        { name: 'spatial-indexing', params: { impl: 'octree' } },
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

.frame-pagination-container {
    display: flex;
    padding: 8px;
    column-gap: 8px;
}
.frame-pagination {
    width: 16px;
    height: 16px;
    border: 1px solid #333333;
    font-size: 12px;
    text-align: center;
}
</style>