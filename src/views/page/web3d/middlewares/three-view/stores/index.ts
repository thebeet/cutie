import { defineStore } from 'pinia';
import * as THREE from 'three';
import { ref, computed } from 'vue';

export const useThreeViewStore = defineStore('plugin::three-view', () => {
    const X = ref(new THREE.Vector3(1, 0, 0));
    const XUp = ref(new THREE.Vector3(0, 0, 1));
    const Y = ref(new THREE.Vector3(0, -1, 0));
    const YUp = ref(new THREE.Vector3(0, 0, 1));
    const Z = ref(new THREE.Vector3(0, 0, 1));
    const ZUp = ref(new THREE.Vector3(0, 1, 0));

    const front = computed(() => {
        return {
            'x': X.value.clone().cross(XUp.value).multiplyScalar(-1),
            'y': XUp.value.clone().multiplyScalar(-1),
            'z': X.value.clone(),
        };
    });
    const side = computed(() => {
        return {
            'x': Y.value.clone().cross(YUp.value).multiplyScalar(-1),
            'y': YUp.value.clone().multiplyScalar(-1),
            'z': Y.value.clone(),
        };
    });
    const top = computed(() => {
        return {
            'x': Z.value.clone().cross(ZUp.value).multiplyScalar(-1),
            'y': ZUp.value.clone().multiplyScalar(-1),
            'z': Z.value.clone(),
        };
    });
    return {
        X, XUp, Y, YUp, Z, ZUp,
        front, side, top
    };
});