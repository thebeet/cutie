import { useDrama, addNodeToContainer } from '@cutie/web3d';
import { h } from 'vue';

import ToolBox from './components/ToolBox.vue';
import ContainerComponent from './components/ContainerComponent.vue';

export const usePlugin = () => {
    const { container, toolbox } = useDrama();
    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(ContainerComponent), container);
};