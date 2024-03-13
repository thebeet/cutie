import { useDrama } from '@cutie/web3d';
import { storeToRefs } from 'pinia';
import { useLineStore } from '../stores';
import { ALine } from '../types';
import { useLineCompletion } from '../libs/lineCompletion';
import * as THREE from 'three';

export const useAutoAction = () => {
    const { activeFrames, scene } = useDrama();
    const { focused } = storeToRefs(useLineStore());

    const autoGeneratePoints = (line: ALine) => {
        const points = [];
        for (let i = 0; i < line.points.length; i += 3) {
            points.push(new THREE.Vector3(line.points[i], line.points[i + 1], line.points[i + 2]));
        }
        const { result, buckets, position } = useLineCompletion(activeFrames.value, points);
        console.log(buckets);

        //const t = buckets.map(([_, p]) => p);
        const geometry = new THREE.BufferGeometry().setFromPoints(result);
        const debugPoint = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
                color: 0xff0000,
                size: 1,
            })
        );
        scene.add(debugPoint);
    };

    const autoGeneratePointsForFocus = () => {
        if (focused.value) {
            autoGeneratePoints(focused.value);
        }
    };


    return {
        autoGeneratePoints,
        autoGeneratePointsForFocus
    };
};