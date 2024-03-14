import { describe, it, expect } from 'vitest';
import { multiFramePointsCulled, useLineCompletion } from '../lineCompletion';
import { Vector3, BufferAttribute, BufferGeometry, Points, Line3 } from 'three';
import { ITFrame } from '../frameAdaptor';

describe('useLineCompletion', () => {
    it('should use cull points correctly', () => {
        const points = [];
        for (let i = 0; i < 20; i++) {
            points.push(new Vector3(0.5 * i, 0, 0));
        }
        const intensityAttr = new BufferAttribute(new Float32Array(20).fill(0), 1);
        for (let i = 0; i < intensityAttr.count; i++) {
            intensityAttr.setX(i, i % 2 === 0 ? 160 : 80);
        }
        const geometry = new BufferGeometry().setFromPoints(points);
        geometry.setAttribute('intensity', intensityAttr);
        const tpoints = new Points(geometry);
        const frame = {
            points: tpoints,
            intersect(obj, callback) {
                const position = this.points!.geometry.getAttribute('position') as BufferAttribute;
                const v = new Vector3();
                for (let i = 0; i < position.count; i++) {
                    v.fromBufferAttribute(position, i);
                    if (obj.containsPoint(v)) {
                        callback(v, i);
                    }
                }
            },
        } as ITFrame;
        const frames: ITFrame[] = [frame];

        const inputPoints = [
            new Vector3(0, 0, 0), new Vector3(5, 0, 0),
        ];
        // Call useLineCompletion with mock data
        const mergedPoints = multiFramePointsCulled(frames, inputPoints, .5);

        expect(mergedPoints).toHaveProperty('position');
        expect(mergedPoints.position.array).toEqual(new Float32Array([
            0, 0, 0,
            1, 0, 0,
            2, 0, 0,
            3, 0, 0,
            4, 0, 0,
            5, 0, 0,
        ]));
    });

    it('should use line completion correctly', () => {
        const points = [];
        const N = 1000;
        for (let i = 0; i < N; i++) {
            points.push(new Vector3(0.05 * i, -0.05, 0));
            points.push(new Vector3(0.05 * i, 0, 0));
            points.push(new Vector3(0.05 * i, 0.05, 0));
        }
        const intensityAttr = new BufferAttribute(new Float32Array(N).fill(0), 1);
        const geometry = new BufferGeometry().setFromPoints(points);
        geometry.setAttribute('intensity', intensityAttr);
        const tpoints = new Points(geometry);
        const frame = {
            points: tpoints,
            intersect(obj, callback) {
                const position = this.points!.geometry.getAttribute('position') as BufferAttribute;
                const v = new Vector3();
                for (let i = 0; i < position.count; i++) {
                    v.fromBufferAttribute(position, i);
                    if (obj.containsPoint(v)) {
                        callback(v, i);
                    }
                }
            },
        } as ITFrame;
        const frames: ITFrame[] = [frame];

        const inputPoints = [
            new Vector3(0, 0, 0), new Vector3(10, 0, 0),
        ];

        const { result } = useLineCompletion(frames, inputPoints);
        const line = new Line3(
            new Vector3(0, 0, 0),
            new Vector3(50, 0, 0),
        );
        expect(result.length).toBeGreaterThanOrEqual(11);
        for (let i = 0; i < result.length; i++) {
            const v = new Vector3();
            line.closestPointToPoint(result[i], true, v);
            expect(v.distanceTo(result[i])).toBeCloseTo(0);
        }
    });
});
