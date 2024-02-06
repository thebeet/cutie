import { useDrama } from '@web3d/hooks/drama';
import PaginationView from './components/PaginationView.vue';
import ToolBox from './components/ToolBox.vue';
import { addNodeToContainer } from '..';
import { h } from 'vue';

export const usePlugin = () => {
    const { toolbox, footer } = useDrama();

    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(PaginationView), footer);
};