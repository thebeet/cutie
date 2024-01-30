import { watchEffect, MaybeRefOrGetter, VNode, render, toValue } from 'vue';

export const addNodeToContainer = (node: VNode, container: MaybeRefOrGetter<HTMLDivElement | undefined>) => {
    watchEffect(() => {
        const dom = toValue(container);
        if (dom) {
            const wrap = document.createElement('div');
            render(node, wrap);
            dom.appendChild(wrap);
        }
    });
};