import { useDrama } from '@cutie/web3d';
import { storeToRefs } from 'pinia';
import { useLineStore } from '../stores';
import { ALine } from '../types';
import { useLineCompletion } from '../libs/lineCompletion';
import * as THREE from 'three';
import { ModifyLineOperation } from '../operations/ModifyLineOperation';
import { AddLineOperation } from '../operations/AddLineOperation';

export const useAutoAction = () => {
    const { activeFrames, primaryFrame, applyOperation } = useDrama();
    const { focused } = storeToRefs(useLineStore());

    const autoGeneratePoints = (line: ALine) => {
        const points = line.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
        const { result, beforeGaussian } = useLineCompletion(activeFrames.value, points);

        const op = new ModifyLineOperation({
            ...line,
            points: result
        });
        applyOperation(op);

        console.log(beforeGaussian)
        console.log(result);

        const opNew = new AddLineOperation(primaryFrame.value, {
            ...line,
            uuid: THREE.MathUtils.generateUUID(),
            points: beforeGaussian
        });
        applyOperation(opNew);
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