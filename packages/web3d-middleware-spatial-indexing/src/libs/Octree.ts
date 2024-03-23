import {
    Box3,
    BufferAttribute,
    BufferGeometry,
    Points,
    Ray,
    Vector3,
} from 'three';
import { IntersectAbleObject } from '../types';

const _v1 = /*@__PURE__*/ new Vector3();
const _box = /*@__PURE__*/ new Box3();

/**
 * 使用双指针的快速排序算法对数组的子区间进行排序。
 * @param from 子区间的起始索引。
 * @param to 子区间的结束索引（不包含）。
 * @param cmp 比较函数，用于判断元素是否满足某个条件。
 * @param swap 交换函数，用于交换数组中两个元素的位置。
 * @returns 返回排序后基准元素的索引。
 */
const pointSort = (from: number, to: number, cmp: (x: number) => boolean, swap: (a: number, b: number) => void) => {
    let f = from;
    let t = to - 1;
    while (f < t) {
        while ((f <= t) && cmp(f)) {
            f++;
        }
        while ((f <= t) && !cmp(t)) {
            t--;
        }
        if (f < t) {
            swap(f, t);
            f++;
            t--;
        } else {
            break;
        }
    }
    return t + 1;
};

export type OctreeSerialization = {
    trees: {
        offset: number
        length: number
        depth: number
        box: Box3
    }[]
    index: Uint32Array
}

