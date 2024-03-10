import { useAdvanceDrama, addNodeToContainer } from '@cutie/web3d';
import { h, watch } from 'vue';
import MouseActionPreview from './components/MouseActionPreview.vue';
import { drawRect } from './actions/rect';
import { drawPolyline } from './actions/polyline';
import { click } from './actions/click';
import { hover } from './actions/hover';

export const useMiddleware = () => {
    const { container, renderer, mouseState, mouseEvent, mouseEventHook } = useAdvanceDrama();
    const mainCanvas = renderer.domElement;
    click(mainCanvas, true, mouseEvent, mouseEventHook);
    hover(mainCanvas, true, mouseEvent, mouseEventHook);

    drawRect(mainCanvas, () => mouseState.value === 'rect', mouseEvent, mouseEventHook);
    drawPolyline(mainCanvas, () => mouseState.value === 'polyline', mouseEvent, mouseEventHook);

    watch(mouseState, (value) => {
        if (value === 'rect' || value === 'polyline') {
            mainCanvas.style.cursor = 'crosshair';
        } else {
            mainCanvas.style.cursor = 'auto';
        }
    });

    addNodeToContainer(h(MouseActionPreview), container);
};