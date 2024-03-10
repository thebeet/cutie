import { PerspectiveCamera, Matrix4, Matrix3 } from 'three';

function makeNdcMatrix(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
) {
    const tx = -(right + left) / (right - left);
    const ty = -(top + bottom) / (top - bottom);
    const tz = -(far + near) / (far - near);

    const ndc = new Matrix4();
    // prettier-ignore
    ndc.set(
        2 / (right - left), 0, 0, tx,
        0, 2 / (top - bottom), 0, ty,
        0, 0, -2 / (far - near), tz,
        0, 0, 0, 1,
    );
    return ndc;
}

function makePerspectiveMatrix(
    s: number,
    alpha: number,
    beta: number,
    x0: number,
    y0: number,
    near: number,
    far: number
) {
    const A = near + far;
    const B = near * far;

    const perspective = new Matrix4();
    // prettier-ignore
    perspective.set(
        alpha, s, x0, 0,
        0, beta, y0, 0,
        0, 0, -A, B,
        0, 0, 1, 0,
    );
    return perspective;
}

export default class PinholeCamera extends PerspectiveCamera {
    K: Matrix3;
    imageWidth: number;
    imageHeight: number;

    constructor(
        K: Matrix3,
        M: Matrix4,
        imageWidth: number,
        imageHeight: number,
        aspect: number,
        near: number,
        far: number,
        zoom: number
    ) {
        super(10, aspect, near, far);

        this.setExtrinsicMatrix(M);

        this.K = K;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.zoom = zoom;
        this.updateProjectionMatrix();
    }

    setExtrinsicMatrix(M: Matrix4) {
        const rotationMatrix4 = new Matrix4().copy(M);
        rotationMatrix4.invert();
        this.quaternion.setFromRotationMatrix(rotationMatrix4);
        this.position.setFromMatrixPosition(rotationMatrix4);
    }

    updateProjectionMatrix() {
        if (!this.K) {
            return;
        }
        // column-major order
        const fx = this.K.elements[0 + 0 * 3];
        const fy = this.K.elements[1 + 1 * 3];
        const ox = this.K.elements[0 + 2 * 3];
        const oy = this.K.elements[1 + 2 * 3];
        const s = this.K.elements[0 + 1 * 3];

        const imageAspect = this.imageWidth / this.imageHeight;
        const relAspect = this.aspect / imageAspect;

        const relAspectFactorX = Math.max(1, relAspect);
        const relAspectFactorY = Math.max(1, 1 / relAspect);

        const relAspectOffsetX =
      ((1 - relAspectFactorX * this.zoom) / 2) * this.imageWidth;
        const relAspectOffsetY =
      ((1 - relAspectFactorY * this.zoom) / 2) * this.imageHeight;

        const left = relAspectOffsetX;
        const right = this.imageWidth - relAspectOffsetX;
        const top = relAspectOffsetY;
        const bottom = this.imageHeight - relAspectOffsetY;

        const persp = makePerspectiveMatrix(s, fx, fy, ox, oy, this.near, this.far);
        const ndc = makeNdcMatrix(left, right, bottom, top, this.near, this.far);
        const projection = ndc.multiply(persp);

        this.projectionMatrix.copy(projection);
        this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
}
