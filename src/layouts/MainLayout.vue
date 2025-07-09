<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-md px-4 py-3 flex justify-between items-center">
      <h1 class="text-xl font-bold text-gray-700">📋 Absensi Ma'had Aly Al Falah Ploso</h1>
      <button @click="logout" class="text-sm text-red-600 font-semibold hover:underline">
        🚪 Logout
      </button>
    </header>

    <!-- Main content -->
    <main class="flex-grow">
      <RouterView />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('loginUser')
  router.push('/login')
}
</script>
