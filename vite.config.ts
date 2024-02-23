import { defineConfig } from 'vite';
import glob from 'glob';
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
        rollupOptions: {
            output: {
                manualChunks: {
                    'index': ['index.html'],
                    ...Object.fromEntries(glob.sync('src/views/page/*/PageView.vue').map((file: string) => {
                        const template = file.slice('src/views/page/'.length, -'/PageView.vue'.length);
                        return [
                            'page-' + template,
                            [file]
                        ];
                    })),
                    ...Object.fromEntries(glob.sync('src/views/page/web3d/plugins/*/index.ts').map((file: string) => {
                        const template = file.slice('src/views/page/web3d/plugins/'.length, -'/index.ts'.length);
                        return [
                            'web3d-plugin-' + template,
                            [file]
                        ];
                    })),
                    ...Object.fromEntries(glob.sync('src/views/page/web3d/middlewares/*/index.ts').map((file: string) => {
                        const template = file.slice('src/views/page/web3d/middlewares/'.length, -'/index.ts'.length);
                        return [
                            'web3d-middleware-' + template,
                            [file]
                        ];
                    }))
                }
            }
        }
    }
});
