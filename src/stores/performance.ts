import { defineStore } from 'pinia';
import { ref } from 'vue';

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
    const performances = ref<Record<string, PerformanceStatistic>>({});
    const begin = (key: string) => {
        const span = {
            start: Date.now(),
            end: -1
        };
        if (!(key in performances.value)) {
            performances.value[key] = {
                count: 0,
                avg: 0,
                total: 0,
                spans: []
            };
        }
        performances.value[key].spans.push(span);
        return {
            done: () => {
                span.end = Date.now();
                const duration = span.end - span.start;
                performances.value[key].total += duration;
                performances.value[key].count++;
                performances.value[key].avg = performances.value[key].total / performances.value[key].count;
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
    };
});

const {
    begin,
    measure
} = usePerformanceStore();

export {
    begin,
    measure
};


