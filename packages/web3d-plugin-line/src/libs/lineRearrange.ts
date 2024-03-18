import * as THREE from 'three';

export const rearrange = (points: THREE.Vector3[], space: number): THREE.Vector3[] => {
    if (points.length <= 2) {
        return [...points];
    }
    const lineLengthSum: number[] = new Array(points.length).fill(0);
    points.forEach((p, i, arr) => {
        if (i > 0) {
            lineLengthSum[i] = lineLengthSum[i - 1] + arr[i - 1].distanceTo(p);
        }
    });
    const sum = lineLengthSum[lineLengthSum.length - 1];
    if (sum < space) {
        return [points[0], points[points.length - 1]];
    }

    const count = Math.ceil(sum / space);
    const result: THREE.Vector3[] = [points[0].clone()];
    const step = sum / count;
    let k = 0;
    for (let i = 1; i < count; ++i) {
        const v = new THREE.Vector3();
        const pos = step * i;
        while (lineLengthSum[k] < pos) {
            ++k;
        }
        const t = (pos - lineLengthSum[k - 1]) / (lineLengthSum[k] - lineLengthSum[k - 1]);
        result.push(v.lerpVectors(points[k - 1], points[k], t));
    }
    result.push(points[points.length - 1]);
    return result;
};