import * as THREE from 'three';
import { MaybeRefOrGetter, toValue, watch, watchEffect } from 'vue';
import PinholeCamera from '../libs/PinholeCamera';
import { FisheyeDistortionShader as FisheyeDistortionShaderPreCalc, computeFisheyeLUT, FisheyeCoefficients } from '../libs/FisheyeDistortionPreCalc';
import { FisheyeDistortionShader } from '../libs/FisheyeDistortion';
import { PinholeDistortionShader } from '../libs/PinholeDistortion';
import { CameraParams } from '@web3d/types';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { useRafFn, useToggle, useResizeObserver, useElementVisibility } from '@vueuse/core';
import { measure } from '@/stores/performance';

const width = 384;
const height = 216;

export const useProjection2d = (container: MaybeRefOrGetter<HTMLDivElement | undefined>, scene: THREE.Scene, cameraParam: CameraParams) => {
    const zoomForDistortionFactor = .5;
    const renderer = new THREE.WebGLRenderer({
        powerPreference: 'high-performance',
        antialias: false,
        alpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(1 / zoomForDistortionFactor);

    const matrixK = new THREE.Matrix3().fromArray([...cameraParam.K]).transpose();
    const matrixM = new THREE.Matrix4().fromArray([...cameraParam.M]);

    const camera = new PinholeCamera(
        matrixK,
        matrixM,
        cameraParam.width,
        cameraParam.height,
        width / height, 0.1, 1000, 1 / zoomForDistortionFactor
    );
    let dirty = true;
    const composer = new EffectComposer(renderer);
    composer.render = measure('web3d::projection2d::render', composer.render.bind(composer));
    composer.setSize(width, height);
    composer.setPixelRatio(1 / zoomForDistortionFactor);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    let distortionPass: ShaderPass | null = null;
    if (cameraParam.distortionType === 'fisheye-p') {
        distortionPass = new ShaderPass(FisheyeDistortionShaderPreCalc);
        const distortionLUTTexture = computeFisheyeLUT(
            matrixK,
            cameraParam.distortionCoefficients as FisheyeCoefficients,
            cameraParam.width,
            cameraParam.height,
            zoomForDistortionFactor
        );
        distortionPass.uniforms.uDistortionLUT.value = distortionLUTTexture;
        // 原代码是 width / height / (cameraParam.width / cameraParam.height); 我觉得不妥
        distortionPass.uniforms.uRelAspect.value = 1;
        distortionPass.setSize(width, height);
        composer.addPass(distortionPass);
    } else if (cameraParam.distortionType === 'fisheye') {
        distortionPass = new ShaderPass(FisheyeDistortionShader);
        distortionPass.uniforms.uCoefficients.value = [
            cameraParam.distortionCoefficients.k1,
            cameraParam.distortionCoefficients.k2,
            cameraParam.distortionCoefficients.k3,
            cameraParam.distortionCoefficients.k4,
        ];
        distortionPass.uniforms.uPrincipalPoint.value = new THREE.Vector2(
            matrixK.elements[0 + 2 * 3],
            matrixK.elements[1 + 2 * 3]
        );
        distortionPass.uniforms.uFocalLength.value = new THREE.Vector2(
            matrixK.elements[0 + 0 * 3],
            matrixK.elements[1 + 1 * 3]
        );
        distortionPass.uniforms.uImageWidth.value = cameraParam.width;
        distortionPass.uniforms.uImageHeight.value = cameraParam.height;
        distortionPass.uniforms.uZoomForDistortionFactor.value = zoomForDistortionFactor;
        distortionPass.uniforms.uRelAspect.value = 1.0;
        composer.addPass(distortionPass);
    } else if (cameraParam.distortionType === 'pinhole') {
        distortionPass = new ShaderPass(PinholeDistortionShader);
        distortionPass.uniforms.uCoefficients.value = [
            cameraParam.distortionCoefficients.k1,
            cameraParam.distortionCoefficients.k2,
            cameraParam.distortionCoefficients.p1,
            cameraParam.distortionCoefficients.p2,
            cameraParam.distortionCoefficients.k3,
            cameraParam.distortionCoefficients.k4,
            cameraParam.distortionCoefficients.k5,
            cameraParam.distortionCoefficients.k6,
        ];
        distortionPass.uniforms.uPrincipalPoint.value = new THREE.Vector2(
            matrixK.elements[0 + 2 * 3],
            matrixK.elements[1 + 2 * 3]
        );
        distortionPass.uniforms.uFocalLength.value = new THREE.Vector2(
            matrixK.elements[0 + 0 * 3],
            matrixK.elements[1 + 1 * 3]
        );
        distortionPass.uniforms.uImageWidth.value = cameraParam.width;
        distortionPass.uniforms.uImageHeight.value = cameraParam.height;
        distortionPass.uniforms.uZoomForDistortionFactor.value = zoomForDistortionFactor;
        distortionPass.uniforms.uRelAspect.value = 1.0;
        composer.addPass(distortionPass);
    }

    scene.addEventListener('change', () => {
        dirty = true;
    });

    const visible = useElementVisibility(container);

    useRafFn(() => {
        if (visible.value && dirty) {
            dirty = false;
            composer.render();
        }
    });

    useResizeObserver(container, (entries) => {
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
            composer.setSize(width, height);
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            dirty = true;
        }
    });

    watchEffect((onCleanup) => {
        const dom = toValue(container);
        if (dom) {
            dom.appendChild(renderer.domElement);
            dirty = true;
            onCleanup(() => {
                dom.removeChild(renderer.domElement);
                composer.dispose();
                renderer.dispose();
                renderer.forceContextLoss();
            });
        }
    });

    const [pointsVisible, togglePointsVisible] = useToggle(true);
    watch(pointsVisible, (value) => {
        if (value) {
            camera.layers.enable(0);
        } else {
            camera.layers.disable(0);
        }
        dirty = true;
    });

    const [distortionVisible, toggleDistortionVisible] = useToggle(true);
    /*watch(distortionVisible, (value) => {
        if (distortionPass) {
            if (value) {
                composer.addPass(distortionPass);
                camera.zoom = 1 / zoomForDistortionFactor;
            } else {
                composer.removePass(distortionPass);
                camera.zoom = 1;
            }
            camera.updateProjectionMatrix();
        }
        dirty = true;
    });*/

    return {
        pointsVisible, togglePointsVisible,
        distortionVisible, toggleDistortionVisible,
    };
};
