import { useAdvanceDrama } from '@cutie/web3d';
import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import * as THREE from 'three';

export const useRenderInfoStore = defineStore('plugin::render-info', () => {
    const { onRender } = useAdvanceDrama();

    const info = shallowRef<any>();
    onRender(({ renderer, scene }) => {
        info.value = {
            memory: { ...renderer.info.memory },
            render: { ...renderer.info.render },
            // programs: renderer.info.programs ? [...renderer.info.programs!.map((program) => `${program.name}(${program.usedTimes})`)] : [],
            counts: { objects: 0, vertices: 0, triangles: 0 }
        };
        scene.traverseVisible(obj => {
            info.value.counts.objects++;
            if (obj instanceof THREE.Mesh) {
                const geometry = obj.geometry;
                if (geometry.index !== null) {
                    info.value.counts.vertices += geometry.index.count;
                    info.value.counts.triangles += geometry.index.count / 3;
                } else {
                    info.value.counts.vertices += geometry.attributes.position.count;
                    info.value.counts.triangles += geometry.attributes.position.count / 3;
                }
            } else if (obj instanceof THREE.Points) {
                const geometry = obj.geometry;
                info.value.counts.vertices += geometry.attributes.position.count;
            }
        });
    });

    return {
        info
    } as const;
});