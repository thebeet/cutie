import { Octree } from './libs/Octree';
import { KDTree } from './libs/KDTree';
import { usePerformanceStore } from '@cutie/web3d';
import { QuadTree } from './libs/QuadTree';

export const injectPerformance = () => {
    const { measure } = usePerformanceStore();
    Octree.fromPointsGeometry = measure('web3d::octree::build', Octree.fromPointsGeometry);
    Octree.fromSerialization = measure('web3d::octree::rebuild', Octree.fromSerialization);
    Octree.prototype.serialization = measure('web3d::octree::serialization', Octree.prototype.serialization);

    QuadTree.fromPointsGeometry = measure('web3d::quadtree::build', QuadTree.fromPointsGeometry);
    QuadTree.fromSerialization = measure('web3d::quadtree::rebuild', QuadTree.fromSerialization);
    QuadTree.prototype.serialization = measure('web3d::quadtree::serialization', QuadTree.prototype.serialization);

    KDTree.fromPointsGeometry = measure('web3d::kdtree::build', KDTree.fromPointsGeometry);
};