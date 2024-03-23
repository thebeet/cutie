import { h } from 'vue';
import { addNodeToContainer, useDrama } from '@cutie/web3d';
import MetricPanel from './components/MetricPanel.vue';

export const useMiddleware = () => {
    const { container } = useDrama();
    addNodeToContainer(h(MetricPanel), container);
};