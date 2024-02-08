import { GLSL3, RawShaderMaterial } from 'three';

type PointsMaterialParam = {
    size: number
};

export class PointsMaterial extends RawShaderMaterial {
    public glslVersion = GLSL3;
    constructor(param: PointsMaterialParam) {
        super({
            uniforms: {
                pointSize: {
                    value: param.size
                }
            },
            vertexShader: `
            precision lowp float;
            in vec3 position;
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            uniform float pointSize;
            void main() {
                gl_PointSize = pointSize;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
            fragmentShader: `
            precision lowp float;
            out vec4 o_FragColor;
            void main() {
                o_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }`
        });
    }
}