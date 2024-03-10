import { RBox } from '@cutie/web3d';
import * as THREE from 'three';
import { axis2d, views } from '../constants';

type AXIS2D = 'x' | 'y';
type Rect = {
    x: number
    y: number
    width: number
    height: number
}

export const useBoxHelper = (name: 'front' | 'side' | 'top') => {
    const getBoxSize = (box: RBox, axis: AXIS2D) => {
        return box.size[axis2d[name][axis]];
    };
    const getBoxPosition = (box: RBox, axis: AXIS2D) => {
        const vector = views[name][axis].clone().applyEuler(
            new THREE.Euler(box.rotation.x, box.rotation.y, box.rotation.z)
        );
        return vector.dot(box.position);
    };

    const setBoxPositionAndSize = (box: RBox, delta: Rect): RBox => {
        const size = { ...box.size };
        size[axis2d[name].x] += delta.width;
        size[axis2d[name].y] += delta.height;
        const v = new THREE.Vector3();
        v[axis2d[name].x] = delta.x;
        v[axis2d[name].y] = -delta.y;
        v.applyEuler(new THREE.Euler(box.rotation.x, box.rotation.y, box.rotation.z));
        return {
            ...box,
            position: {
                x: box.position.x + v.x,
                y: box.position.y + v.y,
                z: box.position.z + v.z,
            },
            size,
        };
    };

    const setBoxRotation = (box: RBox, angle: number): RBox => {
        const euler = new THREE.Euler(box.rotation.x, box.rotation.y, box.rotation.z);
        const rotate = new THREE.Euler(
            name === 'front' ? angle : 0,
            name === 'side' ? -angle : 0,
            name === 'top' ? angle : 0,
        );
        const quaternionA = new THREE.Quaternion().setFromEuler(euler);
        const quaternionB = new THREE.Quaternion().setFromEuler(rotate);
        quaternionA.multiply(quaternionB);
        const combinedEuler = new THREE.Euler().setFromQuaternion(quaternionA);
        return {
            ...box,
            rotation: {
                x: combinedEuler.x,
                y: combinedEuler.y,
                z: combinedEuler.z
            }
        };
    };

    const getAxis = (box: RBox) => {
        const mat = new THREE.Matrix4().compose(
            new THREE.Vector3(box.position.x, box.position.y, box.position.z),
            new THREE.Quaternion().setFromEuler(
                new THREE.Euler(box.rotation.x, box.rotation.y, box.rotation.z)
            ),
            new THREE.Vector3(box.size.x / 2, box.size.y / 2, box.size.z / 2)
        );
        const { x, y, z } = { x: new THREE.Vector3(), y: new THREE.Vector3(), z: new THREE.Vector3() };
        mat.extractBasis(x, y, z);
        return { x, y, z };
    };

    /**
     * n: UP
     * s: DOWN
     * e: RIGHT
     * w: LEFT
     */
    const getControlPoints = (box: RBox) => {
        const axis = getAxis(box);
        const o = new THREE.Vector3(box.position.x, box.position.y, box.position.z);
        return [
            { pos: 'nw', point: o.clone().sub(axis[axis2d[name].x]).add(axis[axis2d[name].y]).add(axis[axis2d[name].z]) },
            { pos: 'n', point: o.clone().add(axis[axis2d[name].y]).add(axis[axis2d[name].z]) },
            { pos: 'ne', point: o.clone().add(axis[axis2d[name].x]).add(axis[axis2d[name].y]).add(axis[axis2d[name].z]) },
            { pos: 'e', point: o.clone().add(axis[axis2d[name].x]).add(axis[axis2d[name].z]) },
            { pos: 'se', point: o.clone().add(axis[axis2d[name].x]).sub(axis[axis2d[name].y]).add(axis[axis2d[name].z]) },
            { pos: 's', point: o.clone().sub(axis[axis2d[name].y]).add(axis[axis2d[name].z]) },
            { pos: 'sw', point: o.clone().sub(axis[axis2d[name].x]).sub(axis[axis2d[name].y]).add(axis[axis2d[name].z]) },
            { pos: 'w', point: o.clone().sub(axis[axis2d[name].x]).add(axis[axis2d[name].z]) },
        ];
    };

    const getRotateControlPoint = (box: RBox, handleLength: number = 0.2) => {
        const axis = getAxis(box);
        const o = new THREE.Vector3(box.position.x, box.position.y, box.position.z);
        return o.clone().add(axis[axis2d[name].y].clone().multiplyScalar(1 + handleLength).add(axis[axis2d[name].z]));
    };

    return {
        getBoxSize, getBoxPosition,
        setBoxRotation,
        setBoxPositionAndSize,
        getControlPoints, getRotateControlPoint
    };
};