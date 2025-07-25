// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'

const routes: RouteRecordRaw[] = [
  // 🟢 Login page (di luar layout utama)
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },

  // 🔒 Protected routes di dalam layout utama
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: HomePage,
        meta: { requiresAuth: true },
      },
      {
        path: '/admin/izin',
        name: 'FormIzin',
        component: () => import('@/pages/FormIzin.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'attendance',
        name: 'AttendancePage',
        component: () => import('@/pages/AttendancePage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'report',
        name: 'RekapAbsensi',
        component: () => import('@/pages/RekapAbsensi.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  // 🔁 Redirect fallback ke home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 🛡️ Navigation Guard
router.beforeEach((to, from, next) => {
  const userRaw = localStorage.getItem('loginUser')
  const user = userRaw ? JSON.parse(userRaw) : null
  const isLoggedIn = !!user

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin && (!isLoggedIn || user.role !== 'admin')) {
    next('/') // redirect ke home kalau bukan admin
  } else if (to.path === '/login' && isLoggedIn) {
    next('/') // jika sudah login, cegah akses ke /login
  } else {
    next()
  }
})

export default router
