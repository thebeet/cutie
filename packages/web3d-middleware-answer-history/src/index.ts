import { h } from 'vue';
import { useDrama } from '@cutie/web3d';
import ToolBox from './components/ToolBox.vue';
import { useAnswerHistoryStore } from './stores/answer';
import { useHotkeys } from './hotkeys';
import HistoryList from './components/HistoryList.vue';
import { addNodeToContainer } from '@cutie/web3d';

export const useMiddleware = () => {
    const { toolbox, rightsidebar } = useDrama();
    useAnswerHistoryStore();
    useHotkeys();
    addNodeToContainer(h(ToolBox), toolbox);
    addNodeToContainer(h(HistoryList), rightsidebar);
};