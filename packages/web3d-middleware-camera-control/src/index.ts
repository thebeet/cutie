import { useDrama } from '@cutie/web3d';
import ToolBox from './components/ToolBox.vue';
import { addNodeToContainer } from '@cutie/web3d';
import { h } from 'vue';

export const useMiddleware = () => {
    const { toolbox } = useDrama();

    addNodeToContainer(h(ToolBox), toolbox);
};