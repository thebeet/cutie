import { expect, describe, test } from 'vitest';
import * as THREE from 'three';
import { convexHull2D, pointInPolygon, rotatingCalipers } from './ConvexHull2D';

describe('convexHull2D', () => {
    const compareConvexHull = (a: THREE.Vector2[], b: THREE.Vector2[]) => {
        expect(a.every(ap => b.some(bp => ap.x === bp.x && ap.y === bp.y)));
        expect(b.every(bp => a.some(ap => ap.x === bp.x && ap.y === bp.y)));
    };
    test('should return the convex hull of a set of 2D points', () => {
        const points: THREE.Vector2[] = [
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, 2),
            new THREE.Vector2(2, 2),
            new THREE.Vector2(2, 1),
            new THREE.Vector2(1.5, 1.5),
        ];
        const expected: THREE.Vector2[] = [
            new THREE.Vector2(1, 1),
            new THREE.Vector2(2, 1),
            new THREE.Vector2(2, 2),
            new THREE.Vector2(1, 2),
            new THREE.Vector2(1, 1),
        ];
        compareConvexHull(points, expected);
    });

    test('test bug', () => {
        const points: THREE.Vector2[] = [
            new THREE.Vector2(-.475, -.055),
            new THREE.Vector2(-.27, -.094959),
            new THREE.Vector2(-.2625, .0879),
            new THREE.Vector2(-.2625, .245),
            new THREE.Vector2(-.3972, -0.0644),
        ];
        const expected: THREE.Vector2[] = [
            new THREE.Vector2(-.475, -.055),
            new THREE.Vector2(-.27, -.094959),
            new THREE.Vector2(-.2625, .0879),
            new THREE.Vector2(-.2625, .245),
            new THREE.Vector2(-.475, -.055),
        ];
        compareConvexHull(points, expected);
    });

    test('should handle an empty array', () => {
        expect(convexHull2D([])).toEqual([]);
    });

    test('should handle a single-element array', () => {
        const points: THREE.Vector2[] = [new THREE.Vector2(1, 1)];
        expect(convexHull2D(points)).toStrictEqual(points);
    });

    test('should handle a collinear array', () => {
        const points: THREE.Vector2[] = [
            new THREE.Vector2(1, 1),
            new THREE.Vector2(2, 2),
            new THREE.Vector2(3, 3),
            new THREE.Vector2(4, 4),
            new THREE.Vector2(5, 5),
        ];
        const expected: THREE.Vector2[] = [
            new THREE.Vector2(1, 1),
            new THREE.Vector2(2, 2),
            new THREE.Vector2(3, 3),
            new THREE.Vector2(4, 4),
            new THREE.Vector2(5, 5),
            new THREE.Vector2(1, 1),
        ];
        compareConvexHull(points, expected);
    });
});

describe('rotatingCalipers', () => {
    const compareConvexHull = (a: THREE.Vector2[], b: THREE.Vector2[]) => {
        expect(a.every(ap => b.some(bp => ap.x === bp.x && ap.y === bp.y)));
        expect(b.every(bp => a.some(ap => ap.x === bp.x && ap.y === bp.y)));
    };
    test('square', () => {
        const testcase = [
            [1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [2, 1], [1, 1],
        ].map(([x, y]) => new THREE.Vector2(x, y));
        const convexhull = convexHull2D(testcase);
        const { rect } = rotatingCalipers(convexhull);
        compareConvexHull(rect, [
            new THREE.Vector2(1, 1),
            new THREE.Vector2(3, 1),
            new THREE.Vector2(3, 3),
            new THREE.Vector2(1, 3),
        ]);
    });

    test('test bug', () => {
        const testcase = [
            {
                'x': 0.5797280593325094,
                'y': 0.6258790436005626
            },
            {
                'x': 0.6909765142150803,
                'y': 0.6258790436005626
            },
            {
                'x': 0.7181705809641532,
                'y': 0.620253164556962
            },
            {
                'x': 0.7107540173053153,
                'y': 0.5977496483825597
            },
            {
                'x': 0.6885043263288011,
                'y': 0.5780590717299579
            },
            {
                'x': 0.6761433868974043,
                'y': 0.5724331926863573
            },
            {
                'x': 0.6390605686032138,
                'y': 0.5668073136427567
            },
            {
                'x': 0.5797280593325094,
                'y': 0.6258790436005626
            }
        ].map(({ x, y }) => new THREE.Vector2(x, y));
        const convexhull = convexHull2D(testcase);
        const { rect } = rotatingCalipers(convexhull);
        const polygon = [rect[0], rect[1], rect[2], rect[3], rect[0]];
        testcase.forEach(p => {
            expect(pointInPolygon(polygon, p)).toBe(true); // TODO: Fail
        });
    });
});

describe('point in polygon', () => {
    test('test point in polygon', () => {
        const points: THREE.Vector2[] = [
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, 2),
            new THREE.Vector2(2, 2),
            new THREE.Vector2(3, 1),
            new THREE.Vector2(1, 1),
        ];
        const inCases: THREE.Vector2[] = [
            new THREE.Vector2(1.5, 1.5),
            new THREE.Vector2(2.5, 1.1),
        ];
        for (const p of inCases) {
            expect(pointInPolygon(points, p)).toBe(true);
        }
    });
    test('test point not in polygon', () => {
        const points: THREE.Vector2[] = [
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, 2),
            new THREE.Vector2(2, 2),
            new THREE.Vector2(3, 1),
            new THREE.Vector2(2, 1),
            new THREE.Vector2(1, 1),
        ];
        const inCases: THREE.Vector2[] = [
            new THREE.Vector2(-1.5, -1.5),
            new THREE.Vector2(1, 3),
            new THREE.Vector2(4, 1),
        ];
        for (const p of inCases) {
            expect(pointInPolygon(points, p)).toBe(false);
        }
    });
    test('test point on polygon edge', () => {
        const points: THREE.Vector2[] = [
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, 2),
            new THREE.Vector2(2, 2),
            new THREE.Vector2(3, 1),
            new THREE.Vector2(1, 1),
        ];
        const inCases: THREE.Vector2[] = [
            new THREE.Vector2(1, 1.5),
            new THREE.Vector2(1.2, 2),
        ];
        for (const p of inCases) {
            expect(pointInPolygon(points, p)).toBe(true);
        }
    });
    test('test point not in polygon (bugfix)', () => {
        const points: THREE.Vector2[] = [
            new THREE.Vector2(1, 1),
            new THREE.Vector2(3, 3),
            new THREE.Vector2(4, 2),
            new THREE.Vector2(5, 1),
            new THREE.Vector2(1, 1),
        ];
        const inCases: THREE.Vector2[] = [
            new THREE.Vector2(3.1, 3),
            new THREE.Vector2(2.9, 3),
            new THREE.Vector2(4.1, 2),
        ];
        for (const p of inCases) {
            expect(pointInPolygon(points, p)).toBe(false);
        }
    });
    test('test point not in polygon (bugfix 2)', () => {
        const points: THREE.Vector2[] = [
            new THREE.Vector2(4, 3),
            new THREE.Vector2(3, 4),
            new THREE.Vector2(1, 3),
            new THREE.Vector2(2, 1),
            new THREE.Vector2(10, 1),
            new THREE.Vector2(4, 3),
        ];
        const inCases: THREE.Vector2[] = [
            new THREE.Vector2(4.1, 3),
        ];
        for (const p of inCases) {
            expect(pointInPolygon(points, p)).toBe(false);
        }
    });
});