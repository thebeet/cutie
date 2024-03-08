const FisheyeDistortionShader = {
    uniforms: {
        tDiffuse: { value: null }, // The texture of the image to be distorted (automatically assigned by ShaderPass)
        uCoefficients: { value: [0, 0, 0, 0] }, // k1, k2, k3, k4
        uPrincipalPoint: { value: null },
        uFocalLength: { value: null },
        uImageWidth: { value: 0 },
        uImageHeight: { value: 0 },
        uRelAspect: { value: 1.0 },
        uZoomForDistortionFactor: { value: 1.0 },
    },

    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }`,

    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uCoefficients[4];
      uniform vec2 uPrincipalPoint;
      uniform vec2 uFocalLength;
      uniform float uImageWidth;
      uniform float uImageHeight;
      uniform float uZoomForDistortionFactor;
      varying vec2 vUv;
  
      void main() {
        float k1 = uCoefficients[0];
        float k2 = uCoefficients[1];
        float k3 = uCoefficients[2];
        float k4 = uCoefficients[3];
  
        vec2 imageCoordinates = (vUv * vec2(uImageWidth, uImageHeight) - uPrincipalPoint) / uFocalLength;
        float x = imageCoordinates.x;
        float y = imageCoordinates.y;

        float r = sqrt(x * x + y * y);
        float theta_d = atan(r);
        float theta = theta_d;

        for (int j = 0; j < 10; ++j) {
          float theta2 = theta * theta;
          float theta4 = theta2 * theta2;
          float theta6 = theta4 * theta2;
          float theta8 = theta4 * theta4;
          float ftheta = theta * (1. + k1 * theta2 + k2 * theta4 + k3 * theta6 + k4 * theta8) - theta_d;
          float ftheta_derivative = 1. + 3. * k1 * theta2 + 5. * k2 * theta4 + 7. * k3 * theta6 + 9. * k4 * theta8;

          theta = theta - ftheta / ftheta_derivative;
        }
        float scale = tan(theta) / r;
        float xc = x * scale;
        float yc = y * scale;

        vec2 coordinates = vec2(xc, yc);

        vec2 principalPointOffset = (vec2(uImageWidth, uImageHeight) / 2. - uPrincipalPoint) * (1.0 - uZoomForDistortionFactor);
        vec2 outputCoordinates = (coordinates * uFocalLength * uZoomForDistortionFactor + uPrincipalPoint + principalPointOffset) / vec2(uImageWidth, uImageHeight);

        gl_FragColor = texture2D(tDiffuse, outputCoordinates);
      }
    `,
};

export { FisheyeDistortionShader };
