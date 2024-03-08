import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './svg-icon';
import App from './App.vue';
import './index.css';

createApp(App).use(createPinia()).mount('#app');
