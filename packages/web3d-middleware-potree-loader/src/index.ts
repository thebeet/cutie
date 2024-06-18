import { Frame, useAdvanceDrama } from '@cutie/web3d';
import { PointCloudOctree, Potree } from '@pnext/three-loader';

export const useMiddleware = () => {
    const { frames, onBeforeRender } = useAdvanceDrama();

    const potrees: { potree: Potree, pco: PointCloudOctree}[] = [];

    onBeforeRender(({ camera, renderer }) => {
        potrees.forEach(({ potree, pco }) => {
            potree.updatePointClouds([pco], camera, renderer);
        });
    });

    frames.forEach(frame => {
        if (frame.index === 0) {
            return;
        }
        const { url, format = 'pcd' } = frame.userData['data'] as Frame;
        if (format === 'potree') {
            const potree = new Potree();
            potree.pointBudget = 1_000_000;
            potree.loadPointCloud(
                'cloud.js',
                relativeUrl => `${url}${relativeUrl}`
            ).then(pco => {
                pco.material.size = 1.0;
                frame.add(pco);
                potrees.push({
                    potree,
                    pco
                });
                frame.update();
            });
        }
    });
};