const PinholeDistortionShader = {
    uniforms: {
        tDiffuse: { value: null }, // The texture of the image to be distorted (automatically assigned by ShaderPass)
        uCoefficients: { value: [0, 0, 0, 0, 0, 0, 0, 0] }, // k1, k2, p1, p2, k3, k4, k5, k6
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
      uniform float uCoefficients[8];
      uniform vec2 uPrincipalPoint;
      uniform vec2 uFocalLength;
      uniform float uImageWidth;
      uniform float uImageHeight;
      uniform float uZoomForDistortionFactor;
      varying vec2 vUv;
  
      void main() {
        float k1 = uCoefficients[0];
        float k2 = uCoefficients[1];
        float p1 = uCoefficients[2];
        float p2 = uCoefficients[3];
        float k3 = uCoefficients[4];
        float k4 = uCoefficients[5];
        float k5 = uCoefficients[6];
        float k6 = uCoefficients[7];
  
        vec2 imageCoordinates = (vUv * vec2(uImageWidth, uImageHeight) - uPrincipalPoint) / uFocalLength;
        float x = imageCoordinates.x;
        float y = imageCoordinates.y;

        float x0 = x;
        float y0 = y;

        float xc = 0.0;
        float yc = 0.0;

        for (int j = 0; j < 20; ++j) {
          float r2 = x * x + y * y;
          float r4 = r2 * r2;
          float r6 = r4 * r2;
          float radial = (1. + k4 * r2 + k5 * r4 + k6 * r6) / (1. + k1 * r2 + k2 * r4 + k3 * r6);
          
          float deltaX = 2. * p1 * x * y + p2 * (r2 + 2. * x * x);
          float deltaY = p1 * (r2 + 2. * y * y) + 2. * p2 * x * y;

          xc = (x0 - deltaX) * radial;
          yc = (y0 - deltaY) * radial;
          x = xc;
          y = yc;
        }

        vec2 coordinates = vec2(xc, yc);

        vec2 principalPointOffset = vec2((uImageWidth / 2.0) - uPrincipalPoint.x, (uImageHeight / 2.0) - uPrincipalPoint.y) * (1.0 - uZoomForDistortionFactor);
        vec2 outputCoordinates = (coordinates * uFocalLength * uZoomForDistortionFactor + uPrincipalPoint + principalPointOffset) / vec2(uImageWidth, uImageHeight);

        gl_FragColor = texture2D(tDiffuse, outputCoordinates);
      }
    `,
};

export { PinholeDistortionShader };
