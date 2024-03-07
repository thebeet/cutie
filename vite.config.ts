import { defineConfig } from 'vite';
import { URL, fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue({
        template: {
            compilerOptions: {
                isCustomElement: (tag) => ['svg-icon'].includes(tag),
            }
        }
    })],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@web3d': fileURLToPath(new URL('./src/views/page/web3d', import.meta.url))
        }
    },
    server: {
        open: true,
        host: true,
        port: 8082,
        proxy: {
        }
    },
    build: {
        chunkSizeWarningLimit: 1024,
        rollupOptions: {
            cache: false,
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
});
