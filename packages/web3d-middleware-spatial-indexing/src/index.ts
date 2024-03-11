import { useDrama, usePerformanceStore } from '@cutie/web3d';
import localforage from 'localforage';
import { Octree, OctreeSerialization } from './libs/Octree';
import { Bruteforce } from './libs/Bruteforce';
import { injectPerformance } from './performance';
import { Points } from 'three';

const buildOctree = (points: Points) => {
    const { measure } = usePerformanceStore();
    const key = 'octree-' + points.geometry.uuid;
    return localforage.getItem<OctreeSerialization>(key).then((data) => {
        if (data) {
            const octree = Octree.fromSerialization(points.geometry, data);
            if (octree) {
                return octree;
            }
        }
        const octree = Octree.fromPointsGeometry(points.geometry);
        localforage.setItem(key, octree.serialization());
        return octree;
    }).then(octree => {
        if (octree) {
            octree.intersect = measure('web3d::octree::intersect', octree.intersect);
        }
        return octree;
    });
};

export const useMiddleware = () => {
    injectPerformance();
    const { frames } = useDrama();

    frames.forEach((frame) => {
        frame.onPointsLoaded.then(({ points }) => {
            frame.intersectDelegate = Bruteforce.fromPoints(points);
            buildOctree(points).then(octree => frame.intersectDelegate = octree);
        });
    });
};