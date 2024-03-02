import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './svg-icon';
import App from './App.vue';
import router from './router';
import './index.css';

createApp(App).use(router).use(createPinia()).mount('#app');
