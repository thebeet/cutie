import { useAdvanceDrama, addNodeToContainer } from '@cutie/web3d';
import ToolBox from './components/ToolBox.vue';
import { h } from 'vue';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper.js';
import * as THREE from 'three';

export const useMiddleware = () => {
    const { toolbox, camera, renderer, onRender } = useAdvanceDrama();

    const viewHelper = new ViewHelper(camera, renderer.domElement);
    viewHelper.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
            obj.material.name = 'viewhelper';
        } else if (obj instanceof THREE.Sprite) {
            obj.material.name = 'viewhelper::sprite';
        }
    });
    onRender(() => viewHelper.render(renderer));

    addNodeToContainer(h(ToolBox), toolbox);
};