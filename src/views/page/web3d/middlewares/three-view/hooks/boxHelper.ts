import { RBox } from '@web3d/types';
import * as THREE from 'three';

const NV = {
    'front': {
        'x': new THREE.Vector3(),
        'y': new THREE.Vector3(0, 1, 0),
        'z': new THREE.Vector3(0, 0, -1),
    },
    'side': {
        'x': new THREE.Vector3(1, 0, 0),
        'y': new THREE.Vector3(),
        'z': new THREE.Vector3(0, 0, -1),
    },
    'top': {
        'x': new THREE.Vector3(1, 0, 0),
        'y': new THREE.Vector3(0, -1, 0),
        'z': new THREE.Vector3(),
    },
};

export const useBoxHelper = () => {

    const getBoxSize = (box: RBox, axis: 'x' | 'y' | 'z') => {
        switch (axis) {
        case 'x':
            return box.size.length;
        case 'y':
            return box.size.width;
        case 'z':
            return box.size.height;
        default:
            throw new Error('Invalid axis');
        };
    };
    const getBoxPosition = (box: RBox, name: 'front' | 'side' | 'top', axis: 'x' | 'y' | 'z') => {
        const vector = NV[name][axis].clone().applyEuler(
            new THREE.Euler(box.rotation.phi, box.rotation.theta, box.rotation.psi)
        );
        return vector.dot(box.position);
    };
    const setBoxSize = (box: RBox, axis: 'x' | 'y' | 'z', value: number) => {
        switch (axis) {
        case 'x':
            return box.size.length = value;
        case 'y':
            return box.size.width = value;
        case 'z':
            return box.size.height = value;
        default:
            throw new Error('Invalid axis');
        };
    };
    const setBoxPosition = (box: RBox, name: 'front' | 'side' | 'top', axis: 'x' | 'y' | 'z', value: number) => {
        const vector = NV[name][axis].clone().applyEuler(
            new THREE.Euler(box.rotation.phi, box.rotation.theta, box.rotation.psi)
        );
        const old = vector.dot(box.position);
        vector.multiplyScalar(value - old);
        box.position.x += vector.x;
        box.position.y += vector.y;
        box.position.z += vector.z;
    };

    const setBoxRotation = (box: RBox, axis: 'x' | 'y' | 'z' | 'front' | 'side' | 'top', angle: number) => {
        const euler = new THREE.Euler(box.rotation.phi, box.rotation.theta, box.rotation.psi);
        const rotate = new THREE.Euler(
            axis === 'x' || axis === 'front' ? angle : 0,
            axis === 'y' || axis === 'side' ? -angle : 0,
            axis === 'z' || axis === 'top' ? angle : 0
        );
        const quaternionA = new THREE.Quaternion().setFromEuler(euler);
        const quaternionB = new THREE.Quaternion().setFromEuler(rotate);
        quaternionA.multiply(quaternionB);
        const combinedEuler = new THREE.Euler().setFromQuaternion(quaternionA);
        box.rotation.phi = combinedEuler.x;
        box.rotation.theta = combinedEuler.y;
        box.rotation.psi = combinedEuler.z;
    };

    const getAxis = (box: RBox) => {
        const mat = new THREE.Matrix4().compose(
            new THREE.Vector3(box.position.x, box.position.y, box.position.z),
            new THREE.Quaternion().setFromEuler(
                new THREE.Euler(box.rotation.phi, box.rotation.theta, box.rotation.psi)
            ),
            new THREE.Vector3(box.size.length / 2, box.size.width / 2, box.size.height / 2)
        );
        const { x, y, z } = { x: new THREE.Vector3(), y: new THREE.Vector3(), z: new THREE.Vector3() };
        mat.extractBasis(x, y, z);
        return { x, y, z };
    };

    const getControlPoints = (box: RBox, xx: 'x' | 'y' | 'z', yy: 'x' | 'y' | 'z') => {
        const axis = getAxis(box);
        const o = new THREE.Vector3(box.position.x, box.position.y, box.position.z);
        return [
            { pos: 'sw', point: o.clone().sub(axis[xx]).sub(axis[yy]) },
            { pos: 'nw', point: o.clone().sub(axis[xx]).add(axis[yy]) },
            { pos: 'se', point: o.clone().add(axis[xx]).sub(axis[yy]) },
            { pos: 'ne', point: o.clone().add(axis[xx]).add(axis[yy]) },
            { pos: 'n', point: o.clone().add(axis[yy]) },
            { pos: 's', point: o.clone().sub(axis[yy]) },
            { pos: 'e', point: o.clone().add(axis[xx]) },
            { pos: 'w', point: o.clone().sub(axis[xx]) },
        ];
    };

    const getRotateControlPoint = (box: RBox, _: 'x' | 'y' | 'z', yy: 'x' | 'y' | 'z', handleLength: number = 0.2) => {
        const axis = getAxis(box);
        const o = new THREE.Vector3(box.position.x, box.position.y, box.position.z);
        return o.clone().add(axis[yy].clone().multiplyScalar(1 + handleLength));
    };

    return {
        getBoxSize, getBoxPosition,
        setBoxSize, setBoxPosition,
        setBoxRotation,
        getControlPoints, getRotateControlPoint
    };
};