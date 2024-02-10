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

    return {
        getBoxSize, getBoxPosition,
        setBoxSize, setBoxPosition
    };
};