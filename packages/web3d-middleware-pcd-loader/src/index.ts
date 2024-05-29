import { Frame, useDrama } from '@cutie/web3d';

import { PCDLoader } from './libs/PCDLoader.js';
import { usePCDCachedLoader } from './loader';

export const useMiddleware = () => {
    const { frames } = useDrama();

    const loader = usePCDCachedLoader(new PCDLoader());

    frames.forEach(frame => {
        if (frame.index === 0) {
            return;
        }
        const url = (frame.userData['data'] as Frame).url;
        loader.load(url).then((obj) => {
            frame.points = obj;
        });
    });
};