import { useDrama } from '@web3d/hooks/drama';
import ViewComponent from './components/ViewComponent.vue';
import { addNodeToContainer } from '@web3d/plugins';
import { useThreeViewStore } from './stores';
import { h } from 'vue';

export const useMiddleware = () => {
    const { container } = useDrama();
    useThreeViewStore();
    addNodeToContainer(h(ViewComponent), container);
};