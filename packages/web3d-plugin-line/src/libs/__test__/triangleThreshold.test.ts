import { triangleThreshold } from '../triangleThreshold';
import { describe, expect, it } from 'vitest';

describe('triangleThreshold', () => {
    it('should return -1 for an empty histogram', () => {
        const histogram = new Uint32Array();
        expect(triangleThreshold(histogram)).toBe(-1);
    });

    it('should return -1 for a all-zero histogram', () => {
        const histogram = new Uint32Array(256).fill(0);
        expect(triangleThreshold(histogram)).toBe(-1);
    });

    it('should handle a histogram with only one non-zero data', () => {
        const histogram = new Uint32Array(256).fill(0);
        histogram[3] = 10;
        expect(triangleThreshold(histogram)).toBe(3);
    });

    it('should handle a histogram with only two non-zero data', () => {
        const histogram = new Uint32Array(256).fill(0);
        histogram[3] = 10;
        histogram[5] = 3;
        expect(triangleThreshold(histogram)).toBe(4);
    });

    it('should handle a histogram with a peak at the end', () => {
        const histogram = new Uint32Array(256).fill(0);
        [2, 2, 3, 6, 10].forEach((v, i) => histogram[i] = v);
        expect(triangleThreshold(histogram)).toBe(2);
    });

    it('should handle a histogram with a peak at the beginning', () => {
        const histogram = new Uint32Array(256).fill(0);
        [10, 6, 3, 2, 2].forEach((v, i) => histogram[i] = v);
        expect(triangleThreshold(histogram)).toBe(2);
    });

    it('should handle a histogram with a peak at the end, with zeros', () => {
        const histogram = new Uint32Array(256).fill(0);
        [0, 0, 2, 2, 3, 6, 10].forEach((v, i) => histogram[i] = v);
        expect(triangleThreshold(histogram)).toBe(4);
    });

    it('should handle a histogram with a peak at the beginning, with zeros', () => {
        const histogram = new Uint32Array(256).fill(0);
        [0, 0, 10, 6, 3, 2, 2].forEach((v, i) => histogram[i] = v);
        expect(triangleThreshold(histogram)).toBe(4);
    });

    it('should handle a histogram with a peak near the end', () => {
        const histogram = new Uint32Array(256).fill(0);
        [2, 2, 3, 6, 10, 8, 1].forEach((v, i) => histogram[i] = v);
        expect(triangleThreshold(histogram)).toBe(2);
    });

    it('should handle a histogram with a peak near the beginning', () => {
        const histogram = new Uint32Array(256).fill(0);
        [1, 8, 10, 6, 3, 2, 2].forEach((v, i) => histogram[i] = v);
        expect(triangleThreshold(histogram)).toBe(4);
    });

    it('should handle a histogram with two peaks, the higher is near the end', () => {
        const histogram = new Uint32Array(256).fill(0);
        [1, 9, 6, 5, 10, 1].forEach((v, i) => histogram[i] = v);
        expect(triangleThreshold(histogram)).toBe(3);
    });

    it('should handle a histogram with two peaks, the higher is near the beginning', () => {
        const histogram = new Uint32Array(256).fill(0);
        [1, 10, 5, 6, 9, 1].forEach((v, i) => histogram[i] = v);
        expect(triangleThreshold(histogram)).toBe(2);
    });

    it('should handle a histogram with many zeros', () => {
        const histogram = new Uint32Array(256).fill(0);
        [0, 0, 1, 0, 10, 4, 4, 0, 1, 0, 0, 0, 0].forEach((v, i) => histogram[i] = v);
        expect(triangleThreshold(histogram)).toBe(5);
    });
});