import { useAdvanceDrama } from '@web3d/hooks/drama';
import { addNodeToContainer } from '@web3d/plugins';
import { h, toValue, watch } from 'vue';
import MouseActionPreview from './components/MouseActionPreview.vue';
import { drawRect } from './actions/rect';
import { drawPolyline } from './actions/polyline';
import { click } from './actions/click';
import { hover } from './actions/hover';

export const useMiddleware = () => {
    const { container, mouseState, mouseEvent, mouseEventHook } = useAdvanceDrama();

    click(container, true, mouseEvent, mouseEventHook);
    hover(container, true, mouseEvent, mouseEventHook);

    drawRect(container, () => mouseState.value === 'rect', mouseEvent, mouseEventHook);
    drawPolyline(container, () => mouseState.value === 'polyline', mouseEvent, mouseEventHook);

    watch(mouseState, (value) => {
        if (value === 'rect' || value === 'polyline') {
            toValue(container).style.cursor = 'crosshair';
        } else {
            toValue(container).style.cursor = 'auto';
        }
    });

    addNodeToContainer(h(MouseActionPreview), container);
};