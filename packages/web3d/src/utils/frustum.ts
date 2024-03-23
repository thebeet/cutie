import {
    Box2,
    Camera,
    Frustum,
    Matrix4,
    Plane,
    Raycaster,
    Vector2,
    Vector3,
} from 'three';
import { rbox2Matrix } from './rbox';
import { RBox } from '../types';

/**
 * 创建一个从立方体生成的视锥体（Frustum）。
 * @param {Matrix4} mat - 立方体现有位置的4x4 变换逆矩阵。
 * @returns {Frustum} 返回一个根据输入立方体大小和变换逆矩阵生成的视锥体对象。
 */
export const frustumFromMatrix = (mat: Matrix4): Frustum => {
    return new Frustum(...[
        new Plane(new Vector3(-1, 0, 0), .5),
        new Plane(new Vector3(1, 0, 0), .5),
        new Plane(new Vector3(0, -1, 0), .5),
        new Plane(new Vector3(0, 1, 0), .5),
        new Plane(new Vector3(0, 0, -1), .5),
        new Plane(new Vector3(0, 0, 1), .5),
    ].map(p => p.applyMatrix4(mat)));
};

export const frustumFromRBox = (rbox: RBox): Frustum => {
    return frustumFromMatrix(rbox2Matrix(rbox));
};

/**
 * 从给定的2D矩形和相机生成一个视锥体（Frustum）
 * @param box 2D矩形框
 * @param camera 相机对象
 * @returns 返回生成的视锥体
 */
export const frustumFromRect = (box: Box2, camera: Camera): Frustum => {
    const getPlane = (points: Vector2[], camera: Camera): Plane[] => {
        return points.map(point => {
            const ray = new Raycaster();
            ray.setFromCamera(point, camera);
            return ray;
        }).map((current, i, rays) => {
            const next = rays[(i + 1) % rays.length];
            const a = current.ray.origin.clone().add(current.ray.direction);
            const b = next.ray.origin.clone().add(next.ray.direction);
            const c = current.ray.origin;
            const plane = new Plane();
            plane.setFromCoplanarPoints(a, b, c);
            return plane;
        });
    };
    const rect: Vector2[] = [
        box.min,
        new Vector2(box.min.x, box.max.y),
        box.max,
        new Vector2(box.max.x, box.min.y),
    ];
    const planes = getPlane(rect, camera);
    return new Frustum(
        planes[0], planes[1], planes[2], planes[3],
        new Plane(new Vector3(0, 0, 1), 10000),
        new Plane(new Vector3(0, 0, -1), 10000)
    );
};