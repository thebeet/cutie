import localforage from 'localforage';
import { useAdvanceDrama, useDrama } from '@web3d/hooks/drama';
import { AnswerContent } from '@web3d/types';
import { useAnswerCacheStore } from './stores';
import { addNodeToContainer } from '@web3d/plugins';
import { h } from 'vue';
import ToolBox from './components/ToolBox.vue';
import { storeToRefs } from 'pinia';

type Config = {
    auto: boolean
}

export const useMiddleware = (config: Partial<Config> = {}) => {
    const {
        auto = true,
    } = config;
    const { toolbox } = useDrama();
    const { autoSave } = storeToRefs(useAnswerCacheStore());
    const { key } = useAnswerCacheStore();
    const { useSetupAnswer } = useAdvanceDrama();

    autoSave.value = auto;

    useSetupAnswer(async (ctx, next) => {
        const value = await localforage.getItem<AnswerContent>(key);
        if (value) {
            ctx.answer = value;
        }
        await next();
    });

    addNodeToContainer(h(ToolBox), toolbox);
};