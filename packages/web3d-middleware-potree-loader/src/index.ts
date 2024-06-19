import { Frame, useAdvanceDrama } from '@cutie/web3d';
import { PointCloudOctree, Potree, PointCloudOctreeGeometry, PointCloudOctreeGeometryNode, PointSizeType, PointShape } from '@pnext/three-loader';

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
        if (format.startsWith('potree')) {
            const potree = new Potree(format === 'potreev2' ? 'v2' : 'v1');
            potree.pointBudget = 1_000_000;

            const { resource, baseUrl } = ((url: string) => {
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    const parsedUrl = new URL(url);
                    const protocol = parsedUrl.protocol;
                    const host = parsedUrl.host;
                    const path = parsedUrl.pathname;
                    const trimmedPath = path.substring(0, path.lastIndexOf('/'));
                    const resource = path.substring(path.lastIndexOf('/') + 1);
                    const baseUrl = `${protocol}//${host}${trimmedPath}`;
                    return { resource, baseUrl };
                } else {
                    const baseUrl = url.substring(0, url.lastIndexOf('/'));
                    const resource = url.substring(url.lastIndexOf('/') + 1);
                    return { resource, baseUrl };
                }
            })(url);

            potree.loadPointCloud(
                resource,
                relativeUrl => `${baseUrl}/${relativeUrl}`
            ).then(pco => {
                pco.material.useEDL = false;
                pco.material.size = 2.0;
                pco.material.minSize = 2;
                pco.material.maxSize = 2;
                pco.material.pointSizeType = PointSizeType.FIXED;
                pco.material.shape = PointShape.CIRCLE;
                pco.pcoGeometry = new Proxy(pco.pcoGeometry, {
                    set: function(target, propKey, value) {
                        if (propKey === 'needsUpdate' && value) {
                            frame.update();
                        }
                        return Reflect.set(target, propKey, value);
                    },
                });
                const r = (c: PointCloudOctreeGeometryNode | null) => {
                    if (c) {
                        c.pcoGeometry = pco.pcoGeometry as PointCloudOctreeGeometry;
                        for (const child of c.children) {
                            r(child);
                        }
                    }
                };
                r(pco.pcoGeometry.root as PointCloudOctreeGeometryNode);

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