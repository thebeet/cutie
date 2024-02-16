import { Matrix4, Quaternion, Euler, Vector3 } from 'three';
import { RBox } from '../types';

export const rbox2Matrix = (rbox: RBox): Matrix4 => {
    return new Matrix4().compose(
        new Vector3(rbox.position.x, rbox.position.y, rbox.position.z),
        new Quaternion().setFromEuler(
            new Euler(rbox.rotation.phi, rbox.rotation.theta, rbox.rotation.psi)
        ),
        new Vector3(rbox.size.length, rbox.size.width, rbox.size.height)
    );
};