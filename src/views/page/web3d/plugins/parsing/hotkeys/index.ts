import { useMagicKeys, whenever } from '@vueuse/core';
import { useActions } from '../actions';

export const useHotkeys = () => {
    const { confirmBox, cancelBox, removeFocusBox } = useActions();

    const { Enter, Escape, Delete, Backspace } = useMagicKeys();

    whenever(Enter, confirmBox);
    whenever(Escape, cancelBox);
    whenever(Delete, removeFocusBox);
    whenever(Backspace, removeFocusBox);
};