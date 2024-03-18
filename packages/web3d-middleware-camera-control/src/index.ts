import { useAdvanceDrama, addNodeToContainer } from '@cutie/web3d';
import ToolBox from './components/ToolBox.vue';
import { h } from 'vue';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper.js';

export const useMiddleware = () => {
    const { toolbox, camera, renderer, onRender } = useAdvanceDrama();

    const viewHelper = new ViewHelper(camera, renderer.domElement);
    onRender(() => viewHelper.render(renderer));

    addNodeToContainer(h(ToolBox), toolbox);
};