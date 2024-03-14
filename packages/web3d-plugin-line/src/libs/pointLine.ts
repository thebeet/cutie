import { Line3, Vector3 } from 'three';

export const findNearistLine = (lines: Line3[], point: Vector3) => {
    let minDistance = Infinity;
    let nearestLine: Line3 | undefined;
    let lineIndex = 0;
    const v = new Vector3();
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        line.closestPointToPoint(point, true, v);
        const distance = point.distanceTo(v);
        if (distance < minDistance) {
            minDistance = distance;
            nearestLine = line;
            lineIndex = i;
        }
    }
    return { minDistance, nearestLine: nearestLine!, lineIndex };
};