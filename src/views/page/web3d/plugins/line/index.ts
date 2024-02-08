import { useDrama } from '@web3d/hooks/drama';
import * as THREE from 'three';
import { watch } from 'vue';

export const useLine = () => {
    const { scene, camera, mouseEvent } = useDrama();

    const material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });
    const points: THREE.Vector3[] = [];
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 10, 10, 0 ) );

    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    const line = new THREE.Line( geometry, material );
    scene.add(line);
    watch(mouseEvent, (mouse) => {
        if (mouse.points.length > 0) {
            const point = new THREE.Vector2(
                mouse.points[mouse.points.length - 1].x,
                mouse.points[mouse.points.length - 1].y
            );
            const ray = new THREE.Raycaster();
            ray.setFromCamera(point, camera);
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
            ray.ray.intersectPlane(plane, points[1]);
            geometry.setFromPoints( points );
            geometry.getAttribute('position').needsUpdate = true;
            // @ts-ignore
            scene.dispatchEvent({ type: 'change' });
        }
    }, { deep: true });
};