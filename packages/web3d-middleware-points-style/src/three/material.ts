import { GLSL3, RawShaderMaterial } from 'three';

type PointsAllInOneMaterialParam = {
    size: number
};

export class PointsAllInOneMaterial extends RawShaderMaterial {
    public glslVersion = GLSL3;
    constructor(param: PointsAllInOneMaterialParam) {
        super({
            name: 'points',
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
            precision highp float;
            in vec3 position;
            in lowp vec3 color;
            in int label;
            in int highlight;
            in lowp float intensity;
            uniform mat4 projectionMatrix;
            uniform mat4 modelMatrix;
            uniform mat4 modelViewMatrix;
            uniform float pointSize;
            uniform int mode;
            uniform vec4 instanceColor[256];
            uniform vec4 highlightColor;
            out lowp vec4 v_color;
            vec3 hsv2rgb(vec3 c)
            {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            void main() {
                gl_PointSize = pointSize;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

                if (gl_Position.w > 50. &&
                    (abs(fract(gl_Position.x * 31.415926)) * (gl_Position.w - 50.0) > abs(fract(gl_Position.y * 31.415926)) * 50.)) {
                    // 当距离大于50.0时，根据距离随机剔除点，距离越远剔除概率越大
                    gl_Position = vec4(0., 0., 2., 1.);
                    v_color = vec4(1., 1., 1., 1.);
                } else {
                    if (mode == 1) {
                        v_color = instanceColor[clamp(label, 0, 255)];
                    } else if (mode == 2) {
                        float vIntensity = clamp(intensity / 128., 0., 1.);
                        v_color = vec4(hsv2rgb(vec3(vIntensity, 1., clamp(intensity / 128., 0., .5) + 0.5)), 1.);
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
                }
            }`,
            fragmentShader: `
            in lowp vec4 v_color;
            out lowp vec4 o_FragColor;
            void main() {
                if (v_color.a < 0.1) discard;
                o_FragColor = v_color;
            }`
        });
    }
}