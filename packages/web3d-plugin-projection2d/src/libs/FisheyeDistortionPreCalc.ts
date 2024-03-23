import {
    DataTexture,
    FloatType,
    LinearFilter,
    Matrix3,
    RGBAFormat,
} from 'three';

export const FisheyeDistortionShader = {
    uniforms: {
        tDiffuse: { value: null }, // The texture of the image to be distorted (automatically assigned by ShaderPass)
        uDistortionLUT: { value: null },
        uRelAspect: { value: 1.0 },
    },

    vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,

    fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D uDistortionLUT;
    varying vec2 vUv;

    void main() {
      vec2 inputCoordinatesWithAspectOffset = vUv;
      // discard pixels on the edge to avoid streaking
      float threshold = 0.0001;
      if (
        inputCoordinatesWithAspectOffset.x <= 0.0 + threshold ||
        inputCoordinatesWithAspectOffset.x >= 1.0 - threshold ||
        inputCoordinatesWithAspectOffset.y <= 0.0 + threshold ||
        inputCoordinatesWithAspectOffset.y >= 1.0 - threshold
      ) {
        // show black overlay
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.4);
        return;
      }

      // look up distortion in LUT
      vec2 outputCoordinates = texture2D(uDistortionLUT, inputCoordinatesWithAspectOffset).rg;
      if (outputCoordinates.x == 0.0 && outputCoordinates.y == 0.0) {
        // show black overlay
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.4);
        return;
      }
      
      gl_FragColor = texture2D(tDiffuse, outputCoordinates);
    }
  `,
};

export interface FisheyeCoefficients {
    k1: number;
    k2: number;
    k3: number;
    k4: number;
}

export function computeFisheyeLUT(
    intrinsicMatrix: Matrix3,
    coefficients: FisheyeCoefficients,
    imageWidth: number,
    imageHeight: number,
    zoomForDistortionFactor: number
) {
    const resolutionOfLUT = 256;
    const rgbaDistortionLUT = Array.from(
        { length: resolutionOfLUT * resolutionOfLUT * 4 },
        () => 0
    );

    const newIntrinsicMatrixInverse =
    computeIntrinsicMatrixInverseWithZoomForDistortion(
        intrinsicMatrix,
        zoomForDistortionFactor,
        imageWidth,
        imageHeight
    );

    const sampleDomainExtension = 0.3;
    const minSampleDomain = 0 - sampleDomainExtension;
    const maxSampleDomain = 1 + sampleDomainExtension;
    const sampleStep = 1 / (resolutionOfLUT * 4);

    for (let i = minSampleDomain; i < maxSampleDomain; i += sampleStep) {
        for (let j = minSampleDomain; j < maxSampleDomain; j += sampleStep) {
            const undistortedCoordinate = { x: i * imageHeight, y: j * imageWidth };

            const { x: distortedX, y: distortedY } = distortCoordinateFisheye(
                undistortedCoordinate,
                intrinsicMatrix,
                coefficients,
                newIntrinsicMatrixInverse
            );

            const distortionLUTIndexX = Math.round(
                (distortedX / imageWidth) * (resolutionOfLUT - 1)
            );

            const distortionLUTIndexY = Math.round(
                (1 - distortedY / imageHeight) * (resolutionOfLUT - 1)
            );

            if (
                distortionLUTIndexX < 0 ||
                distortionLUTIndexX >= resolutionOfLUT ||
                distortionLUTIndexY < 0 ||
                distortionLUTIndexY >= resolutionOfLUT
            ) {
                continue;
            }

            const u = j;
            const v = 1 - i;
            rgbaDistortionLUT[
                distortionLUTIndexY * resolutionOfLUT * 4 + distortionLUTIndexX * 4
            ] = u;
            rgbaDistortionLUT[
                distortionLUTIndexY * resolutionOfLUT * 4 + distortionLUTIndexX * 4 + 1
            ] = v;
            // Blue and Alpha channels will remain 0.
        }
    }

    const distortionLUTData = new Float32Array(rgbaDistortionLUT);
    const distortionLUTTexture = new DataTexture(
        distortionLUTData,
        resolutionOfLUT,
        resolutionOfLUT,
        RGBAFormat,
        FloatType
    );
    distortionLUTTexture.minFilter = LinearFilter;
    distortionLUTTexture.magFilter = LinearFilter;
    distortionLUTTexture.needsUpdate = true;

    return distortionLUTTexture;
}

interface Coordinate {
  x: number;
  y: number;
}

function distortCoordinateFisheye(
    undistortedCoordinate: Coordinate,
    intrinsicMatrix: Matrix3,
    coefficients: FisheyeCoefficients,
    newIntrinsicMatrixInverse: Matrix3
): Coordinate {
    const { x, y } = undistortedCoordinate;
    const { k1, k2, k3, k4 } = coefficients;

    const fx = intrinsicMatrix.elements[0 + 0 * 3];
    const fy = intrinsicMatrix.elements[1 + 1 * 3];
    const cx = intrinsicMatrix.elements[0 + 2 * 3];
    const cy = intrinsicMatrix.elements[1 + 2 * 3];
    const iR = newIntrinsicMatrixInverse;

    let distortedX: number, distortedY: number;

    const _x =
        x * iR.elements[1 * 3 + 0] +
        y * iR.elements[0 * 3 + 0] +
        iR.elements[2 * 3 + 0];
    const _y =
        x * iR.elements[1 * 3 + 1] +
        y * iR.elements[0 * 3 + 1] +
        iR.elements[2 * 3 + 1];
    const _w =
        x * iR.elements[1 * 3 + 2] +
        y * iR.elements[0 * 3 + 2] +
        iR.elements[2 * 3 + 2];

    if (_w <= 0) {
        distortedX = _x > 0 ? -Infinity : Infinity;
        distortedY = _y > 0 ? -Infinity : Infinity;
    } else {
        const r = Math.sqrt(_x * _x + _y * _y);
        const theta = Math.atan(r);

        const theta2 = theta * theta;
        const theta4 = theta2 * theta2;
        const theta6 = theta4 * theta2;
        const theta8 = theta4 * theta4;
        const theta_d =
            theta * (1 + k1 * theta2 + k2 * theta4 + k3 * theta6 + k4 * theta8);

        const scale = r === 0 ? 1.0 : theta_d / r;
        distortedX = fx * _x * scale + cx;
        distortedY = fy * _y * scale + cy;
    }

    return { x: distortedX, y: distortedY };
}

function computeIntrinsicMatrixInverseWithZoomForDistortion(
    intrinsicMatrix: Matrix3,
    zoomForDistortionFactor: number,
    width: number,
    height: number
) {
    const principalPointOffsetX =
        (width / 2 - intrinsicMatrix.elements[0 + 2 * 3]) *
        (1 - zoomForDistortionFactor);
    const principalPointOffsetY =
        (height / 2 - intrinsicMatrix.elements[1 + 2 * 3]) *
        (1 - zoomForDistortionFactor);

    const newIntrinsicMatrix = [
        [
            intrinsicMatrix.elements[0 + 0 * 3] * zoomForDistortionFactor,
            0,
            intrinsicMatrix.elements[0 + 2 * 3] + principalPointOffsetX,
        ],
        [
            0,
            intrinsicMatrix.elements[1 + 1 * 3] * zoomForDistortionFactor,
            intrinsicMatrix.elements[1 + 2 * 3] + principalPointOffsetY,
        ],
        [0, 0, 1],
    ];

    const newIntrinsicMatrixInverse = new Matrix3()
        .fromArray(newIntrinsicMatrix.flat())
        .transpose()
        .invert();

    return newIntrinsicMatrixInverse;
}
