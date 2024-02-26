import { defineStore } from 'pinia';
import * as THREE from 'three';
import { ref, computed } from 'vue';

type AXIS = 'x' | 'y' | 'z';
type THREEVIEWNAME = 'front' | 'side' | 'top' | 'rear' | 'rside' | 'bottom';

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
            'UP': XUp.value.clone(),
        };
    });
    const rear = computed(() => {
        return {
            'x': X.value.clone().cross(XUp.value),
            'y': XUp.value.clone(),
            'z': X.value.clone().multiplyScalar(-1),
            'UP': XUp.value.clone(),
        };
    });
    const side = computed(() => {
        return {
            'x': Y.value.clone().cross(YUp.value).multiplyScalar(-1),
            'y': YUp.value.clone().multiplyScalar(-1),
            'z': Y.value.clone(),
            'UP': YUp.value.clone(),
        };
    });
    const rside = computed(() => {
        return {
            'x': Y.value.clone().cross(YUp.value),
            'y': YUp.value.clone(),
            'z': Y.value.clone().multiplyScalar(-1),
            'UP': YUp.value.clone(),
        };
    });
    const top = computed(() => {
        return {
            'x': Z.value.clone().cross(ZUp.value).multiplyScalar(-1),
            'y': ZUp.value.clone().multiplyScalar(-1),
            'z': Z.value.clone(),
            'UP': ZUp.value.clone(),
        };
    });
    const bottom = computed(() => {
        return {
            'x': Z.value.clone().cross(ZUp.value),
            'y': ZUp.value.clone(),
            'z': Z.value.clone().multiplyScalar(-1),
            'UP': ZUp.value.clone(),
        };
    });

    const axis2d = {
        'front': {
            'x': 'y',
            'y': 'z',
            'z': 'x'
        },
        'side': {
            'x': 'x',
            'y': 'z',
            'z': 'y'
        },
        'top': {
            'x': 'x',
            'y': 'y',
            'z': 'z'
        },
        'rear': {
            'x': 'y',
            'y': 'z',
            'z': 'x'
        },
        'rside': {
            'x': 'x',
            'y': 'z',
            'z': 'y'
        },
        'bottom': {
            'x': 'x',
            'y': 'y',
            'z': 'z'
        },
    } as { [key in THREEVIEWNAME]: { [key in AXIS]: AXIS } };

    return {
        X, XUp, Y, YUp, Z, ZUp,
        front, side, top,
        rear, rside, bottom,
        axis2d
    };
});