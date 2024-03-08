import {
    Camera,
    Matrix4,
    Object3D,
    Scene,
    Vector3
} from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

interface CSS2DRendererParameters {
    element?: HTMLElement;
}

class CSS2DRenderer {
    domElement: HTMLElement;

    private _width: number;
    private _height: number;
    private _widthHalf: number;
    private _heightHalf: number;
    private _viewMatrix: Matrix4;
    private _viewProjectionMatrix: Matrix4;
    private _vector: Vector3;
    private _cache: {
        objects: WeakMap<Object3D, { distanceToCameraSquared: number }>;
    };

    constructor(parameters: CSS2DRendererParameters = {}) {
        const domElement = parameters.element || document.createElement('div');
        domElement.style.overflow = 'hidden';

        this.domElement = domElement;

        this._width = 0;
        this._height = 0;
        this._widthHalf = 0;
        this._heightHalf = 0;
        this._viewMatrix = new Matrix4();
        this._viewProjectionMatrix = new Matrix4();
        this._vector = new Vector3();
        this._cache = {
            objects: new WeakMap()
        };
    }

    getSize() {
        return {
            width: this._width,
            height: this._height
        };
    }

    setSize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._widthHalf = width / 2;
        this._heightHalf = height / 2;

        this.domElement.style.width = `${width}px`;
        this.domElement.style.height = `${height}px`;
    }

    render(scene: Scene, camera: Camera) {
        const frame = (parseInt(this.domElement.getAttribute('data-frame') || '0', 10) + 1).toString();
        this.domElement.setAttribute('data-frame', frame);

        this._viewMatrix.copy(camera.matrixWorldInverse);
        this._viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, this._viewMatrix);

        this._renderObjects(scene, camera, frame);
        this._zOrder(scene);
        const removed = [];
        for (const element of this.domElement.children) {
            const tag = element.getAttribute('data-frame');
            if (tag !== frame) {
                removed.push(element);
            }
        }
        removed.forEach(el => this.domElement.removeChild(el));
    }

    private _renderObjects(object: Object3D, camera: Camera, frame: string): void {
        if ((object as any).isCSS2DObject) {
            const css2dObject = (object as CSS2DObject);
            this._vector.setFromMatrixPosition(object.matrixWorld);
            this._vector.applyMatrix4(this._viewProjectionMatrix);

            const visible = this._vector.z >= -1 && this._vector.z <= 1;
            css2dObject.element.style.display = visible ? '' : 'none';

            if (visible) {
                css2dObject.element.style.transform = `translate(${-100 * css2dObject.center.x}%, ${-100 * css2dObject.center.y}%) translate(${(this._vector.x * this._widthHalf) + this._widthHalf}px,${(-this._vector.y * this._heightHalf) + this._heightHalf}px)`;
                css2dObject.element.setAttribute('data-frame', frame);

                if (!css2dObject.element.parentNode || css2dObject.element.parentNode !== this.domElement) {
                    this.domElement.appendChild(css2dObject.element);
                }
            }

            this._cache.objects.set(object, {
                distanceToCameraSquared: this._vector.distanceToSquared(camera.position)
            });
        }

        for (const child of object.children) {
            if (child.visible) {
                this._renderObjects(child, camera, frame);
            }
        }
    };

    private _zOrder(scene: Scene) {
        const sorted = this._filterAndFlatten(scene).sort((a, b) => {
            const distanceA = this._cache.objects.get(a)!.distanceToCameraSquared;
            const distanceB = this._cache.objects.get(b)!.distanceToCameraSquared;
            return distanceA - distanceB;
        });

        for (let i = 0, l = sorted.length; i < l; i++) {
            (sorted[i] as any).element.style.zIndex = `${l - i}`;
        }
    }

    private _filterAndFlatten(scene: Scene): Object3D[] {
        const result: Object3D[] = [];
        scene.traverseVisible((object: Object3D) => {
            if ((object as any).isCSS2DObject) {
                result.push(object);
            }
        });
        return result;
    }
}

export { CSS2DRenderer };