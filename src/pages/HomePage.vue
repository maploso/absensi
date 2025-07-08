<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
    <div class="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
      <!-- Logo -->
      <div class="text-center mb-6">
        <img src="@/assets/logo.png" alt="Logo Ma'had Aly Al Falah Ploso" class="mx-auto h-24" />
      </div>

      <!-- Judul -->
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-2">
        Absensi Ma'had Aly<br />
        Al Falah Ploso
      </h1>

      <!-- Deskripsi -->
      <p class="text-center text-gray-600 mb-6">
        Mudah dan cepat, absensi hanya dengan beberapa klik.
      </p>

      <!-- Tombol Navigasi -->
      <div class="flex flex-col gap-4">
        <RouterLink to="/attendance" class="btn-main"> 📝 Absen Mahasantri </RouterLink>
        <RouterLink to="/report" class="btn-main"> 📊 Rekap Absensi </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
@reference "tailwindcss";

.btn-main {
  @apply bg-green-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition;
}
</style>
