import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './index.css';
import App from './App.vue';

import router from './router';

import './svg-icon';

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount('#app');
