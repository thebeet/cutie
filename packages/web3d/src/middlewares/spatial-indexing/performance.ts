import { Octree } from './libs/Octree';
import { KDTree } from './libs/KDTree';
import { usePerformanceStore } from '@web3d/stores/performance';

export const injectPerformance = () => {
    const { measure } = usePerformanceStore();
    Octree.fromPointsGeometry = measure('web3d::octree::build', Octree.fromPointsGeometry);
    Octree.fromSerialization = measure('web3d::octree::rebuild', Octree.fromSerialization);
    Octree.prototype.serialization = measure('web3d::octree::serialization', Octree.prototype.serialization);

    KDTree.fromPointsGeometry = measure('web3d::kdtree::build', KDTree.fromPointsGeometry);
};