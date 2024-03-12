import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './index.css';
import App from './App.vue';

export const bootstrap = () => {
    createApp(App).use(createPinia()).mount('#app');
};
