import * as THREE from 'three';

const _v1 = /*@__PURE__*/ new THREE.Vector2();
const _v2 = /*@__PURE__*/ new THREE.Vector2();
const EPSILON = 1e-9;

// Andrew Algorithm 
export const convexHull2D = (p: THREE.Vector2[]): THREE.Vector2[] => {
    const n = p.length;
    if (n <= 2) {
        return p;
    }
    const points = [...p];
    points.sort((p1, p2) => {
        if (p1.x === p2.x) {
            return p1.y - p2.y;
        }
        return p1.x - p2.x;
    });
    const stack: number[] = [];
    const used = new Array<boolean>(n).fill(false);
    stack.push(0);

    const _v1 = new THREE.Vector2();
    const _v2 = new THREE.Vector2();
    for (let i = 1; i < n; ++i) {
        while (stack.length > 1) {
            _v1.copy(points[stack[stack.length - 1]]).sub(points[stack[stack.length - 2]]);
            _v2.copy(points[i]).sub(points[stack[stack.length - 1]]);
            if (_v1.cross(_v2) > EPSILON) {
                break;
            }
            used[stack[stack.length - 1]] = false;
            stack.pop();
        }
        used[i] = true;
        stack.push(i);
    }

    const stackBar = stack.length;
    for (let i = n - 1; i >= 0; --i) {
        if (!used[i]) {
            while (stack.length > stackBar) {
                _v1.copy(points[stack[stack.length - 1]]).sub(points[stack[stack.length - 2]]);
                _v2.copy(points[i]).sub(points[stack[stack.length - 1]]);
                if (_v1.cross(_v2) > EPSILON) {
                    break;
                }
                used[stack[stack.length - 1]] = false;
                stack.pop();
            }
            used[i] = true;
            stack.push(i);
        }
    }
    return stack.map(index => points[index]);
};


const projectionToLine = (p: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2): THREE.Vector2 => {
    const line = b.clone().sub(a);
    return a.clone().add(line.clone().multiplyScalar(line.dot(p.clone().sub(a)) / line.dot(line)));
};

export const pointsBox2DBounding = (points: THREE.Vector2[]) => {
    let { x: minX, y: minY } = { x: points[0].x, y: points[0].y };
    let { x: maxX, y: maxY } = { x: points[0].x, y: points[0].y };
    for (let i = 1; i < points.length; ++i) {
        minX = Math.min(minX, points[i].x);
        minY = Math.min(minY, points[i].y);
        maxX = Math.max(maxX, points[i].x);
        maxY = Math.max(maxY, points[i].y);
    }
    return {
        area: (maxX - minX) * (maxY - minY),
        rect: [
            new THREE.Vector2(minX, minY),
            new THREE.Vector2(minX, maxY),
            new THREE.Vector2(maxX, maxY),
            new THREE.Vector2(maxX, minY),
            new THREE.Vector2(minX, minY),
        ],
    };
};

// contain bug
export const rotatingCalipers = (points: THREE.Vector2[]) => {
    const n = points.length - 1;
    let c = 1, d = 1, e = 1;
    let ans: number = Infinity;
    let pi = 0, pc = 0, pd = 0, pe = 0;
    for (let i = 0; i < n; i++) {
        const line = points[i + 1].clone().sub(points[i]);
        if (line.length() < EPSILON) {
            continue;
        }
        while (line.cross(points[d].clone().sub(points[i])) < line.cross(points[d % n + 1].clone().sub(points[i]))) {
            d = d % n + 1;
        }
        const lineN = new THREE.Vector2(line.y, -line.x);
        while (lineN.cross(points[c].clone().sub(points[i])) < lineN.cross(points[c % n + 1].clone().sub(points[i]))) {
            c = c % n + 1;
        }
        if (i === 0) {
            e = c;
        }
        const lineNI = lineN.clone().negate();
        while (lineNI.cross(points[e].clone().sub(points[i])) < lineNI.cross(points[e % n + 1].clone().sub(points[i]))) {
            e = e % n + 1;
        }

        const tans = line.cross(points[d].clone().sub(points[i])) * (
            lineN.cross(points[c].clone().sub(points[i])) + lineNI.cross(points[e].clone().sub(points[i]))
        ) / line.dot(line);
        if (tans < ans) {
            ans = tans;
            pi = i;
            pc = c;
            pd = d;
            pe = e;
        }
    }
    const result: THREE.Vector2[] = [];
    result.push(projectionToLine(points[pc], points[pi], points[pi + 1]));
    result.push(projectionToLine(points[pe], points[pi + 1], points[pi]));

    const line = points[pi + 1].clone().sub(points[pi]);
    const normal = new THREE.Vector2(-line.y, line.x);

    _v1.copy(points[pi + 1]).sub(points[pi]);
    _v2.copy(points[pd]).sub(points[pi]);

    const height = _v1.cross(_v2) / _v1.length();
    normal.normalize().multiplyScalar(height);

    result.push(result[0].clone().add(normal));
    result.push(result[1].clone().add(normal));

    return {
        area: ans,
        rect: [
            result[0],
            result[1],
            result[3],
            result[2],
        ],
        points: [
            points[pi],
            points[pi + 1],
            points[pc],
            points[pd],
            points[pe]
        ]
    };
};

const isPointOnSegment = (point: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2) => {
    if ((point.x > Math.max(a.x, b.x)) || (point.y > Math.max(a.y, b.y)) ||
        (point.x < Math.min(a.x, b.x)) || (point.y < Math.min(a.y, b.y))) {
        return false;
    }
    return Math.abs(
        (a.x - point.x) * (b.y - point.y) - (b.x - point.x) * (a.y - point.y)
    ) < EPSILON; // cross
};

export const pointInPolygon = (polygon: THREE.Vector2[], point: THREE.Vector2) => {
    let c = 0;
    for (let i = 0; i < polygon.length - 1; i++) {
        if (isPointOnSegment(point, polygon[i], polygon[i + 1])) {
            return true;
        }

        if (polygon[i].y !== polygon[i + 1].y) {
            if (polygon[i].y === point.y) {
                if (polygon[i].x <= point.x && polygon[i + 1].y < point.y) {
                    c++;
                }
            } else if (polygon[i + 1].y === point.y) {
                if (polygon[i + 1].x <= point.x && polygon[i].y < point.y) {
                    c++;
                }
            } else {
                if ((polygon[i].y > point.y) !== (polygon[i + 1].y > point.y)) {
                    _v1.copy(polygon[i + 1]).sub(polygon[i]);
                    _v2.copy(point).sub(polygon[i]);
                    if ((_v2.cross(_v1) > 0) === (polygon[i].y < point.y)) {
                        c++;
                    }
                }
            }
        }
    }
    return c % 2 === 1;
};