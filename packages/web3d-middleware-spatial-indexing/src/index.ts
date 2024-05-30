import { useAdvanceDrama, usePerformanceStore } from '@cutie/web3d';
import localforage from 'localforage';
import { Octree } from './libs/Octree';
import { QuadTree } from './libs/QuadTree';
import { Bruteforce } from './libs/Bruteforce';
import { injectPerformance } from './performance';
import { Points } from 'three';
import { TFrustumCulledPoints } from './three/TFrustumCulledPoints';
import { OctreeHelper } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
import { SpatialTreeSerialization } from './libs/SpatialTree';

const buildOctree = (points: Points) => {
    const { measure } = usePerformanceStore();
    const key = 'octree-' + points.geometry.uuid;
    return localforage.getItem<SpatialTreeSerialization>(key).then((data) => {
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
    return localforage.getItem<SpatialTreeSerialization>(key).then((data) => {
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

type Config = {
    readonly spatialTree: 'octree' | 'quadtree';
};

const defaultConfig: Config = {
    spatialTree: 'quadtree',
};

export const useMiddleware = (config?: Partial<Config>) => {
    const {
        spatialTree,
    } = {
        ...defaultConfig,
        ...config,
    };
    const treeBuilder = spatialTree === 'octree' ? buildOctree : buildQuadTree;
    injectPerformance();
    const { frames, onBeforeRender } = useAdvanceDrama();

    const tPoints: TFrustumCulledPoints[] = [];

    onBeforeRender(({ camera }) => {
        const frustum = new THREE.Frustum();
        const projScreenMatrix = new THREE.Matrix4();
        projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(projScreenMatrix);

        tPoints.forEach(p => {
            if (p.parent?.visible === true) {
                p.onBeforeProject(frustum, camera);
            }
        });
    });

    frames.forEach((frame) => {
        frame.onPointsLoaded.then(({ frame, points, callback }) => {
            frame.intersectDelegate = Bruteforce.fromPoints(points);
            treeBuilder(points).then(tree => {
                frame.intersectDelegate = tree;
                if (callback) {
                    //callback(points);
                    
                    const lodIndices = [
                        {distance: -1, k: 1, index: new THREE.BufferAttribute(tree.index, 1)},
                    ];
                    const lodConfig = [
                        {distance: 50, k: 1.2},
                        {distance: 70, k: 1.414},
                        {distance: 100, k: 2},
                        {distance: 150, k: 3},
                        {distance: 200, k: 5},
                        {distance: 250, k: 8},
                        {distance: 300, k: 13},
                        {distance: 400, k: 21},
                        {distance: 500, k: 34},
                    ]
                    for (const config of lodConfig) {
                        const { k, distance } = config;
                        const m = Math.floor(tree.index.length / k);
                        const indexLODArray = new Uint32Array(m);
                        for (let i = 0; i < m; i++) {
                            indexLODArray[i] = tree.index[Math.floor(k * i)]
                        }
                        const index = new THREE.BufferAttribute(indexLODArray, 1);
                        lodIndices.push({
                            distance, k, index
                        });
                    }
                    const p = new TFrustumCulledPoints(points, tree, lodIndices);
                    tPoints.push(p);
                    callback(p);
                    //frame.add(new OctreeHelper(tree))
                }
            });
        });
    });
};