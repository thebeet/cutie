import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [vue()],
    publicDir: command === 'serve' ? '../../public' : false,
}));
