import * as THREE from 'three';

export interface IntersectAbleObject {
    containsPoint(point: THREE.Vector3): boolean;
    intersectsBox(box: THREE.Box3): boolean;
}

export interface PointsIntersect {
    intersect(obj: IntersectAbleObject, callback: (point: THREE.Vector3, i: number) => void): void;
    intersectRay(obj: THREE.Ray, d: number, callback: (point: THREE.Vector3, i: number) => void): void;
}

const _infSphere = new THREE.Sphere(
    new THREE.Vector3(0, 0, 0), Infinity
);

interface ITFrame extends PointsIntersect {
    readonly index: number;
    readonly frame: THREE.Object3D;
    intersectDelegate: PointsIntersect | undefined;
    points: THREE.Points | undefined;
    readonly onPointsLoaded: Promise<{frame: ITFrame, points: THREE.Points}>;
}

export class TFrame extends THREE.Object3D implements ITFrame {
    readonly index: number;
    _points: THREE.Points | undefined;
    intersectDelegate: PointsIntersect | undefined;

    _pointsLoadedPromise: {
        promise: Promise<{frame: TFrame; points: THREE.Points}>,
        resolve: (payload: {frame: TFrame; points: THREE.Points}) => void,
        reject: () => void,
    };

    constructor(index: number) {
        super();
        this.index = index;
        // @ts-ignore
        this._pointsLoadedPromise = Promise.withResolvers();
        this.addEventListener('change', () => {
            // @ts-ignore
            this.frame.parent?.dispatchEvent({ type: 'change' });
        });
    }

    get frame() {
        return this;
    }

    set points(obj: THREE.Points | undefined) {
        if (this._points !== undefined) {
            throw new Error('points was set already');
        }
        this._points = obj;
        if (this._points !== undefined) {
            this._points.frustumCulled = false;
            this._points.geometry.boundingSphere = _infSphere;
            this.add(this._points);
            if (this.frame.visible) {
                this.update();
            }
            this._pointsLoadedPromise.resolve({
                frame: this,
                points: this._points
            });
        }
    }

    add(...object: THREE.Object3D<THREE.Object3DEventMap>[]) {
        super.add(...object);
        for (const obj of object) {
            obj.updateMatrixWorld(true);
        }
        return this;
    }

    get points() {
        return this._points;
    }

    get onPointsLoaded(): Promise<{frame: TFrame, points: THREE.Points}> {
        return this._pointsLoadedPromise.promise;
    }

    intersect(obj: IntersectAbleObject, callback: (point: THREE.Vector3, index: number) => void) {
        this.intersectDelegate?.intersect(obj, callback);
    }

    intersectRay(obj: THREE.Ray, d: number, callback: (point: THREE.Vector3, index: number) => void) {
        this.intersectDelegate?.intersectRay(obj, d, callback);
    }

    get isTFrame() {
        return true;
    }

    update() {
        // @ts-ignore
        this.frame.dispatchEvent({ type: 'change' });
    }
}