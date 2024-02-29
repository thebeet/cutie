import { useDrama } from '@web3d/hooks/drama';
import { h } from 'vue';
import { useLineStore } from './stores';
import { storeToRefs } from 'pinia';
import { addNodeToContainer } from '..';
import ToolBox from './components/ToolBox.vue';
import * as THREE from 'three';

export const usePlugin = () => {
    const { scene, frames, primaryFrame, camera, toolbox, onAdvanceMouseEvent } = useDrama();
    useLineStore();

    const geometry = new THREE.SphereGeometry( .2, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    const sphere = new THREE.Mesh( geometry, material );
    const l = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()] ),
        new THREE.LineBasicMaterial( {
            color: 0xffffff
        }));
    l.frustumCulled = false;
    scene.add( l );

    sphere.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.CircleGeometry(1, 32)),
        new THREE.LineBasicMaterial( {
            color: 0xffffff
        })
    ));
    scene.add( sphere );

    const setP = (p: THREE.Vector3) => {
        l.geometry.attributes.position.setX(1, p.x);
        l.geometry.attributes.position.setY(1, p.y);
        l.geometry.attributes.position.setZ(1, p.z);
        l.geometry.attributes.position.needsUpdate = true;
        sphere.position.set(p.x, p.y, p.z);
        sphere.updateMatrix();
        sphere.updateMatrixWorld();
        scene.update();
    };

    const zeroPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    onAdvanceMouseEvent((event) => {
        if (event.type === 'hover') {
            const { x, y } = event.points[0];
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(
                new THREE.Vector2(x, y),
                camera
            );
            const ps: THREE.Vector3[] = [];
            primaryFrame.value?.intersectRay(raycaster.ray, .5, (p) => {
                ps.push(p.clone());
            });
            if (ps.length >= 1) {
                const nps = ps.map(p => ({
                    point: p,
                    dis: camera.position.distanceToSquared(p)
                })).sort((a, b) => {
                    return a.dis - b.dis;
                });

                const target = new THREE.Vector3();
                raycaster.ray.closestPointToPoint(nps[0].point, target);
                setP(target);
            } else {
                const target = new THREE.Vector3();
                raycaster.ray.intersectPlane(zeroPlane, target);
                setP(target);
            }
        }
    });

    addNodeToContainer(h(ToolBox), toolbox);
};