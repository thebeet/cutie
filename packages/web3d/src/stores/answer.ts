import { shallowRef, toRaw } from 'vue';
import { AnswerContent, Operation } from '../types';
import { defineStore } from 'pinia';
import { Composer } from 'middleware-io';
import { createEventHook } from '@vueuse/core';

export const useAnswerStore = defineStore('answer', () => {
    const answer = shallowRef<AnswerContent>({ elements: [] });

    const setupAnswerEvent = createEventHook<{ answer: AnswerContent }>();
    const composedSetupAnswer = new Composer<{ answer: AnswerContent }>();
    composedSetupAnswer.use(async (ctx, next) => {
        await next();
        answer.value = toRaw(ctx.answer);
        setupAnswerEvent.trigger({ answer: answer.value });
    });
    const setupAnswer = (answer: AnswerContent) => {
        return composedSetupAnswer.compose()({ answer }, () => Promise.resolve());
    };

    const applyOperationEvent = createEventHook<{ answer: AnswerContent, operation: Operation }>();
    const composedApplyOperation = new Composer<{ answer: AnswerContent, operation: Operation }>();
    composedApplyOperation.use((ctx, next) => {
        next();
        ctx.answer = ctx.operation.apply(ctx.answer);
        answer.value = toRaw(ctx.answer);
        applyOperationEvent.trigger({ answer: ctx.answer, operation: ctx.operation });
    });
    const applyOperation = (operation: Operation) => {
        composedApplyOperation.compose()({ answer: answer.value, operation }, () => Promise.resolve());
    };

    return {
        answer,
        setupAnswer, useSetupAnswer: composedSetupAnswer.use.bind(composedSetupAnswer), onSetupAnswer: setupAnswerEvent.on,
        applyOperation, useApplyOperation: composedApplyOperation.use.bind(composedApplyOperation), onApplyOperation: applyOperationEvent.on,
    } as const;
});