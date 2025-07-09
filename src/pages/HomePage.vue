<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-6">
    <div
      class="bg-white shadow-md rounded-lg p-6 w-full max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl"
    >
      <!-- Logo -->
      <div class="text-center mb-6">
        <img
          src="@/assets/logo.png"
          alt="Logo Ma'had Aly Al Falah Ploso"
          class="mx-auto h-20 md:h-24"
        />
      </div>

      <!-- Judul -->
      <h1 class="text-xl md:text-2xl font-bold text-center text-gray-800 leading-tight mb-1">
        Absensi Ma'had Aly
      </h1>
      <h2 class="text-lg md:text-xl font-semibold text-center text-gray-700 mb-4">
        Al Falah Ploso
      </h2>

      <!-- Deskripsi Selamat Datang -->
      <p class="text-base md:text-lg text-center text-gray-700 font-medium mb-6">
        👋 Selamat datang, <span class="font-bold">{{ user.nama }}</span> {{ kelas }}
      </p>

      <!-- Tombol Navigasi -->
      <div class="flex flex-col gap-4">
        <RouterLink to="/attendance" class="btn-main"> 📝 Absen Mahasantri </RouterLink>
        <RouterLink to="/report" class="btn-main"> 📊 Rekap Absensi </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const user = JSON.parse(localStorage.getItem('loginUser') || '{}')
const kelas = ref(user?.kelas || '')
</script>

<style scoped>
@reference "tailwindcss";

.btn-main {
  @apply bg-green-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition;
}
</style>
