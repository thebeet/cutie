import _ from 'lodash';
import { Float32BufferAttribute, Vector3 } from 'three';
export const dbScanFit = (
    position: Float32BufferAttribute,
    points: number[],
    epsilon: number,
    minPoints: number): number[][] => {

    const N = points.length;
    const epsilon2 = epsilon * epsilon;
    const visited = new Uint8Array(N).fill(0);
    const clusterID = new Int32Array(N).fill(0);

    const regionQuery = (i: number): number[] => { // use octree or kdtree
        const neighbors: number[] = [];
        const p = new Vector3().fromBufferAttribute(position, points[i]);
        const v = new Vector3();
        for (let j = 0; j < N; ++j) {
            if (j === i) continue;
            v.fromBufferAttribute(position, j);
            if (p.distanceToSquared(v) < epsilon2) {
                neighbors.push(j);
            }
        }
        return neighbors;
    };

    const expandCluster = (id: number, neighbors: number[], newCluster: number[]): void => {
        while (neighbors.length > 0) {
            const j = neighbors[0];
            neighbors.shift();
            if (!visited[j]) {
                visited[j] = 1;
                const newNeighbors = regionQuery(j);
                if (newNeighbors.length >= minPoints) {
                    neighbors.push(...newNeighbors);
                }
            }
            if (clusterID[j] === 0) {
                clusterID[j] = id;
                newCluster.push(j);
            }
        }
    };

    const result: number[][] = [[]];
    let id = 0;
    for (let i = 0; i < N; ++i) {
        if (visited[i]) continue;
        const neighbors = regionQuery(i);
        if (neighbors.length >= minPoints) {
            id++;
            const newCluster: number[] = [i];
            clusterID[i] = id;
            visited[i] = 1;
            expandCluster(id, neighbors, newCluster);
            result.push(newCluster);
        }
    }
    const noise = result[0];
    for (let i = 0; i < N; ++i) {
        if (clusterID[i] === 0) {
            noise.push(i);
        }
    }

    return result;
};