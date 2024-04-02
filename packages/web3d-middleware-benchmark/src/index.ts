import { useWebWorkerFn } from '@vueuse/core';

export const useMiddleware = () => {
    const { workerFn: benchmarkFn } = useWebWorkerFn(() => {
        let sum = 0;
        const start = performance.now();
        for (let i = 0; i < 5_000_000; i++) {
            sum += Math.sin(i);
        }
        const duration = performance.now() - start;
        return { sum, duration };
    });
    benchMarkGPU();

    /*benchmarkFn().then(({ sum, duration }) => {
        console.log('sum', sum);
        console.log('duration', duration);
    });*/
};

const benchMarkGPU = () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    const gl = canvas.getContext('webgl2', { antialias: true });
    if (!gl) {
        return;
    }
    const { vertexShader, fragmentShader } = (() => {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader!, `
        precision highp float;
        attribute float a_position;
        void main() {
            float x = 0.;
            for (int i = 0; i < 1024; ++i) {
                x += sin(a_position + float(i));
            }
            gl_Position = vec4(x, 0., 0., 1.);
        }`);
        gl.compileShader(vertexShader!);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader!, `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(1, 1, 1, 1);
        }`);
        gl.compileShader(fragmentShader!);
        return { vertexShader, fragmentShader };
    })();
    if (!vertexShader || !fragmentShader) {
        console.log('shader failed to create');
        return;
    }


    const program = gl.createProgram();
    if (!program) {
        console.log('program failed to create');
        return;
    }
    console.log('program', program);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const programSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (programSuccess) {
        console.log('program linked');
    } else {
        console.log('program failed to link');
        return;
    }

    const positions = new Float32Array(1_000_000);
    for (let i = 0; i < positions.length; ++i) {
        positions[i] = i;
    }

    const start = performance.now();
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.vertexAttribPointer(
        positionAttributeLocation, 1, gl.FLOAT, false, 0, 0);

    console.log('before drawArrays', performance.now() - start);
    gl.drawArrays(gl.POINTS, 0, 1_000_000);

    console.log('before result', performance.now() - start);
    const results = new Uint8Array(1 * 1 * 4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, results);

    const duration = performance.now() - start;
    console.log('duration', duration);

    gl.disableVertexAttribArray(positionAttributeLocation);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.deleteProgram(program);
};