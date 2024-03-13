export const triangleThreshold = (histogram: Uint32Array): number => {
    const { maxValue, maxIndex } = histogram.reduce((pre, cur, i) => {
        if (cur > pre.maxValue) {
            pre.maxValue = cur;
            pre.maxIndex = i;
        }
        return pre;
    }, { maxValue: 0, maxIndex: 0 });

    // 如果没有非零值，返回-1
    if (maxValue === 0) {
        return -1;
    }

    // 确定基线的另一个端点：直方图两端的最远非零点
    const firstNonZeroIndex = histogram.findIndex(count => count > 0);
    const lastNonZeroIndex = histogram.length - 1 - [...histogram].reverse().findIndex(count => count > 0);

    // 确定基线端点顺序
    let baseLineStartIndex = firstNonZeroIndex;
    let baseLineEndIndex = lastNonZeroIndex;
    if (maxIndex - firstNonZeroIndex < lastNonZeroIndex - maxIndex) {
        baseLineStartIndex = maxIndex;
    } else {
        baseLineEndIndex = maxIndex;
    }

    // 构建基线并寻找最远点
    const baseLineVec = [baseLineEndIndex - baseLineStartIndex, histogram[baseLineEndIndex] - histogram[baseLineStartIndex]];
    let maxDistance = -Number.MAX_VALUE;
    let threshold = baseLineStartIndex; // 初始化为基线开始端点，以防循环中没有找到更远的点

    for (let i = baseLineStartIndex; i <= baseLineEndIndex; i++) {
        const fake_distance = -baseLineVec[0] * histogram[i] + baseLineVec[1] * i; // 基线向量和该处数据向量叉乘的值，和距离成正比
        if (fake_distance > maxDistance) {
            maxDistance = fake_distance;
            threshold = i;
        }
    }

    return threshold;
};