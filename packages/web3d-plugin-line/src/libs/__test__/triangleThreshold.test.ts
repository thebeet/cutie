import { triangleThreshold } from '../triangleThreshold';
import { describe, expect, it } from 'vitest';

describe('triangleThreshold', () => {
    it('should return -1 for an empty histogram', () => {
        const histogram: number[] = [];
        expect(triangleThreshold(histogram)).toBe(-1);
    });

    it('should return -1 for a all-zero histogram', () => {
        const histogram: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        expect(triangleThreshold(histogram)).toBe(-1);
    });

    it('should handle a histogram with only one non-zero data', () => {
        const histogram: number[] = [0, 0, 0, 10, 0, 0, 0, 0, 0, 0];
        expect(triangleThreshold(histogram)).toBe(3);
    });

    it('should handle a histogram with only two non-zero data', () => {
        const histogram: number[] = [0, 0, 0, 10, 0, 3, 0, 0, 0, 0];
        expect(triangleThreshold(histogram)).toBe(4);
    });

    it('should handle a histogram with a peak at the end', () => {
        const histogram = [2, 2, 3, 6, 10];
        expect(triangleThreshold(histogram)).toBe(2);
    });

    it('should handle a histogram with a peak at the beginning', () => {
        const histogram = [10, 6, 3, 2, 2];
        expect(triangleThreshold(histogram)).toBe(2);
    });

    it('should handle a histogram with a peak at the end, with zeros', () => {
        const histogram = [0, 0, 2, 2, 3, 6, 10, 0, 0, 0];
        expect(triangleThreshold(histogram)).toBe(4);
    });

    it('should handle a histogram with a peak at the beginning, with zeros', () => {
        const histogram = [0, 0, 10, 6, 3, 2, 2, 0, 0, 0];
        expect(triangleThreshold(histogram)).toBe(4);
    });

    it('should handle a histogram with a peak near the end', () => {
        const histogram = [2, 2, 3, 6, 10, 8, 1];
        expect(triangleThreshold(histogram)).toBe(2);
    });

    it('should handle a histogram with a peak near the beginning', () => {
        const histogram = [1, 8, 10, 6, 3, 2, 2];
        expect(triangleThreshold(histogram)).toBe(4);
    });

    it('should handle a histogram with two peaks, the higher is near the end', () => {
        const histogram = [1, 9, 6, 5, 10, 1];
        expect(triangleThreshold(histogram)).toBe(3);
    });

    it('should handle a histogram with two peaks, the higher is near the beginning', () => {
        const histogram = [1, 10, 5, 6, 9, 1];
        expect(triangleThreshold(histogram)).toBe(2);
    });

    it('should handle a histogram with many zeros', () => {
        const histogram = [0, 0, 1, 0, 10, 4, 4, 0, 1, 0, 0, 0, 0];
        expect(triangleThreshold(histogram)).toBe(5);
    });
});