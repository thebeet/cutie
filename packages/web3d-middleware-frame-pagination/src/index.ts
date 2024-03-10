import { useDrama, addNodeToContainer } from '@cutie/web3d';
import PaginationView from './components/PaginationView.vue';
import ToolBox from './components/ToolBox.vue';
import { h } from 'vue';

export const useMiddleware = () => {
    const { toolbox, footer } = useDrama();

    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(PaginationView), footer);
};