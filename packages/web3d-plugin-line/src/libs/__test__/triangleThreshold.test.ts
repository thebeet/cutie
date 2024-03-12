import { triangleThreshold } from '../triangleThreshold';
import { describe, expect, it } from 'vitest';

describe('triangleThreshold', () => {
    it('should find the correct threshold for a histogram with a single peak', () => {
        const histogram = [1, 3, 5, 7, 5, 3, 1];
        expect(triangleThreshold(histogram)).toBe(3);
    });

    it('should handle a histogram with increasing values', () => {
        const histogram = [1, 2, 3, 4, 5];
        expect(triangleThreshold(histogram)).toBe(4);
    });

    it('should handle a histogram with decreasing values', () => {
        const histogram = [5, 4, 3, 2, 1];
        expect(triangleThreshold(histogram)).toBe(0);
    });

    it('should handle a histogram with a peak at the beginning', () => {
        const histogram = [7, 3, 1, 1, 1, 1, 1];
        expect(triangleThreshold(histogram)).toBe(0);
    });

    it('should handle a histogram with a peak at the end', () => {
        const histogram = [1, 1, 1, 1, 1, 3, 100];
        expect(triangleThreshold(histogram)).toBe(6);
    });
});