import { ITFrame } from '@cutie/web3d';
import * as THREE from 'three';

const zeroPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

export const point2dToPoint3d = (point: THREE.Vector2, camera: THREE.Camera, frame: ITFrame) => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(point, camera);

    const ps: THREE.Vector3[] = [];
    const target = new THREE.Vector3();
    frame.intersectRay(raycaster.ray, .5, (p) => {
        ps.push(p.clone());
    });
    if (ps.length >= 1) {
        const nps = ps.map(p => ({
            point: p,
            dis: camera.position.distanceToSquared(p)
        })).sort((a, b) => {
            return a.dis - b.dis;
        });

        raycaster.ray.closestPointToPoint(nps[0].point, target);
    } else {
        raycaster.ray.intersectPlane(zeroPlane, target);
    }
    return target;
};