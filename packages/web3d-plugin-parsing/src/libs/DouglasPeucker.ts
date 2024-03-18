import * as THREE from 'three';

const _v1 = /*@__PURE__*/ new THREE.Vector2();
const _v2 = /*@__PURE__*/ new THREE.Vector2();
const _v3 = /*@__PURE__*/ new THREE.Vector2();

export const pointToLineDistance = (p: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2): number => {
    _v1.copy(b).sub(a);
    _v2.copy(p).sub(a);
    if (_v1.dot(_v2) < 0) {
        return _v2.length();
    }
    _v3.copy(p).sub(b);
    if (_v1.dot(_v3) > 0) {
        return _v3.length();
    }
    return Math.abs(_v1.cross(_v2) / _v1.length() / 2.0);
};

export const filterPoints = (points: THREE.Vector2[], epsilon: number): THREE.Vector2[] => {
    if (points.length < 2) {
        return [...points];
    }
    const result = [points[0]];
    for (let i = 1; i < points.length; ++i) {
        const p = result[result.length - 1].distanceTo(points[i]);
        if (p >= epsilon) {
            result.push(points[i]);
        }
    }
    return result;
};

export const DouglasPeucker = (points: THREE.Vector2[], epsilon: number): THREE.Vector2[] => {
    return douglasPeucker(filterPoints(points, epsilon), epsilon);
};

const douglasPeucker = (points: THREE.Vector2[], epsilon: number): THREE.Vector2[] => {
    if (points.length < 3) {
        return points;
    }
    let dmax = epsilon;
    let p = 0;
    const [start, end] = [points[0], points[points.length - 1]];
    for (let i = 1; i < points.length - 1; i++) {
        const d = pointToLineDistance(points[i], start, end);
        if (d > dmax) {
            dmax = d;
            p = i;
        }
    }
    if (p === 0) {
        return [start, end];
    }
    return [
        ...douglasPeucker(points.slice(0, p + 1), epsilon),
        ...douglasPeucker(points.slice(p), epsilon).slice(1)
    ];
};