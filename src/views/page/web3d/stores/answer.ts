import { ref, readonly, nextTick } from 'vue';
import { AnswerContent } from '../types';
import { GroupOperation, Operation } from '../operator/Operation';
import { defineStore } from 'pinia';
import { Composer } from 'middleware-io';
import { createEventHook } from '@vueuse/core';

export const useAnswerStore = defineStore('answer', () => {
    const answer = ref<AnswerContent>({
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

    const applyOperationEvent = createEventHook<{ answer: AnswerContent, operation: Operation, save?: boolean }>();
    const composedApplyOperation = new Composer<{ answer: AnswerContent, operation: Operation, save?: boolean }>();
    composedApplyOperation.use(async (ctx, next) => {
        await next();
        ctx.answer = ctx.operation.apply(ctx.answer);
        applyOperationEvent.trigger({ answer: ctx.answer, operation: ctx.operation, save: ctx.save });
    });
    const ops: Operation[] = [];
    const applyOperation = (operation: Operation, save: boolean = true) => {
        ops.push(operation);

        nextTick(() => {
            if (ops.length > 0) {
                if (ops.length === 1) {
                    const operation = ops[0];
                    composedApplyOperation.compose()({ answer: answer.value, operation, save }, () => {
                        return Promise.resolve();
                    });
                } else {
                    const operation = new GroupOperation(ops);
                    composedApplyOperation.compose()({ answer: answer.value, operation, save }, () => {
                        return Promise.resolve();
                    });
                }
                ops.splice(0, ops.length);
            }
        });
        return ;
    };

    return {
        answer: readonly(answer),
        setupAnswer, useSetupAnswer: composedSetupAnswer.use.bind(composedSetupAnswer), onSetupAnswer: setupAnswerEvent.on,
        applyOperation, useApplyOperation: composedApplyOperation.use.bind(composedApplyOperation), onApplyOperation: applyOperationEvent.on,

        originAnswer: answer,
    };
});