export class Octree {
    box: Box3;
    subTrees: Octree[];
    index: Uint32Array;
    position: BufferAttribute;
    /**
	 * 构造函数，接受一个box参数
	 *
	 * @param {THREE.Box3} box - 一个box对象
	 */
    constructor(box: Box3, index: Uint32Array, position: BufferAttribute) {
        this.box = box;
        this.index = index;
        this.position = position;
        this.subTrees = [];
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

    /**
     * 通过回调函数返回当前节点下所有在box范围内的点
     *
     * @param {IntersectAbleObject} obj - 待判断的box对象，包含min和max属性
     * @param {Function} callback - 回调函数，接收参数为点
     */
    intersect(obj: IntersectAbleObject, callback: (point: Vector3, i: number) => void) {
        if (!obj.intersectsBox(this.box)) {
            return;
        }
        if (this.inside(obj)) {
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
            for (const subTree of this.subTrees) {
                subTree.intersect(obj, callback);
            }
        }
    }

    /**
     * 判断当前节点的包围盒全部在给定对象内
     *
     * @param {IntersectAbleObject} obj 给定的对象，必须是凸对象
     * @returns 如果当前节点的包围盒全部在给定对象内，则返回true；否则返回false
     */
    inside(obj: IntersectAbleObject) {
        for (let i = 0; i < 8; i++) {
            _v1.copy(this.box.min);
            if (i & 1) _v1.x = this.box.max.x;
            if (i & 2) _v1.y = this.box.max.y;
            if (i & 4) _v1.z = this.box.max.z;
            if (!obj.containsPoint(_v1)) return false;
        }
        return true;
    }

    /**
     * 通过回调函数返回所有与射线距离小于d的点
     *
     * @param obj 射线对象
     * @param d 距离
     * @param callback 回调函数参数为相交点的位置和索引
     */
    intersectRay(obj: Ray, d: number, callback: (point: Vector3, i: number) => void) {
        if (!obj.intersectsBox(_box.copy(this.box).expandByVector(
            new Vector3(d, d, d)
        ))) {
            return;
        }
        if (this.subTrees.length === 0) {
            this.forEachPoint((point: Vector3, i: number) => {
                if (obj.distanceToPoint(point) <= d) {
                    callback(point, i);
                }
            });
        } else {
            for (const subTree of this.subTrees) {
                subTree.intersectRay(obj, d, callback);
            }
        }
    }

    /**
	 * 将当前八叉树在给定的级别和最大子节点数下进行分割
	 *
	 * @param {number} level 当前八叉树的高度
	 * @param {number} maxCount 最大子节点数
	 */
    split(level: number, maxCount: number) {
        const box = new Box3(
            new Vector3(Infinity, Infinity, Infinity),
            new Vector3(-Infinity, -Infinity, -Infinity),
        );
        if ((level <= 0) || (this.index.length <= maxCount)) {
            if (this.index.length > 0) {
                this.forEachPoint((point) => {
                    box.min.min(point);
                    box.max.max(point);
                });
                this.box = box;
            }
            return;
        }

        const midpoint = this.box.max.clone().add(this.box.min).multiplyScalar(0.5);

        const split = new Uint32Array(9);
        split[0] = 0;
        split[8] = this.index.length;

        const swap = (a: number, b: number) => {
            const tmp = this.index[a];
            this.index[a] = this.index[b];
            this.index[b] = tmp;
        };

        split[4] = pointSort(0, split[8], (i: number) => {
            return this.position.getX(this.index[i]) < midpoint.x;
        }, swap);
        split[2] = pointSort(0, split[4], (i: number) => {
            return this.position.getY(this.index[i]) < midpoint.y;
        }, swap);
        split[6] = pointSort(split[4], split[8], (i: number) => {
            return this.position.getY(this.index[i]) < midpoint.y;
        }, swap);
        split[1] = pointSort(0, split[2], (i: number) => {
            return this.position.getZ(this.index[i]) < midpoint.z;
        }, swap);
        split[3] = pointSort(split[2], split[4], (i: number) => {
            return this.position.getZ(this.index[i]) < midpoint.z;
        }, swap);
        split[5] = pointSort(split[4], split[6], (i: number) => {
            return this.position.getZ(this.index[i]) < midpoint.z;
        }, swap);
        split[7] = pointSort(split[6], split[8], (i: number) => {
            return this.position.getZ(this.index[i]) < midpoint.z;
        }, swap);

        for (let i = 0; i < 8; i++) {
            const l = split[i + 1] - split[i];
            if (l > 0) {
                const calcBox = (i: number) => {
                    switch (i) {
                    case 0:
                        return new Box3(
                            new Vector3(this.box.min.x, this.box.min.y, this.box.min.z),
                            new Vector3(midpoint.x, midpoint.y, midpoint.z)
                        );
                    case 1:
                        return new Box3(
                            new Vector3(this.box.min.x, this.box.min.y, midpoint.z),
                            new Vector3(midpoint.x, midpoint.y, this.box.max.z)
                        );
                    case 2:
                        return new Box3(
                            new Vector3(this.box.min.x, midpoint.y, this.box.min.z),
                            new Vector3(midpoint.x, this.box.max.y, midpoint.z)
                        );
                    case 3:
                        return new Box3(
                            new Vector3(this.box.min.x, this.box.min.y, midpoint.z),
                            new Vector3(midpoint.x, this.box.max.y, this.box.max.z)
                        );
                    case 4:
                        return new Box3(
                            new Vector3(midpoint.x, this.box.min.y, this.box.min.z),
                            new Vector3(this.box.max.x, midpoint.y, midpoint.z)
                        );
                    case 5:
                        return new Box3(
                            new Vector3(midpoint.x, this.box.min.y, midpoint.z),
                            new Vector3(this.box.max.x, midpoint.y, this.box.max.z)
                        );
                    case 6:
                        return new Box3(
                            new Vector3(midpoint.x, midpoint.y, this.box.min.z),
                            new Vector3(this.box.max.x, this.box.max.y, midpoint.z)
                        );
                    case 7:
                        return new Box3(
                            new Vector3(midpoint.x, this.box.min.y, midpoint.z),
                            new Vector3(this.box.max.x, this.box.max.y, this.box.max.z)
                        );
                    }
                };
                const subBox = calcBox(i)!;
                const subTree = new Octree(subBox, this.index.subarray(split[i], split[i + 1]), this.position);
                subTree.split(level - 1, maxCount);
                this.subTrees.push(subTree);
                box.min.min(subTree.box.min);
                box.max.max(subTree.box.max);
            }
        }
        this.box = box;
    }

    /**
     * 前序遍历八叉树，并执行回调函数
     *
     * @param callback 回调函数，参数为当前八叉树
     * @param deep 当前深度，默认为0
     */
    traversal(callback: (tree: Octree, depth: number) => void, depth = 0) {
        callback(this, depth);
        for (const subTree of this.subTrees) {
            subTree.traversal(callback, depth + 1);
        }
    }

    /**
     * 判断当前节点是否为叶子节点
     *
     * @returns 返回布尔值，表示当前节点是否为叶子节点
     */
    isLeaf() {
        return this.subTrees.length === 0;
    }

    /**
     * 序列化八叉树
     *
     * @returns {OctreeSerialization} 序列化后的八叉树对象
     */
    serialization(): OctreeSerialization {
        const trees: {
            offset: number
            length: number
            depth: number
            box: Box3
        }[] = [];
        this.traversal((tree, depth) => {
            trees.push({
                offset: tree.index.byteOffset / tree.index.BYTES_PER_ELEMENT,
                length: tree.index.length,
                depth: depth,
                box: tree.box
            });
        });
        return {
            trees,
            index: this.index
        };
    }

    /**
     * 从序列化数据中创建八叉树
     *
     * @param geometry 点云对象的geometry
     * @param data 八叉树的序列化数据
     * @returns 创建的八叉树，如果无法创建则返回 null
     */
    static fromSerialization(geometry: BufferGeometry, data: OctreeSerialization): Octree | null {
        const { trees, index } = data;
        if ((trees.length === 0) || (index.length === 0)) {
            return null; // 点云为空
        }
        const position = geometry.getAttribute('position') as BufferAttribute;
        if (position.count !== index.length) {
            return null; // 点云数量不匹配
        }
        const octree = new Octree(new Box3(
            new Vector3(trees[0].box.min.x, trees[0].box.min.y, trees[0].box.min.z),
            new Vector3(trees[0].box.max.x, trees[0].box.max.y, trees[0].box.max.z)
        ), index, position);
        const stack = [{ octree, data: trees[0] }];
        for (let i = 1; i < trees.length; i++) {
            const subtree = new Octree(new Box3(
                new Vector3(trees[i].box.min.x, trees[i].box.min.y, trees[i].box.min.z),
                new Vector3(trees[i].box.max.x, trees[i].box.max.y, trees[i].box.max.z)
            ), index.subarray(trees[i].offset, trees[i].offset + trees[i].length), position);
            while (stack.length > 0) {
                const { octree: lastParentNode, data: tree } = stack[stack.length - 1];
                if (tree.depth < trees[i].depth) {
                    lastParentNode.subTrees.push(subtree);
                    stack.push({ octree: subtree, data: trees[i] });
                    break;
                }
                stack.pop();
            }
            if (stack.length === 0) {
                return null; // 栈为空，无法创建八叉树
            }
        }
        return octree;
    }

    /**
	 * 根据点云对象生成八叉树
	 *
	 * @param {THREE.BufferGeometry} geometry 点云对象的geometry
	 * @param {number} level - 最大高度，默认为8
	 * @param {number} maxPointCount - 非叶子节点中可包含的点最大数量，默认为256
	 * @returns {Octree} 从点数组切片中获取的点的集合
	 */
    static fromPointsGeometry(geometry: BufferGeometry, level = 8, maxPointCount = 256): Octree {
        geometry.computeBoundingBox();
        const box = new Box3().copy(geometry.boundingBox!);
        const position = geometry.getAttribute('position') as BufferAttribute;
        const index = new Uint32Array(position.count);
        for (let i = 0; i < index.length; i++) {
            index[i] = i;
        }
        const octree = new Octree(box, index, position);
        octree.split(level, maxPointCount);
        return octree;
    }

    /**
	 * 根据点云对象生成八叉树
	 *
	 * @param {THREE.Points} points 点云对象
	 * @param {number} level - 最大高度，默认为8
	 * @param {number} maxPointCount - 非叶子节点中可包含的点最大数量，默认为256
	 * @returns {Octree} 从点数组切片中获取的点的集合
	 */
    static fromPoints(points: Points, level = 8, maxPointCount = 256): Octree {
        return Octree.fromPointsGeometry(points.geometry, level, maxPointCount);
    }
}
