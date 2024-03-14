import { Float32BufferAttribute } from 'three';
import { dbScan } from '../dbScan'; // Assuming the function is in a file named dbScan.ts
import { describe, expect, it } from 'vitest';

describe('dbScanFit', () => {
    it('should correctly identify clusters', () => {
        // Define a simple case
        const positions = new Float32BufferAttribute([
            0, 0, 0, // point 0
            0.5, 0.5, 0.5, // point 0
            1, 1, 1, // point 1
            1.5, 1.5, 1.5, // point 2
            2, 2, 2, // point 3
            5, 5, 5, // point 4 - this is further away and should be noise
        ], 3);
        const points = [0, 1, 2, 3, 4, 5];
        const epsilon = 3.0;
        const minPoints = 2;

        const clusters = dbScan(positions, points, epsilon, minPoints);
        expect(clusters.length).toBe(2); // One cluster and one noise array
        expect(clusters[0]).toEqual([5]); // The noise
        expect(clusters[1]).toContain(0); // The cluster
        expect(clusters[1]).toContain(1);
        expect(clusters[1]).toContain(2);
        expect(clusters[1]).toContain(3);
        expect(clusters[1]).toContain(4);
    });

    it('should correctly identify clusters', () => {
        // Define a simple case
        const positions = new Float32BufferAttribute([
            0, 0, 0, // point 0
            1, 1, 1, // point 1
            2, 2, 2, // point 2
            5, 5, 5, // point 3 - this is further away and should be noise
        ], 3);
        const points = [0, 1, 2, 3];
        const epsilon = 3.0;
        const minPoints = 2;

        const clusters = dbScan(positions, points, epsilon, minPoints);
        expect(clusters.length).toBe(2); // One cluster and one noise array
        expect(clusters[0]).toEqual([3]); // The noise
        expect(clusters[1]).toContain(0); // The cluster
        expect(clusters[1]).toContain(1);
        expect(clusters[1]).toContain(2);
    });

    it('should correctly identify three clusters from the given points', () => {
        // Define a case with 22 points that should form 3 clusters
        const positions = new Float32BufferAttribute([
            // Cluster 1
            0, 0, 0,
            1, 1, 1,
            1, 0, 0,
            0, 1, 1,
            // Cluster 2
            10, 10, 10,
            11, 11, 11,
            10, 11, 10,
            11, 10, 11,
            // Cluster 3
            20, 20, 20,
            20, 21, 20,
            21, 20, 20,
            21, 21, 21,
            // More points in clusters to make up 20 points
            // Additional points for Cluster 1
            0.5, 0.2, 0.1,
            0.9, 0.8, 1.0,
            // Additional points for Cluster 2
            10.2, 10.2, 10.1,
            10.7, 10.9, 10.8,
            // Additional points for Cluster 3
            20.3, 20.1, 20.4,
            20.6, 20.5, 20.5,
            // Noise points
            30, 30, 30,
            35, 35, 35,
            40, 40, 40,
        ], 3);

        const points = [...Array(positions.count).keys()];
        const epsilon = 2.5;
        const minPoints = 3;

        const clusters = dbScan(positions, points, epsilon, minPoints);
        expect(clusters.length).toBeGreaterThanOrEqual(3); // Expecting at least 3 clusters

        // Validate the clusters - the exact indices will depend on the dbScanFit implementation
        // Assuming dbScanFit returns an array with clusters first and noise last
        expect(clusters[1]).toEqual(expect.arrayContaining([0, 1, 2, 3, 12, 13]));
        expect(clusters[2]).toEqual(expect.arrayContaining([4, 5, 6, 7, 14, 15]));
        expect(clusters[3]).toEqual(expect.arrayContaining([8, 9, 10, 11, 16, 17]));
        // If there's noise it would be at clusters[0], adjust your expectations accordingly
        expect(clusters[0]).toEqual(expect.arrayContaining([18, 19, 20]));
    });
});