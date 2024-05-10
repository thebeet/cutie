import {
    Box3,
    BufferAttribute,
    BufferGeometry,
    Points,
    Vector3,
} from 'three';
import { SpatialTree, SpatialTreeSerialization, fromPointsGeometry, fromSerialization, pointSort } from './SpatialTree';

export class QuadTree extends SpatialTree {
    /**
	 * 构造函数，接受一个box参数
	 *
	 * @param {THREE.Box3} box - 一个box对象
	 */
    constructor(box: Box3, index: Uint32Array, position: BufferAttribute) {
        super(box, index, position);
    }

    /**
	 * 将当前四叉树在给定的级别和最大子节点数下进行分割
	 *
	 * @param {number} level 当前四叉树的高度
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
        split[4] = this.index.length;

        const swap = (a: number, b: number) => {
            const tmp = this.index[a];
            this.index[a] = this.index[b];
            this.index[b] = tmp;
        };

        split[2] = pointSort(0, split[4], (i: number) => {
            return this.position.getX(this.index[i]) < midpoint.x;
        }, swap);
        split[1] = pointSort(0, split[2], (i: number) => {
            return this.position.getY(this.index[i]) < midpoint.y;
        }, swap);
        split[3] = pointSort(split[2], split[4], (i: number) => {
            return this.position.getY(this.index[i]) < midpoint.y;
        }, swap);

        for (let i = 0; i < 4; i++) {
            const l = split[i + 1] - split[i];
            if (l > 0) {
                const calcBox = (i: number) => {
                    switch (i) {
                    case 0:
                        return new Box3(
                            new Vector3(this.box.min.x, this.box.min.y, this.box.min.z),
                            new Vector3(midpoint.x, midpoint.y, this.box.max.z)
                        );
                    case 1:
                        return new Box3(
                            new Vector3(this.box.min.x, midpoint.y, this.box.min.z),
                            new Vector3(midpoint.x, this.box.max.y, this.box.max.z)
                        );
                    case 2:
                        return new Box3(
                            new Vector3(midpoint.x, this.box.min.y, this.box.min.z),
                            new Vector3(this.box.max.x, midpoint.y, this.box.max.z)
                        );
                    case 3:
                        return new Box3(
                            new Vector3(midpoint.x, midpoint.y, this.box.min.z),
                            new Vector3(this.box.max.x, this.box.max.y, this.box.max.z)
                        );
                    }
                };
                const subBox = calcBox(i)!;
                const subTree = new QuadTree(subBox, this.index.subarray(split[i], split[i + 1]), this.position);
                subTree.split(level - 1, maxCount);
                this.subTrees.push(subTree);
                box.min.min(subTree.box.min);
                box.max.max(subTree.box.max);
            }
        }
        this.box = box;
    }

    /**
     * 从序列化数据中创建四叉树
     *
     * @param geometry 点云对象的geometry
     * @param data 四叉树的序列化数据
     * @returns 创建的四叉树，如果无法创建则返回 null
     */
    static fromSerialization(geometry: BufferGeometry, data: SpatialTreeSerialization): QuadTree | null {
        return fromSerialization(geometry, data, (box, index, position) => new QuadTree(box, index, position));
    }

    /**
	 * 根据点云对象生成四叉树
	 *
	 * @param {THREE.BufferGeometry} geometry 点云对象的geometry
	 * @param {number} level - 最大高度，默认为8
	 * @param {number} maxPointCount - 非叶子节点中可包含的点最大数量，默认为256
	 * @returns {QuadTree} 从点数组切片中获取的点的集合
	 */
    static fromPointsGeometry(geometry: BufferGeometry, level = 8, maxPointCount = 256): QuadTree {
        return fromPointsGeometry(geometry, level, maxPointCount, (box, index, position) => new QuadTree(box, index, position));
    }

    /**
	 * 根据点云对象生成四叉树
	 *
	 * @param {THREE.Points} points 点云对象
	 * @param {number} level - 最大高度，默认为8
	 * @param {number} maxPointCount - 非叶子节点中可包含的点最大数量，默认为256
	 * @returns {QuadTree} 从点数组切片中获取的点的集合
	 */
    static fromPoints(points: Points, level = 8, maxPointCount = 256): QuadTree {
        return this.fromPointsGeometry(points.geometry, level, maxPointCount);
    }
}
