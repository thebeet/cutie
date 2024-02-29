import * as THREE from 'three';
import { useDrama } from '@web3d/hooks/drama';

const getPlane = (points: THREE.Vector2[], camera: THREE.Camera): THREE.Plane[] => {
    return points.map(point => {
        const ray = new THREE.Raycaster();
        ray.setFromCamera(point, camera);
        return ray;
    }).map((current, i, rays) => {
        const next = rays[(i + 1) % rays.length];
        const a = current.ray.origin.clone().add(current.ray.direction);
        const b = next.ray.origin.clone().add(next.ray.direction);
        const c = current.ray.origin;
        const plane = new THREE.Plane();
        plane.setFromCoplanarPoints(a, b, c);
        return plane;
    });
};

export const boxAction = (points: readonly {x: number, y: number}[], camera: THREE.Camera): RBox => {
    const { activeFrames } = useDrama();

    const minx = Math.min(points[0].x, points[1].x);
    const maxx = Math.max(points[0].x, points[1].x);
    const miny = Math.min(points[0].y, points[1].y);
    const maxy = Math.max(points[0].y, points[1].y);
    const rect: THREE.Vector2[] = [
        new THREE.Vector2(minx, miny),
        new THREE.Vector2(minx, maxy),
        new THREE.Vector2(maxx, maxy),
        new THREE.Vector2(maxx, miny),
    ];
    const planes = getPlane(rect, camera);
    const frustum = new THREE.Frustum(
        planes[0], planes[1], planes[2], planes[3],
        new THREE.Plane(new THREE.Vector3(0, 0, 1), 10000),
        new THREE.Plane(new THREE.Vector3(0, 0, -1), 10000),
    );

    const bBox = new THREE.Box3(
        new THREE.Vector3(Infinity, Infinity, Infinity),
        new THREE.Vector3(-Infinity, -Infinity, -Infinity)
    );

    activeFrames.value.forEach(frame => {
        const matInv = frame.matrixWorld.clone().invert();
        const frustumForFrame = frustum.clone();

        frustumForFrame.planes.forEach(p => {
            p.applyMatrix4(matInv);
        });
        const frameBBox = new THREE.Box3(
            new THREE.Vector3(Infinity, Infinity, Infinity),
            new THREE.Vector3(-Infinity, -Infinity, -Infinity)
        );
        frame.intersect(frustumForFrame, (point) => {
            frameBBox.min.min(point);
            frameBBox.max.max(point);
        });
        frameBBox.applyMatrix4(frame.matrixWorld);
        bBox.min.min(frameBBox.min);
        bBox.max.max(frameBBox.max);
    });

    return bBox;
};