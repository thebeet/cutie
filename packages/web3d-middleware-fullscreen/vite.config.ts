import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        open: true,
        host: true,
        port: 8082,
        proxy: {
        }
    },
    build: {
        rollupOptions: {
            input: 'index.ts'
        }
    }
});
