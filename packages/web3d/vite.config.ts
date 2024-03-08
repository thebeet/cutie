import { defineConfig } from 'vite';
import { URL, fileURLToPath } from 'node:url';
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
        alias: {
            '@web3d': fileURLToPath(new URL('./src', import.meta.url)),
            '@web3d-plugin-': fileURLToPath(new URL('./src/plugins/', import.meta.url)),
        }
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
