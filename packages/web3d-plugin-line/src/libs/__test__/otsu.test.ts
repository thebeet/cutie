import { otsu } from '../otsu';
import { describe, expect, it } from 'vitest';

describe('otsu', () => {
    it('should calculate the correct threshold for a simple dataset', () => {
        // This is a very basic test dataset where the threshold should be obvious
        const data = [0, 0, 0, 0, 255, 255, 255, 255];
        const threshold = otsu(data);
        expect(threshold).toBe(127); // Assuming the threshold is calculated as 127 for this dataset
    });

    it('should return 0 for an empty dataset', () => {
        const data: number[] = [];
        const threshold = otsu(data);
        expect(threshold).toBe(0); // Assuming that -1 is returned for an empty dataset
    });
});