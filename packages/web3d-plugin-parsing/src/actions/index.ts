import { storeToRefs } from 'pinia';
import { useParsingStore } from '../stores';
import { useDrama } from '@cutie/web3d';
import { ParsingInstanceModifyColorOperation } from '../operations/ParsingInstanceModifyColorOperation';
import { makeOperationFromBoxes } from './box';

export const useActions = () => {
    const { mainLabelID, instances, boxes, focused } = storeToRefs(useParsingStore());
    const { activeFrames, applyOperation } = useDrama();

    const setMainLabelID = (id: number) => mainLabelID.value = id;

    const show = (id: number) => instances.value[id].visible = true;
    const hide = (id: number) => instances.value[id].visible = false;
    const lock = (id: number) => instances.value[id].lock = true;
    const unlock = (id: number) => instances.value[id].lock = false;

    const changeColor = (id: number, color: string) => {
        const operation = new ParsingInstanceModifyColorOperation(id, color);
        applyOperation(operation);
    };

    const confirmBox = () => {
        if (boxes.value.length) {
            const op = makeOperationFromBoxes(activeFrames.value, boxes.value, mainLabelID.value, instances.value);
            if (op) {
                applyOperation(op);
            }
            boxes.value = [];
        }
    };
    const cancelBox = () => boxes.value = [];
    const removeFocusBox = () => boxes.value = boxes.value.filter(box => box.uuid !== focused.value?.uuid);

    return {
        show, hide, lock, unlock,
        setMainLabelID, changeColor,
        confirmBox, cancelBox, removeFocusBox
    } as const;
};