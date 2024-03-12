import { storeToRefs } from 'pinia';
import { useParsingStore } from '../stores';
import { useDrama } from '@cutie/web3d';
import { ParsingInstanceModifyColorOperation } from '../operations/ParsingInstanceModifyColorOperation';

export const useActions = () => {
    const { mainLabelID, instances } = storeToRefs(useParsingStore());
    const { applyOperation } = useDrama();

    const setMainLabelID = (id: number) => mainLabelID.value = id;

    const show = (id: number) => instances.value[id].visible = true;
    const hide = (id: number) => instances.value[id].visible = false;
    const lock = (id: number) => instances.value[id].lock = true;
    const unlock = (id: number) => instances.value[id].lock = false;

    const changeColor = (id: number, color: string) => {
        const operation = new ParsingInstanceModifyColorOperation(id, color);
        applyOperation(operation);
    };

    return {
        show, hide, lock, unlock,
        setMainLabelID, changeColor
    } as const;
};