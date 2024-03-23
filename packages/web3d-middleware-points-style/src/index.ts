import { h } from 'vue';
import { addNodeToContainer, useDrama } from '@cutie/web3d';
import ToolBox from './components/ToolBox.vue';
import { usePointsStyleStore } from './stores';

export const useMiddleware = () => {
    const { toolbox } = useDrama();
    usePointsStyleStore();
    addNodeToContainer(h(ToolBox), toolbox);
};