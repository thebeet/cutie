import { useDrama, usePerformanceStore } from '@cutie/web3d';
import localforage from 'localforage';
import { Octree, OctreeSerialization } from './libs/Octree';
import { QuadTree, QuadTreeSerialization } from './libs/QuadTree';
import { Bruteforce } from './libs/Bruteforce';
import { injectPerformance } from './performance';
import { Points } from 'three';
import { TFrustumCulledPoints } from './three/TFrustumCulledPoints';

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

const buildQuadTree = (points: Points) => {
    const { measure } = usePerformanceStore();
    const key = 'quadtree-' + points.geometry.uuid;
    return localforage.getItem<QuadTreeSerialization>(key).then((data) => {
        if (data) {
            const quadtree = QuadTree.fromSerialization(points.geometry, data);
            if (quadtree) {
                return quadtree;
            }
        }
        const quadtree = QuadTree.fromPointsGeometry(points.geometry);
        localforage.setItem(key, quadtree.serialization());
        return quadtree;
    }).then(quadtree => {
        if (quadtree) {
            quadtree.intersect = measure('web3d::quadtree::intersect', quadtree.intersect);
        }
        return quadtree;
    });
};

export const useMiddleware = () => {
    injectPerformance();
    const { frames } = useDrama();

    frames.forEach((frame) => {
        frame.onPointsLoaded.then(({ points, callback }) => {
            frame.intersectDelegate = Bruteforce.fromPoints(points);
            buildQuadTree(points).then(tree => {
                frame.intersectDelegate = tree;
                if (callback) {
                    //callback(points);
                    callback(new TFrustumCulledPoints(points, tree));
                }
            });
        });
    });
};