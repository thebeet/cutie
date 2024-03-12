import { shallowRef, readonly } from 'vue';
import { AnswerContent, Operation } from '../types';
import { defineStore } from 'pinia';
import { Composer } from 'middleware-io';
import { createEventHook } from '@vueuse/core';

export const useAnswerStore = defineStore('answer', () => {
    const answer = shallowRef<AnswerContent>({
        elements: []
    });

    const setupAnswerEvent = createEventHook<{ answer: AnswerContent }>();
    const composedSetupAnswer = new Composer<{ answer: AnswerContent }>();
    composedSetupAnswer.use(async (ctx, next) => {
        await next();
        answer.value = ctx.answer;
        setupAnswerEvent.trigger({ answer: answer.value });
    });
    const setupAnswer = (answer: AnswerContent) => {
        return composedSetupAnswer.compose()({ answer }, () => {
            return Promise.resolve();
        });
    };

    const applyOperationEvent = createEventHook<{ answer: AnswerContent, operation: Operation }>();
    const composedApplyOperation = new Composer<{ answer: AnswerContent, operation: Operation }>();
    composedApplyOperation.use(async (ctx, next) => {
        await next();
        ctx.answer = ctx.operation.apply(ctx.answer);
        answer.value = ctx.answer;
        applyOperationEvent.trigger({ answer: ctx.answer, operation: ctx.operation });
    });
    const applyOperation = (operation: Operation) => {
        composedApplyOperation.compose()({ answer: answer.value, operation }, () => {
            return Promise.resolve();
        });
    };

    return {
        answer: readonly(answer),
        setupAnswer, useSetupAnswer: composedSetupAnswer.use.bind(composedSetupAnswer), onSetupAnswer: setupAnswerEvent.on,
        applyOperation, useApplyOperation: composedApplyOperation.use.bind(composedApplyOperation), onApplyOperation: applyOperationEvent.on,

        originAnswer: answer,
    } as const;
});