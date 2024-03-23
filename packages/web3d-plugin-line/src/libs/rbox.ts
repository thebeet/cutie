import { Euler, Frustum, Matrix4, Plane, Quaternion, Vector3 } from 'three';

export type RBox = {
    readonly position: {
        readonly x: number
        readonly y: number
        readonly z: number
    }
    readonly rotation: {
        readonly x: number
        readonly y: number
        readonly z: number
    }
    readonly size: {
        readonly x: number
        readonly y: number
        readonly z: number
    }
}

export const rbox2Matrix = (rbox: RBox): Matrix4 => {
    return new Matrix4().compose(
        new Vector3(rbox.position.x, rbox.position.y, rbox.position.z),
        new Quaternion().setFromEuler(
            new Euler(rbox.rotation.x, rbox.rotation.y, rbox.rotation.z)
        ),
        new Vector3(rbox.size.x, rbox.size.y, rbox.size.z)
    );
};

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