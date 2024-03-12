export const triangleThreshold = (histogram: number[]): number => {
    const { maxValue, maxIndex, minValue, minIndex } = histogram.reduce((pre, cur, i) => {
        if (cur > pre.maxValue) {
            pre.maxValue = cur;
            pre.maxIndex = i;
        }
        if (cur < pre.minValue) {
            pre.minValue = cur;
            pre.minIndex = i;
        }
        return pre;
    }, { maxValue: 0, minValue: Number.MAX_VALUE, minIndex: 0, maxIndex: 0 });

    // 应用三角算法
    // 初始化阈值和最大距离
    let threshold = 0;
    let maxDistance = -1;

    // 峰值与直方图尾部的连线方程为 y = mx + b
    const dx = maxIndex - minIndex;
    const dy = maxValue - minValue;
    const d = Math.sqrt(dx * dx + dy * dy);
    const m = dy / dx;
    const b = minValue - m * minIndex;

    for (let i = minIndex; i <= maxIndex; i++) {
        // 计算当前点到直线的距离
        const distance = Math.abs(m * i - histogram[i] + b) / d;
        // 更新最大距离和阈值
        if (distance > maxDistance) {
            maxDistance = distance;
            threshold = i;
        }
    }
    return threshold;
};
