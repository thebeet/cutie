import { RBox } from '@web3d/types';
import * as THREE from 'three';
import { useThreeViewStore } from '../stores';

type AXIS = 'x' | 'y' | 'z';
type AXIS2D = 'x' | 'y';
type THREEVIEWNAME = 'front' | 'side' | 'top';

const axis2d = {
    'front': {
        'x': 'y',
        'y': 'z',
        'z': 'x'
    },
    'side': {
        'x': 'x',
        'y': 'z',
        'z': 'y'
    },
    'top': {
        'x': 'x',
        'y': 'y',
        'z': 'z'
    },
} as { [key in THREEVIEWNAME]: { [key in AXIS]: AXIS } };

export const useBoxHelper = (name: 'front' | 'side' | 'top') => {
    const NV = useThreeViewStore();
    const getBoxSize = (box: RBox, axis: AXIS2D) => {
        switch (axis2d[name][axis]) {
        case 'x':
            return box.size.x;
        case 'y':
            return box.size.y;
        case 'z':
            return box.size.z;
        default:
            throw new Error('Invalid axis');
        };
    };
    const getBoxPosition = (box: RBox, axis: AXIS2D) => {
        const vector = NV[name][axis].clone().applyEuler(
            new THREE.Euler(box.rotation.x, box.rotation.y, box.rotation.z)
        );
        return vector.dot(box.position);
    };
    const setBoxSize = (box: RBox, axis: AXIS2D, value: number) => {
        switch (axis2d[name][axis]) {
        case 'x':
            return box.size.x = value;
        case 'y':
            return box.size.y = value;
        case 'z':
            return box.size.z = value;
        default:
            throw new Error('Invalid axis');
        };
    };
    const setBoxPosition = (box: RBox, axis: AXIS2D, value: number) => {
        const vector = NV[name][axis].clone().applyEuler(
            new THREE.Euler(box.rotation.x, box.rotation.y, box.rotation.z)
        );
        const old = vector.dot(box.position);
        vector.multiplyScalar(value - old);
        box.position.x += vector.x;
        box.position.y += vector.y;
        box.position.z += vector.z;
    };

    const setBoxRotation = (box: RBox, angle: number) => {
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
        box.rotation.x = combinedEuler.x;
        box.rotation.y = combinedEuler.y;
        box.rotation.z = combinedEuler.z;
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
        setBoxSize, setBoxPosition,
        setBoxRotation,
        getControlPoints, getRotateControlPoint
    };
};