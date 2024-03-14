import { ITFrame } from './frameAdaptor';
import { RBox, frustumFromRBox } from './rbox';
import { Vector3, Line3, Quaternion, Euler, Float32BufferAttribute } from 'three';
import { otsu } from './otsu';
import { triangleThreshold } from './triangleThreshold';
import _ from 'lodash';
import { findNearistLine } from './pointLine';
import { gaussianFilter3d } from './gaussianFilter';
import { klona } from 'klona';

const pointsCulled = (frame: ITFrame, start: Vector3, end: Vector3, size: number) => {
    const center = start.clone().add(end).multiplyScalar(0.5);
    const vx = new Vector3(1, 0, 0);
    const vtarget = end.clone().sub(start).normalize();
    const quaternion = new Quaternion().setFromUnitVectors(vx, vtarget);
    const euler = new Euler().setFromQuaternion(quaternion);
    const rBox = {
        position: { x: center.x, y: center.y, z: center.z },
        size: { x: start.distanceTo(end) + size, y: size, z: size },
        rotation: { x: euler.x, y: euler.y, z: euler.z },
    } as RBox;
    const frustum = frustumFromRBox(rBox);
    const points: number[] = [];
    const intensityHistogram = new Uint32Array(256).fill(0);
    const intensityAttr = frame.points!.geometry.getAttribute('intensity') as Float32BufferAttribute;
    frame.intersect(frustum, (_, i) => {
        points.push(i);
        const intensity = Math.min(Math.max(Math.floor(intensityAttr.array[i]), 0), 255);
        intensityHistogram[intensity]++;
    });

    const ostuIntensityThreshold = otsu(intensityHistogram);
    const triangleIntensityThreshold = triangleThreshold(intensityHistogram);

    const intensityThreshold = (ostuIntensityThreshold + triangleIntensityThreshold) / 2.0;
    const highIntensityPoints = points.filter(i => intensityAttr.array[i] >= intensityThreshold);
    return highIntensityPoints;
};

const buildMergePoints = (allPoints: [ITFrame, number[]][]) => {
    const count = allPoints.reduce((acc, [, points]) => acc + points.length, 0);
    const position = new Float32BufferAttribute(new Float32Array(count * 3), 3);
    let i = 0;
    const v = new Vector3();
    allPoints.forEach(([frame, points]) => {
        const framePosition = frame.points!.geometry.getAttribute('position') as Float32BufferAttribute;
        frame.points?.updateMatrixWorld();
        const mat = frame.points!.matrixWorld;
        points.forEach(p => {
            v.fromBufferAttribute(framePosition, p);
            v.applyMatrix4(mat);
            position.setXYZ(i, v.x, v.y, v.z);
            i++;
        });
    });
    return { position } as const;
};

export const multiFramePointsCulled = (
    frames: ITFrame[],
    points: Vector3[],
    size: number
) => {
    const allPoints: [ITFrame, number[]][] = [];
    for (const frame of frames) {
        const mergePoints: number[] = [];
        for (let i = 0; i < points.length - 1; ++i) {
            const start = points[i];
            const end = points[i + 1];
            mergePoints.push(...pointsCulled(frame, start, end, size));
        }
        const restPoints = [...new Set(mergePoints)];
        allPoints.push([frame, restPoints]);
    }
    const mergedPoints = buildMergePoints(allPoints);
    return mergedPoints;
};

type Config = {
    culledBoxSize: number; // 围绕当前线的裁切盒子的宽高尺寸
    space: number;  // 间隔多少米生成点
    inverseDistanceWeightingPow: number;
    maxWeight: number;
    gaussianOutput: boolean; // 是否使用高斯滤波
    gaussianKernel: number;
};

const defaultConfig: Readonly<Config> = {
    space: 1,
    culledBoxSize: 1.0,
    inverseDistanceWeightingPow: 2.0,
    maxWeight: 10000,
    gaussianOutput: true,
    gaussianKernel: 3
};

export const useLineCompletion = (
    frames: ITFrame[],
    points: Vector3[],
    pConfig?: Partial<Config>
) => {
    const {
        culledBoxSize,
        space,
        inverseDistanceWeightingPow,
        gaussianOutput,
        gaussianKernel
    } = { ...defaultConfig, ...pConfig };
    const lines = points.map((p, i, arr) => new Line3(p, arr[(i + 1) % arr.length]))
        .slice(0, -1);
    const lineLength = lines.map(l => l.distance());
    const lineLengthSum = new Array(lineLength.length + 1).fill(0);
    for (let i = 0; i < lineLength.length; ++i) {
        lineLengthSum[i + 1] = lineLength[i] + lineLengthSum[i];
    }

    const { position } = multiFramePointsCulled(frames, points, culledBoxSize);

    const buckets: {pos: number, distance: number, point: Vector3}[] = [];
    const v = new Vector3();
    for (let i = 0; i < position.count; ++i) {
        v.fromBufferAttribute(position, i);
        const { minDistance: distance, nearestLine, lineIndex } = findNearistLine(lines, v);
        const partial = nearestLine!.closestPointToPointParameter(v, true);
        const pos = lineLengthSum[lineIndex] + lineLength[lineIndex] * partial;
        buckets.push({
            pos,
            distance,
            point: v.clone()
        });
    }

    buckets.sort((a, b) => a.pos - b.pos);

    const result: { pos: number, point: Vector3, fix?: boolean }[] = points.map(
        (p, i) => ({ pos: lineLengthSum[i], point: p, fix: true }));

    const tmp = _.groupBy(buckets, (b) => Math.floor(b.pos / space));
    for (const key in tmp) {
        const arr = tmp[key];
        if (arr.length > 2) {
            let weightSum = 0;
            const mean = arr.reduce((acc, { distance, pos, point }) => {
                const weight = Math.min(Math.pow(1 / distance, inverseDistanceWeightingPow), 10000); // 反距离权重, 限制最高10000
                weightSum += weight;
                acc.point.x += point.x * weight;
                acc.point.y += point.y * weight;
                acc.point.z += point.z * weight; // z轴也可以试试直接等权重平均
                acc.pos += pos;
                return acc;
            }, { pos: 0, point: new Vector3() });
            mean.point.x /= weightSum;
            mean.point.y /= weightSum;
            mean.point.z /= weightSum;
            mean.pos /= arr.length;
            result.push(mean);
        }
    }

    result.sort((a, b) => a.pos - b.pos);

    const beforeGaussian = klona(result.map(({ point }) => point));

    if (gaussianOutput) {

        let s = 0, end = 1;
        while (s < result.length) {
            while ((end < result.length) && !result[end].fix) {
                end++;
            }

            if (end - s > 3) {
                const newPoints = gaussianFilter3d(
                    result.slice(s, end).map(({ point }) => point), gaussianKernel);
                for (let i = 1; i < newPoints.length - 1; ++i) {
                    result[s + i].point = newPoints[i];
                }
            }
            s = end;
            end++;
        }
    }

    return {
        //clusters,
        position,
        buckets,
        result: result.map(({ point }) => point),
        beforeGaussian
    } as const;
};