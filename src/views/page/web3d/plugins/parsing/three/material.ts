import { GLSL3, RawShaderMaterial, Matrix4 } from 'three';

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
                },
                previewBox: {
                    value: false,
                },
                previewBoxMatrix: {
                    value: new Matrix4(),
                },
                previewColor: {
                    value: new Float32Array(4).fill(1.0)
                }
            },
            vertexShader: `
            precision lowp float;
            in vec3 position;
            in int label;
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            uniform bool previewBox;
            uniform mat4 previewBoxMatrix;
            uniform vec4 previewColor;
            uniform float pointSize;
            uniform vec4 instanceColor[256];
            out vec4 v_color;
            void main() {
                gl_PointSize = pointSize;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                if (previewBox) {
                    vec4 p_inbox = vec4(position, 1.0) * previewBoxMatrix;
                    bool inBox = p_inbox.x <= 1. && p_inbox.y <= 1. && p_inbox.z <= 1.
                        && p_inbox.x >= -1. && p_inbox.y >= -1. && p_inbox.z >= -1.;
                    v_color = inBox ? previewColor : instanceColor[clamp(label, 0, 255)];
                } else {
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