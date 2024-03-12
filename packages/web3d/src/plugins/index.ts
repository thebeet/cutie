import { watchEffect, MaybeRefOrGetter, VNode, render, toValue } from 'vue';

const plugins: { [key: string]: () => Promise<any> } = {};

export const addNodeToContainer = (node: VNode, container: MaybeRefOrGetter<HTMLDivElement | undefined>) => {
    watchEffect(() => {
        const dom = toValue(container);
        if (dom) {
            const wrap = document.createElement('div');
            render(node, wrap);
            dom.appendChild(wrap.childNodes[0]);
        }
    });
};

export const registerPlugin = (id: string, importer: () => Promise<any>) => {
    plugins[id] = importer;
};

export const runPlugin = (id: string) => {
    if (id in plugins) {
        return plugins[id]();
    } else {
        // eslint-disable-next-line no-console
        console.warn(`Plugin [${id}] not exists.`);
        return Promise.resolve();
    }
};
