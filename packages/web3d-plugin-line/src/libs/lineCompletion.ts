import { RBox, TFrame, frustumFromRBox } from '@cutie/web3d';
import { Vector3, Line3, Quaternion, Euler, Float32BufferAttribute } from 'three';
import { otsu } from './otsu';
import { triangleThreshold } from './triangleThreshold';
import { dbScanFit } from './dbScanFit';
import _ from 'lodash';

const pointsCulled = (frame: TFrame, start: Vector3, end: Vector3, size: number) => {
    const center = start.clone().add(end).multiplyScalar(0.5);
    const vx = new Vector3(1, 0, 0);
    const vtarget = end.clone().sub(start).normalize();
    const quaternion = new Quaternion().setFromUnitVectors(vx, vtarget);
    const euler = new Euler().setFromQuaternion(quaternion);
    const rBox = {
        position: { x: center.x, y: center.y, z: center.z },
        size: { x: start.distanceTo(end) + size * 2, y: size * 2, z: size * 2 },
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

const buildMergePoints = (allPoints: [TFrame, number[]][]) => {
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
    frames: TFrame[],
    points: Vector3[],
    size: number = 0.25
) => {
    const allPoints: [TFrame, number[]][] = [];
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

const buildLineFromCluster = (position: Float32BufferAttribute, index: number[]) => {

};


const getCenter = (position: Float32BufferAttribute, index: number[]) => {
    const v = new Vector3();
    if (index.length === 0) return v;
    const _v = new Vector3();
    for (let i = 0; i < index.length; ++i) {
        _v.fromBufferAttribute(position, index[i]);
        v.add(_v);
    }
    return v.divideScalar(index.length);
};


const findNearistLine = (lines: Line3[], point: Vector3) => {
    let minDistance = Infinity;
    let nearestLine: Line3 | undefined;
    let lineIndex = 0;
    const v = new Vector3();
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        line.closestPointToPoint(point, true, v);
        const distance = point.distanceTo(v);
        if (distance < minDistance) {
            minDistance = distance;
            nearestLine = line;
            lineIndex = i;
        }
    }
    return { minDistance, nearestLine: nearestLine!, lineIndex };
};

type Config = {
    culledBoxSize: number; // 围绕当前线的裁切盒子的宽高尺寸
    dbScan: { // DBSCAN 算法的参数
        eps: number;
        minPoints: number;
    }
};

export const useLineCompletion = (
    frames: TFrame[],
    points: Vector3[],
    pConfig?: Partial<Config>
) => {
    const {
        culledBoxSize
    } = {
        culledBoxSize: 0.5,
        ...pConfig
    };
    const lines = points.map((p, i, arr) => new Line3(p, arr[(i + 1) % arr.length]))
        .slice(0, -1);
    const lineLength = lines.map(l => l.distance());
    const lineLengthSum = new Array(lineLength.length).fill(0);
    for (let i = 0; i < lineLength.length - 1; ++i) {
        lineLengthSum[i + 1] = lineLength[i] + lineLengthSum[i];
    }

    const { position } = multiFramePointsCulled(frames, points, culledBoxSize);
    //const clusters = dbScanFit(position, index, 0.5, 5);

    const buckets: [number, Vector3][] = [];
    const v = new Vector3();
    for (let i = 0; i < position.count; ++i) {
        v.fromBufferAttribute(position, i);
        const { nearestLine, lineIndex } = findNearistLine(lines, v);
        const partial = nearestLine!.closestPointToPointParameter(v, true);
        const pos = lineLengthSum[lineIndex] + lineLength[lineIndex] * partial;
        buckets.push([pos, v.clone()]);
    }

    buckets.sort((a, b) => a[0] - b[0]);
    console.log(buckets);

    const result: Vector3[] = [];
    const tmp = _.groupBy(buckets, (b) => Math.floor(b[0]));
    console.log(tmp)
    for (const key in tmp) {
        const arr = tmp[key];
        if (arr.length > 2) {
            const mean = arr.reduce((acc, [, p]) => {
                acc.add(p);
                return acc;
            }, new Vector3()).multiplyScalar(1 / arr.length);
            result.push(mean);
        }
    }
    console.log(result)

    return {
        //clusters,
        position,
        buckets,
        result
    };
};