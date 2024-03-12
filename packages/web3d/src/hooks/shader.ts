import { ref, shallowRef } from 'vue';
import * as THREE from 'three';

export const useShader = () => {
    const mode = ref<string>('normal');

    const material = shallowRef<THREE.ShaderMaterial>(new THREE.ShaderMaterial());

    return {
        mode,
        material,
    } as const;
};