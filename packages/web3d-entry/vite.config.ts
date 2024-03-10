import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [vue({
        template: {
            compilerOptions: {
                isCustomElement: (tag) => ['svg-icon'].includes(tag),
            }
        }
    })],
    resolve: {
    },
    server: {
        open: true,
        host: true,
        port: 8082,
        proxy: {
        }
    },
    publicDir: command === 'serve' ? '../../public' : false,
    build: {
        chunkSizeWarningLimit: 1024,
        rollupOptions: {
            input: 'index.html',
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                    return 'index';
                }
            },
        }
    }
}));
