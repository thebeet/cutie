import { bootstrap, registerPlugin } from '@cutie/web3d';

registerPlugin('answer-cache', () => import('@cutie/web3d-middleware-answer-cache'));
registerPlugin('answer-history', () => import('@cutie/web3d-middleware-answer-history'));
registerPlugin('camera-control', () => import('@cutie/web3d-middleware-camera-control'));
registerPlugin('frame-pagination', () => import('@cutie/web3d-middleware-frame-pagination'));
registerPlugin('fullscreen', () => import('@cutie/web3d-middleware-fullscreen'));
registerPlugin('mouse', () => import('@cutie/web3d-middleware-mouse'));
registerPlugin('render-sampling', () => import('@cutie/web3d-middleware-render-sampling'));
registerPlugin('spatial-indexing', () => import('@cutie/web3d-middleware-spatial-indexing'));
registerPlugin('three-view', () => import('@cutie/web3d-middleware-three-view'));

registerPlugin('box', () => import('@cutie/web3d-plugin-box'));
registerPlugin('parsing', () => import('@cutie/web3d-plugin-parsing'));
registerPlugin('line', () => import('@cutie/web3d-plugin-line'));
registerPlugin('projection2d', () => import('@cutie/web3d-plugin-projection2d'));

bootstrap();
