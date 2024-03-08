import { defineStore } from 'pinia';

type PerformanceSpan = {
    start: number
    end: number
}

type PerformanceStatistic = {
    count: number
    avg: number
    total: number
    spans: PerformanceSpan[]
}

export const usePerformanceStore = defineStore('performance', () => {
    const MAX_SPAN_COUNT = 20;
    const performances: Record<string, PerformanceStatistic> = {};
    const begin = (key: string) => {
        const span = {
            start: Date.now(),
            end: -1
        };
        if (!(key in performances)) {
            performances[key] = {
                count: 0,
                avg: 0,
                total: 0,
                spans: []
            };
        }
        if (performances[key].spans.length >= MAX_SPAN_COUNT) {
            performances[key].spans.splice(0, performances[key].spans.length - MAX_SPAN_COUNT + 1);
        }
        performances[key].spans.push(span);
        return {
            done: () => {
                span.end = Date.now();
                const duration = span.end - span.start;
                performances[key].total += duration;
                performances[key].count++;
                performances[key].avg = performances[key].total / performances[key].count;
                return span.end - span.start;
            }
        };
    };

    const measure = <T extends (...args: any) => any>(key: string, callback: T): T => {
        return function(...args: any) {
            const { done } = begin(key);
            // @ts-ignore
            const ret = callback.apply(this, args);
            done();
            return ret;
        } as T;
    };

    return {
        performances,
        begin,
        measure
    } as const;
});