import * as THREE from 'three';
import { ParsingOperation } from '../operations/ParsingOperation';
import { Operation, TFrame, useDrama } from '@cutie/web3d';
import { storeToRefs } from 'pinia';
import { useParsingStore } from '../stores';

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

export const rectAction = (points: readonly {x:  number, y:  number}[], camera: THREE.Camera): Operation | null => {
    const { activeFrames } = useDrama();
    const { mainLabelID, instances } = storeToRefs(useParsingStore());

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
    const intersectPoints: [TFrame, number[]][] = [];
    activeFrames.value.forEach(frame => {
        const result: number[] = [];
        const matInv = frame.points!.matrixWorld.clone().invert();
        const frustumForFrame = frustum.clone();

        frustumForFrame.planes.forEach(p => {
            p.applyMatrix4(matInv);
        });
        frame.intersect(frustumForFrame, (_, index) => {
            result.push(index);
        });
        if (result.length > 0) {
            intersectPoints.push([frame, result]);
        }
    });
    if (intersectPoints.length === 0) {
        return null;
    }
    return new ParsingOperation(mainLabelID.value, intersectPoints, instances.value);
};