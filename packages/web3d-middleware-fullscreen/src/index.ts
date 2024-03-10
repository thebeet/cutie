import { h } from 'vue';
import { useDrama, addNodeToContainer } from '@cutie/web3d';
import ToolBox from './components/ToolBox.vue';

export const useMiddleware = () => {
    const { toolbox } = useDrama();
    addNodeToContainer(h(ToolBox), toolbox);
};