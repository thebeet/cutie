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

export const getPointToward = (point: THREE.Vector2, line: THREE.Vector2[]): void => {
    let lineIndex = -1;
    let minDistance = Infinity;
    for (let i = 0; i < line.length - 1; ++i) {
        const distance = pointToLineDistance(point, line[i], line[i + 1]);
        if (distance < minDistance) {
            minDistance = distance;
            lineIndex = i;
        }
    }
};