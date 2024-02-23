import { useAdvanceDrama } from '@web3d/hooks/drama';
import { addNodeToContainer } from '@web3d/plugins';
import { h } from 'vue';
import MouseActionPreview from './components/MouseActionPreview.vue';
import { drawRect } from './actions/rect';
import { drawPolyline } from './actions/polyline';
import { click } from './actions/click';

export const useMiddleware = () => {
    const { container, mouseState, mouseEvent, mouseEventHook } = useAdvanceDrama();

    click(container, true, mouseEvent, mouseEventHook);

    drawRect(container, () => mouseState.value === 'rect', mouseEvent, mouseEventHook);
    drawPolyline(container, () => mouseState.value === 'polyline', mouseEvent, mouseEventHook);

    addNodeToContainer(h(MouseActionPreview), container);
};