import { GLSL3, RawShaderMaterial } from 'three';

type PointsLabelInstanceColorMaterialParam = {
    size: number
};

export class PointsLabelInstanceColorMaterial extends RawShaderMaterial {
    public glslVersion = GLSL3;
    constructor(param: PointsLabelInstanceColorMaterialParam) {
        super({
            uniforms: { // make sure vectors count < 1024
                pointSize: {
                    value: param.size
                },
                instanceColor: {
                    value: new Float32Array(1024).fill(0.0) // 256 vectors
                },
                mode: {
                    value: 0
                },
                highlightColor: {
                    value: new Float32Array(4).fill(1.0)
                },
            },
            vertexShader: `
            precision lowp float;
            in vec3 position;
            in vec3 color;
            in int label;
            in int highlight;
            in float intensity;
            uniform mat4 projectionMatrix;
            uniform mat4 modelMatrix;
            uniform mat4 modelViewMatrix;
            uniform float pointSize;
            uniform int mode;
            uniform vec4 instanceColor[256];
            uniform vec4 highlightColor;
            out vec4 v_color;
            void main() {
                gl_PointSize = pointSize;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                if (mode == 0) {
                    float vIntensity = intensity / 256.;
                    if (vIntensity < 0.25) {
                        v_color = vec4(0, vIntensity*4., 1.-vIntensity*4., 1.);
                    } else if (vIntensity < 0.5) {
                        v_color = vec4(vIntensity*4.-1., 2.-vIntensity*4., 0, 1.);
                    } else {
                        v_color = vec4(1, vIntensity, vIntensity, 1);
                    }
                }
                if (mode == 1) {
                    v_color = instanceColor[clamp(label, 0, 255)];
                }
                if (mode == 2) {
                    v_color = instanceColor[clamp(label, 0, 255)];
                }
            }`,
            fragmentShader: `
            precision lowp float;
            in vec4 v_color;
            out vec4 o_FragColor;
            void main() {
                if (v_color.a < 0.1) discard;
                o_FragColor = v_color;
            }`
        });
    }
}