import { useDrama } from '@web3d/hooks/drama';
import ViewComponent from './components/ViewComponent.vue';
import { addNodeToContainer } from '..';
import { h } from 'vue';

export const usePlugin = () => {
    const { container } = useDrama();

    addNodeToContainer(h(ViewComponent), container);
};