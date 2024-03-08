import { useDrama } from '@web3d/hooks/drama';
import { h } from 'vue';

import ToolBox from './components/ToolBox.vue';
import ContainerComponent from './components/ContainerComponent.vue';

import { addNodeToContainer } from '../index';

export const usePlugin = () => {
    const { container, toolbox } = useDrama();
    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(ContainerComponent), container);
};