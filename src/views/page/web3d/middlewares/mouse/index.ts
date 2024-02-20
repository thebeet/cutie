import { useAdvanceDrama } from '@web3d/hooks/drama';
import { addNodeToContainer } from '@web3d/plugins';
import { h, computed } from 'vue';
import MouseActionPreview from './components/MouseActionPreview.vue';
import { drawRect } from './actions/rect';

export const useMiddleware = () => {
    const { container, mouseState, mouseEvent, mouseEventHook } = useAdvanceDrama();

    drawRect(container, computed(() => mouseState.value === 'rect'), mouseEvent, mouseEventHook);

    addNodeToContainer(h(MouseActionPreview), container);
};