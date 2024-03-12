export const otsu = (histogram: Uint32Array): number => {
    const { sum, count: N } = histogram.reduce((acc, v, i) => ({
        sum: acc.sum + v * i,
        count: acc.count + v
    }), { sum: 0, count: 0 });

    let maxG = -Infinity;
    let threshold0 = 0;
    let threshold1 = 0;

    let n0 = 0, n1 = N;
    let sum0 = 0, sum1 = sum;
    for (let i = 0; i < 256; ++i) {
        n0 += histogram[i];
        if (n0 === 0) continue;
        n1 -= histogram[i];
        if (n1 === 0) break;
        sum0 += i * histogram[i];
        sum1 -= i * histogram[i];

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