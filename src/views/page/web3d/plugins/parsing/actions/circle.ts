import * as THREE from 'three';
import { ParsingOperation } from '../operations/ParsingOperation';
import { useDrama } from '@web3d/hooks/drama';
import { storeToRefs } from 'pinia';
import { useParsingStore } from '../stores';
import { GroupOperation, Operation } from '@web3d/operator/Operation';

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

export const circleAction = (points: readonly {x:  number, y:  number}[], camera: THREE.Camera): Operation | null => {
    const { activeFrames } = useDrama();
    const { mainLabelID } = storeToRefs(useParsingStore());

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
    const operations: ParsingOperation[] = [];
    activeFrames.value.forEach(frame => {
        const result: number[] = [];
        frame.intersect(frustum, (_, index) => {
            result.push(index);
        });
        if (result.length > 0) {
            const operation = new ParsingOperation(frame, mainLabelID.value, result);
            operations.push(operation);
        }
    });
    if (operations.length === 0) {
        return null;
    }
    if (operations.length === 1) {
        return operations[0];
    }
    return new GroupOperation(operations);
};