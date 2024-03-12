import { GLSL3, RawShaderMaterial } from 'three';

type PointsAllInOneMaterialParam = {
    size: number
};

export class PointsAllInOneMaterial extends RawShaderMaterial {
    public glslVersion = GLSL3;
    constructor(param: PointsAllInOneMaterialParam) {
        super({
            uniforms: { // make sure vectors count < 1024
                pointSize: {
                    value: param.size
                },
                instanceColor: {
                    value: new Float32Array(1024).fill(0.0) // 256 vectors
                },
                mode: {
                    value: 1
                },
                highlightColor: {
                    value: new Float32Array(4).fill(1.0)
                },
            },
            vertexShader: `
            precision mediump float;
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
                if (mode == 1) {
                    v_color = instanceColor[clamp(label, 0, 255)];
                } else if (mode == 2) {
                    float vIntensity = intensity / 256.;
                    if (vIntensity < 0.25) {
                        v_color = vec4(0, vIntensity*4., 1.-vIntensity*4., 1.);
                    } else if (vIntensity < 0.5) {
                        v_color = vec4(vIntensity*4.-1., 2.-vIntensity*4., 0, 1.);
                    } else {
                        v_color = vec4(1, vIntensity, vIntensity, 1);
                    }
                } else if (mode == 3) {
                    if (position.z < 0.) {
                        float r = 1./(1.-position.z);
                        v_color = vec4(r, r, 1., 1.);
                    } else if (position.z < 1.) {
                        v_color = vec4(1.,1.,1.,1.)*(1.-position.z) + vec4(0.4,1.,.6,1.)*position.z;
                    } else if (position.z < 5.) {
                        float r = (position.z - 1.)/4.;
                        v_color = vec4(0.4,1.,.6,1.)*(1.-r) + vec4(.8,.5,0.,1.)*r;
                    } else {
                        float r = 1./(position.z - 4.);
                        v_color = vec4(1.,.2,.5,1.)*(1.-r) + vec4(.8,.5,0.,1.)*r;
                    }
                } else {
                    v_color = vec4(1, 1, 1, 1);
                }
            }`,
            fragmentShader: `
            precision mediump float;
            in vec4 v_color;
            out vec4 o_FragColor;
            void main() {
                if (v_color.a < 0.1) discard;
                o_FragColor = v_color;
            }`
        });
    }
}