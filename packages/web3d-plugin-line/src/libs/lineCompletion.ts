import { RBox, TFrame, frustumFromRBox } from '@cutie/web3d';
import { Vector3, Quaternion, Euler, Float32BufferAttribute } from 'three';
import { otsu } from './otsu';
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

    const intensityThreshold = ostuIntensityThreshold;
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

export const useLineCompletion = (
    frames: TFrame[],
    points: Vector3[],
    size: number = 0.25
) => {
    const { position } = multiFramePointsCulled(frames, points, size);
    const index = _.range(0, position.count);
    const clusters = dbScanFit(position, index, 0.5, 5);

    return clusters;
};