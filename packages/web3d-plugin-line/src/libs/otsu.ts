export const otsu = (data: number[]): number => {
    const N = data.length;
    if (N === 0) {
        return 0;
    }
    const counts = new Int32Array(256 + 1).fill(0);
    for (let i = 0; i < data.length; ++i) {
        const d = Math.min(Math.max(Math.floor(data[i]), 0), 256);
        counts[d] += 1;
    }
    const sum = counts.reduce((acc, v, i) => acc + v * i, 0);

    let maxG = -Infinity;
    let threshold0 = 0;
    let threshold1 = 0;

    let n0 = 0, n1 = data.length;
    let sum0 = 0, sum1 = sum;
    for (let i = 0; i < 256; ++i) {
        n0 += counts[i];
        if (n0 === 0) continue;
        n1 -= counts[i];
        if (n1 === 0) break;
        sum0 += i * counts[i];
        sum1 -= i * counts[i];

        const w0 = n0 / N;
        const w1 = n1 / N;
        const u0 = n0 > 0 ? sum0 / n0 : 0;
        const u1 = n1 > 0 ? sum1 / n1 : 0;
        const g = w0 * w1 * (u1 - u0) * (u1 - u0);
        if (g >= maxG) {
            threshold0 = i;
            if (g > maxG) {
                threshold1 = i;
            }
            maxG = g;
        }
    }
    return (threshold0 + threshold1) / 2;
};