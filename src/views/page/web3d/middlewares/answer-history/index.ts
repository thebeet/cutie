import { h, watchEffect, toValue, render, VNode, MaybeRefOrGetter } from 'vue';
import { useDrama } from '@web3d/hooks/drama';
import ToolBox from './components/ToolBox.vue';
import { useAnswerHistoryStore } from './stores/answer';

const addNodeToContainer = (node: VNode, container: MaybeRefOrGetter<HTMLDivElement | undefined>) => {
    watchEffect(() => {
        const dom = toValue(container);
        if (dom) {
            const wrap = document.createElement('div');
            render(node, wrap);
            dom.appendChild(wrap);
        }
    });
};

export const useMiddleware = () => {
    const { toolbox } = useDrama();
    useAnswerHistoryStore();
    addNodeToContainer(h(ToolBox), toolbox);
};