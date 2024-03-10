import localforage from 'localforage';
import { useAdvanceDrama, useDrama, AnswerContent, addNodeToContainer } from '@cutie/web3d';
import { useAnswerCacheStore } from './stores';
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