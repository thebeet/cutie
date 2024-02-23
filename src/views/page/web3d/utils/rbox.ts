import { Matrix4, Quaternion, Euler, Vector3 } from 'three';
import { RBox } from '../types';

export const rbox2Matrix = (rbox: RBox): Matrix4 => {
    return new Matrix4().compose(
        new Vector3(rbox.position.x, rbox.position.y, rbox.position.z),
        new Quaternion().setFromEuler(
            new Euler(rbox.rotation.x, rbox.rotation.y, rbox.rotation.z)
        ),
        new Vector3(rbox.size.x, rbox.size.y, rbox.size.z)
    );
};

export const rboxIOUBruteforce = (rbox1: RBox, rbox2: RBox): number => {
    const m1 = rbox2Matrix(rbox1).invert();
    const m2 = rbox2Matrix(rbox2);
    const N = 100;
    let count = 0;
    const m = m1.multiply(m2);
    const _v = new Vector3();
    for (let x = -N + 1; x < N; x += 2) {
        for (let y = -N + 1; y < N; y += 2) {
            for (let z = -N + 1; z < N; z += 2) {
                _v.set(x / N / 2, y / N / 2, z / N / 2).applyMatrix4(m);
                if ((_v.x >= -.5 && _v.y >= -.5 && _v.z >= -.5) &&
                    (_v.x <= .5 && _v.y <= .5 && _v.z <= .5)) {
                    count++;
                }
            }
        }
    }
    const volumn1 = rbox1.size.x * rbox1.size.y * rbox1.size.z;
    const volumn2 = rbox2.size.x * rbox2.size.y * rbox2.size.z;
    const intersect = Math.min(volumn1 * count / (N * N * N), volumn2);
    const union = volumn1 + volumn2 - intersect;
    return intersect / union;
};
