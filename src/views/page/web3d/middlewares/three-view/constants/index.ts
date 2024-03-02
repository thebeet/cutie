import { Vector3 } from 'three';

type AXIS = 'x' | 'y' | 'z';
type THREEVIEWNAME = 'front' | 'side' | 'top' | 'rear' | 'rside' | 'bottom';

const X = new Vector3(1, 0, 0);
const XUp = new Vector3(0, 0, 1);
const Y = new Vector3(0, -1, 0);
const YUp = new Vector3(0, 0, 1);
const Z = new Vector3(0, 0, 1);
const ZUp = new Vector3(0, 1, 0);

const views = {
    front: {
        'x': X.clone().cross(XUp).multiplyScalar(-1),
        'y': XUp.clone().multiplyScalar(-1),
        'z': X.clone(),
        'UP': XUp.clone(),
    },
    rear: {
        'x': X.clone().cross(XUp),
        'y': XUp.clone(),
        'z': X.clone().multiplyScalar(-1),
        'UP': XUp.clone(),
    },
    side: {
        'x': Y.clone().cross(YUp).multiplyScalar(-1),
        'y': YUp.clone().multiplyScalar(-1),
        'z': Y.clone(),
        'UP': YUp.clone(),
    },
    rside: {
        'x': Y.clone().cross(YUp),
        'y': YUp.clone(),
        'z': Y.clone().multiplyScalar(-1),
        'UP': YUp.clone(),
    },
    top: {
        'x': Z.clone().cross(ZUp).multiplyScalar(-1),
        'y': ZUp.clone().multiplyScalar(-1),
        'z': Z.clone(),
        'UP': ZUp.clone(),
    },
    bottom: {
        'x': Z.clone().cross(ZUp),
        'y': ZUp.clone(),
        'z': Z.clone().multiplyScalar(-1),
        'UP': ZUp.clone(),
    }
};

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

export {
    views,
    axis2d
};