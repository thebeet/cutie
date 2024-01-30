import * as THREE from 'three';
import { ParsingOperation } from '../operations/ParsingOperation';
import { useDrama } from '@web3d/hooks/drama';
import { storeToRefs } from 'pinia';
import { useParsingStore } from '../stores';
import { GroupOperation, Operation } from '@web3d/operator/Operation';
import { convexHull2D, pointInPolygon, pointsBox2DBounding } from '../libs/ConvexHull2D';
import { DouglasPeucker } from '../libs/DouglasPeucker';

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

export const polylineAction = (points: readonly {x: number, y: number}[], camera: THREE.Camera): Operation | null => {
    const { activeFrames } = useDrama();
    const { mainLabelID } = storeToRefs(useParsingStore());

    const tpoints = [...points, points[0]].map(p => new THREE.Vector2(p.x, p.y));
    const simplePointsTmp = DouglasPeucker(tpoints.slice(1), 1e-3);
    const simplePoints = [...simplePointsTmp, simplePointsTmp[0]];
    const conhexhull = convexHull2D(tpoints);
    const { rect } = pointsBox2DBounding(conhexhull);

    const planes = getPlane([rect[0], rect[1], rect[2], rect[3]], camera);
    const frustum = new THREE.Frustum(
        planes[0], planes[1], planes[2], planes[3],
        new THREE.Plane(new THREE.Vector3(0, 0, 1), 10000),
        new THREE.Plane(new THREE.Vector3(0, 0, -1), 10000),
    );
    const cameraProjScreenMatrix = new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix, camera.matrixWorldInverse);

    const _p2 = new THREE.Vector2();
    const _p3 = new THREE.Vector3();
    const operations: Operation[] = [];
    activeFrames.value.forEach(frame => {
        const result: number[] = [];
        const frameProjScreenMatrix = cameraProjScreenMatrix.clone().multiply(frame.matrixWorld);
        const matInv = frame.points!.matrixWorld.clone().invert();
        const frustumForFrame = frustum.clone();
        frustumForFrame.planes.forEach(p => {
            p.applyMatrix4(matInv);
        });
        frame.intersect(frustumForFrame, (point, index) => {
            _p3.copy(point).applyMatrix4(frameProjScreenMatrix);
            _p2.set(_p3.x, _p3.y);
            if (pointInPolygon(simplePoints, _p2)) {
                result.push(index);
            }
        });
        const operation = new ParsingOperation(frame, mainLabelID.value, result);
        operations.push(operation);
    });
    return new GroupOperation(operations);
};