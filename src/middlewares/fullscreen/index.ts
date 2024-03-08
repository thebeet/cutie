import { addNodeToContainer } from '@web3d/plugins';
import { h } from 'vue';
import { useDrama } from '@web3d/hooks/drama';
import ToolBox from './components/ToolBox.vue';

export const useMiddleware = () => {
    const { toolbox } = useDrama();
    addNodeToContainer(h(ToolBox), toolbox);
};