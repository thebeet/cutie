import localforage from 'localforage';

import * as THREE from 'three';
import { PointsMaterial } from '@web3d/three/PointsMaterial';

const _pointsMaterial = new PointsMaterial({ size: 1.0 });

export const usePCDCachedLoader = (loader: THREE.Loader<THREE.Points>) => {
    const promises: {
        [key: string]: Promise<THREE.Points>
    } = {};
    const load = (url: string): Promise<THREE.Points> => {
        const key = 'pcd-url-' + url;
        if (!(key in promises)) {
            promises[key] = new Promise<THREE.Points>((resolve, reject) => {
                localforage.getItem<THREE.BufferGeometry>(key, (err, value) => {
                    if (err || value === null || value === undefined) {
                        loader.load(url, (data) => {
                            localforage.setItem(key, data.geometry);
                            data.material = _pointsMaterial;
                            resolve(data);
                        },
                        () => { },
                        (error) => {
                            reject(error);
                        });
                    } else {
                        const g = new THREE.BufferGeometry();
                        g.uuid = value.uuid;
                        for (const key in value.attributes) {
                            const attribute: THREE.BufferAttribute = Object.setPrototypeOf(value.attributes[key], THREE.BufferAttribute.prototype);
                            g.setAttribute(key, attribute);
                        }
                        const obj = new THREE.Points(g, _pointsMaterial);
                        resolve(obj);
                    }
                });
            });
        }
        return promises[key];
    };
    return {
        load
    };
};
