import { Vector3 } from 'three';

const gaussianKernel = (sigma: number): number[] => {
    // 根据sigma确定核的长度，确保核的长度为奇数
    const kernelSize = Math.max(3, Math.ceil(sigma * 3) * 2 + 1);
    const kernelHalfSize = Math.floor(kernelSize / 2);
    let kernelSum = 0;
    const kernel = Array.from({ length: kernelSize }, (_, x) => {
        x -= kernelHalfSize;
        const exponent = -0.5 * (x * x) / (sigma * sigma);
        const value = Math.exp(exponent) / (Math.sqrt(2 * Math.PI) * sigma);
        kernelSum += value;
        return value;
    });

    // 正规化核，确保其和为1
    return kernel.map(value => value / kernelSum);
};

const gaussianFilter1d = (array: number[], sigma: number): number[] => {
    const kernel = gaussianKernel(sigma);
    const halfSize = Math.floor(kernel.length / 2);
    const smoothedArray: number[] = [];

    for (let i = 0; i < array.length; i++) {
        let weightedSum = 0;
        for (let j = 0; j < kernel.length; j++) {
            const x = i + j - halfSize;
            const value = x >= 0 && x < array.length ? array[x] : array[Math.max(0, Math.min(array.length - 1, x))];
            weightedSum += value * kernel[j];
        }
        smoothedArray.push(weightedSum);
    }

    return smoothedArray;
};

export const gaussianFilter3d = (points: Vector3[], sigma: number): Vector3[] => {
    const filteredX = gaussianFilter1d(points.map(p => p.x), sigma);
    const filteredY = gaussianFilter1d(points.map(p => p.y), sigma);
    const filteredZ = gaussianFilter1d(points.map(p => p.z), sigma);
    const filteredPositions: Vector3[] = [];
    for (let i = 0; i < filteredX.length; i++) {
        filteredPositions.push(new Vector3(filteredX[i], filteredY[i], filteredZ[i]));
    }
    return filteredPositions;
};
