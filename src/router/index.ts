import { createRouter, createWebHistory } from 'vue-router';

const PageView = () => import('@/views/page/PageView.vue');

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Page',
            component: PageView,
        }
    ]
});
export default router;
