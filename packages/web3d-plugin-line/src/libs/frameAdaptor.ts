import { Points, Vector3, Box3 } from 'three';

export interface IntersectAbleObject {
    containsPoint(point: Vector3): boolean;
    intersectsBox(box: Box3): boolean;
}

export interface PointsIntersect {
    intersect(obj: IntersectAbleObject, callback: (point: Vector3, i: number) => void): void;
}

export interface ITFrame extends PointsIntersect {
    points: Points | undefined;
}