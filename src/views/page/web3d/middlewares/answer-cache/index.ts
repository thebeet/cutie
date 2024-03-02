import { useAnswerStore } from '@web3d/stores/answer';
import localforage from 'localforage';
import { useDrama } from '@web3d/hooks/drama';
import { AnswerContent } from '@web3d/types';
import { klona } from 'klona';

type Config = {
    auto: boolean
}

export const useMiddleware = (config: Partial<Config> = {}) => {
    const {
        auto = true,
    } = config;
    const answerStore = useAnswerStore();
    const { page } = useDrama();
    const key = `answer-${page.response!.id}`;
    const { useSetupAnswer, onApplyOperation } = answerStore;

    useSetupAnswer(async (ctx, next) => {
        const value = await localforage.getItem<AnswerContent>(key);
        if (value) {
            ctx.answer = value;
        }
        await next();
    });

    onApplyOperation(({ answer, save }) => {
        if (save && auto) {
            localforage.setItem(key, klona(answer));
        }
    });
};