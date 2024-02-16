export const usePos = (event: MouseEvent, dom: HTMLElement) => {
    return {
        x: 2 * event.offsetX / dom.offsetWidth - 1,
        y: -2 * event.offsetY / dom.offsetHeight + 1
    };
};