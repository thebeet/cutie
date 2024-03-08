/* eslint-disable no-underscore-dangle */
/* eslint-disable spaced-comment */
import {
    BufferAttribute,
    Vector3,
    Ray,
    Points,
} from 'three';
import { IntersectAbleObject } from '../types';

const _v1 = /*@__PURE__*/ new Vector3();

export class Bruteforce {
    position: BufferAttribute;

    constructor(position: BufferAttribute) {
        this.position = position;
    }

    static fromPoints(points: Points): Bruteforce {
        const position = points.geometry.getAttribute('position') as BufferAttribute;
        const bf = new Bruteforce(position);
        return bf;
    }

    /**
     * 遍历每个顶点并执行回调函数
     *
     * @param callback 回调函数，参数为当前顶点的位置和索引
     */
    forEachPoint(callback: (p: Vector3, i: number) => void) {
        for (let i = 0; i < this.position.count; i++) {
            callback(_v1.fromBufferAttribute(this.position, i), i);
        }
    }

    /**
     * 判断一个点是否与指定的Box3、Frustum或Sphere相交，如果是则调用回调函数。
     *
     * @param obj 要进行相交判断的Box3、Frustum或Sphere对象。
     * @param callback 回调函数，当点与obj相交时调用，参数为相交点的坐标和索引。
     */
    intersect(obj: IntersectAbleObject, callback: (point: Vector3, i: number) => void) {
        this.forEachPoint((point: Vector3, i: number) => {
            if (obj.containsPoint(point)) {
                callback(point, i);
            }
        });
    }

    /**
     * 通过回调函数返回所有与射线距离小于d的点
     *
     * @param obj 射线对象
     * @param d 距离
     * @param callback 回调函数参数为相交点的位置和索引
     */
    intersectRay(obj: Ray, d: number, callback: (point: Vector3, i: number) => void) {
        this.forEachPoint((point: Vector3, i: number) => {
            if (obj.distanceToPoint(point) <= d) {
                callback(point, i);
            }
        });
    }
}
