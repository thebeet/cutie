import { GLSL3, RawShaderMaterial } from 'three';

type PointsLabelInstanceColorMaterialParam = {
    size: number
};

export class PointsLabelInstanceColorMaterial extends RawShaderMaterial {
    public glslVersion = GLSL3;
    constructor(param: PointsLabelInstanceColorMaterialParam) {
        super({
            uniforms: {
                pointSize: {
                    value: param.size
                },
                instanceColor: {
                    value: new Float32Array(1024).fill(0.0)
                }
            },
            vertexShader: `
            precision lowp float;
            in vec3 position;
            in int label;
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            uniform float pointSize;
            uniform vec4 instanceColor[256];
            out vec4 v_color;
            void main() {
                gl_PointSize = pointSize;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                v_color = instanceColor[clamp(label, 0, 255)];
            }
            `,
            fragmentShader: `
            precision lowp float;
            in vec4 v_color;
            out vec4 o_FragColor;
            void main() {
                if (v_color.a < 0.1) discard;
                o_FragColor = v_color;
            }
            `
        });
    }
}