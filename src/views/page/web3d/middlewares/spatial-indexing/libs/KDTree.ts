import {
    Box3,
    Vector3,
    BufferAttribute,
    BufferGeometry,
} from 'three';
import { IntersectAbleObject } from '../types';

const _v1 = /*@__PURE__*/ new Vector3();

const qSplit = (index: Uint32Array, cmp: (a: number, b: number) => boolean) => {
    const partation = (from: number, to: number) => {
        const mid = index[Math.floor((from + to) / 2)];
        let f = from;
        let t = to - 1;
        while (f < t) {
            while ((f <= t) && cmp(index[f], mid)) {
                f++;
            }
            while ((f <= t) && cmp(mid, index[t])) {
                t--;
            }
            if (f < t) {
                const tmp = index[f];
                index[f] = index[t];
                index[t] = tmp;
                if (index[f] !== mid) f++;
                if (index[t] !== mid) t--;
            } else {
                break;
            }
        }
        return t;
    };

    const count = index.length;
    const k = Math.floor(count / 2);

    const bubbleSort = (from: number, to: number) => {
        for (let i = from; i < to; i++) {
            for (let j = i + 1; j < to; j++) {
                if (cmp(j, i)) {
                    const tmp = index[j];
                    index[j] = index[i];
                    index[i] = tmp;
                }
            }
        }
    };

    const qSelect = (from: number, to: number) => {
        if (to - from <= 10) {
            bubbleSort(from, to);
        } else {
            const p = partation(from, to);
            if (p > k) {
                qSelect(from, p);
            } else if (p < k) {
                qSelect(p + 1, to);
            }
        }
    };
    return qSelect(0, count);
};

export class KDTree {
    box: Box3;
    left: KDTree | undefined;
    right: KDTree | undefined;
    axis: number;
    current: number;
    index: Uint32Array;
    position: BufferAttribute;

    constructor(box: Box3, index: Uint32Array, position: BufferAttribute) {
        this.box = box;
        this.index = index;
        this.position = position;
        this.current = this.index[0];
        this.axis = 0;
    }

    get subTrees(): KDTree[] {
        if (this.left && this.right) {
            return [this.left, this.right];
        } else {
            return [];
        }
    }

    split(maxCount: number) {
        const count = this.index.length;
        if (count <= maxCount) {
            return;
        }
        this.axis = 0;
        let width = this.box.max.x - this.box.min.x;
        if (width < this.box.max.y - this.box.min.y) {
            this.axis = 1;
            width = this.box.max.y - this.box.min.y;
        }
        if (width < this.box.max.z - this.box.min.z) {
            this.axis = 2;
        }

        qSplit(this.index, (a: number, b: number) => {
            switch (this.axis) {
            case 0:
                return this.position.getX(a) < this.position.getX(b);
            case 1:
                return this.position.getY(a) < this.position.getY(b);
            default:
                return this.position.getZ(a) < this.position.getZ(b);
            }
        });
        const mid = Math.floor(count / 2);
        const boxLeft = this.box.clone();
        const boxRight = this.box.clone();
        switch (this.axis) {
        case 0:
            boxLeft.max.x = this.position.getX(this.index[mid]);
            boxRight.min.x = this.position.getX(this.index[mid]);
            break;
        case 1:
            boxLeft.max.y = this.position.getY(this.index[mid]);
            boxRight.min.y = this.position.getY(this.index[mid]);
            break;
        case 2:
            boxLeft.max.z = this.position.getZ(this.index[mid]);
            boxRight.min.z = this.position.getZ(this.index[mid]);
            break;
        }
        this.current = this.index[mid];
        this.left = new KDTree(boxLeft, this.index.subarray(0, mid), this.position);
        this.right = new KDTree(boxRight, this.index.subarray(mid + 1, count), this.position);
        this.left.split(maxCount);
        this.right.split(maxCount);
    }

    /**
     * 遍历每个顶点并执行回调函数
     *
     * @param callback 回调函数，参数为当前顶点的位置和索引
     */
    forEachPoint(callback: (p: Vector3, i: number) => void) {
        for (let i = 0; i < this.index.length; i++) {
            callback(_v1.fromBufferAttribute(this.position, this.index[i]), this.index[i]);
        }
    }

    currentPoint() {
        return _v1.fromBufferAttribute(this.position, this.current);
    }

    /**
     * 通过回调函数返回当前节点下所有在box范围内的点
     *
     * @param {THREE.Box3} obj - 待判断的box对象，包含min和max属性
     * @param {Function} callback - 回调函数，接收参数为点
     */
    intersect(obj: IntersectAbleObject, callback: (point: Vector3, i: number) => void) {
        if (!obj.intersectsBox(this.box)) {
            return;
        }
        if ((obj as Box3).isBox3 && (obj as Box3).containsBox(this.box)) {
            this.forEachPoint(callback);
            return;
        }
        if (this.subTrees.length === 0) {
            this.forEachPoint((point: Vector3, i: number) => {
                if (obj.containsPoint(point)) {
                    callback(point, i);
                }
            });
        } else {
            const currentPoint = this.currentPoint();
            if (obj.containsPoint(currentPoint)) {
                callback(currentPoint, this.current);
            }
            for (const subTree of this.subTrees) {
                subTree.intersect(obj, callback);
            }
        }
    }

    static fromPointsGeometry(geometry: BufferGeometry, maxPointCount = 256): KDTree {
        geometry.computeBoundingBox();
        const box = new Box3().copy(geometry.boundingBox!);
        const position = geometry.getAttribute('position') as BufferAttribute;
        const index = new Uint32Array(position.count);
        for (let i = 0; i < index.length; i++) {
            index[i] = i;
        }
        const kdtree = new KDTree(box, index, position);
        kdtree.split(maxPointCount);
        return kdtree;
    }
}