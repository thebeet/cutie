import { useDrama, addNodeToContainer } from '@cutie/web3d';
import ToolBox from './components/ToolBox.vue';
import { h } from 'vue';

export const useMiddleware = () => {
    const { toolbox } = useDrama();

    addNodeToContainer(h(ToolBox), toolbox);
};