import * as THREE from 'three';
import { ParsingBox, ParsingInstance } from '../types';
import { useDrama, frustumFromRBox, TFrame } from '@cutie/web3d';
import { ParsingOperation } from '../operations/ParsingOperation';

const ESP = 1e-6;

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

const rectAction = (points: readonly {x: number, y: number}[], camera: THREE.Camera) => {
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
    const results: [TFrame, number[]][] = [];
    activeFrames.value.forEach(frame => {
        const result: number[] = [];
        const matInv = frame.matrixWorld.clone().invert();
        const frustumForFrame = frustum.clone();

        frustumForFrame.planes.forEach(p => {
            p.applyMatrix4(matInv);
        });
        frame.intersect(frustumForFrame, (_, index) => {
            result.push(index);
        });
        if (result.length > 0) {
            results.push([frame, result]);
        }
    });
    return results;
};

const computeBoundingBox = (frame: TFrame, index: number[], rotation: THREE.Euler) => {
    const box = new THREE.Box3(
        new THREE.Vector3(Infinity, Infinity, Infinity),
        new THREE.Vector3(-Infinity, -Infinity, -Infinity)
    );
    const position = frame.points!.geometry.getAttribute('position');
    const _v = new THREE.Vector3();
    const quaternion = new THREE.Quaternion().setFromEuler(rotation);
    const invertQuaternion = quaternion.clone().invert();
    index.forEach(i => {
        _v.fromBufferAttribute(position, i).applyQuaternion(invertQuaternion);
        box.min.min(_v);
        box.max.max(_v);
    });
    return box;
};

export const boxAction = (points: readonly {x: number, y: number}[], camera: THREE.Camera): ParsingBox | null => {
    const { primaryFrame } = useDrama();
    const rotation = new THREE.Euler(0, 0, camera.rotation.z);
    const intersect = rectAction(points, camera);
    const boxes = intersect.map(([frame, points]) => {
        return computeBoundingBox(frame, points, rotation);
    });
    const unionBox = boxes.reduce((acc, box) => acc.union(box), new THREE.Box3(
        new THREE.Vector3(Infinity, Infinity, Infinity),
        new THREE.Vector3(-Infinity, -Infinity, -Infinity)
    ));
    if (unionBox.min.x === Infinity) {
        return null;
    }
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    unionBox.getCenter(center);
    unionBox.getSize(size);
    const quaternion = new THREE.Quaternion().setFromEuler(rotation);
    center.applyQuaternion(quaternion);
    center.applyMatrix4(primaryFrame.value.matrixWorld.clone().invert());
    const bBox = {
        uuid: THREE.MathUtils.generateUUID(),
        type: 'box',
        schema: 'box',
        frameIndex: 0,
        label: '',
        description: '',
        position: {
            x: center.x,
            y: center.y,
            z: center.z
        },
        size: {
            x: size.x + ESP,
            y: size.y + ESP,
            z: size.z + ESP
        },
        rotation: {
            x: rotation.x,
            y: rotation.y,
            z: rotation.z
        }
    };
    return bBox;
};

export const makeOperationFromBoxes = (frames: TFrame[], boxes: ParsingBox[], mainLabelID: number, instances: ParsingInstance[]) => {
    const intersectPoints: [TFrame, number[]][] = [];
    boxes.forEach(box => {
        const frustum = frustumFromRBox(box);
        frames.forEach(frame => {
            const result: number[] = [];
            const matInv = frame.matrixWorld.clone().invert();
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
    });
    if (intersectPoints.length === 0) {
        return null;
    }
    return new ParsingOperation(mainLabelID, intersectPoints, instances);
};