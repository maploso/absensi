<template>
  <section
    class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center px-4"
  >
    <div class="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-gray-100">
      <!-- Logo -->
      <div class="text-center mb-6">
        <img
          src="@/assets/logo.png"
          alt="Logo Ma'had Aly Al Falah Ploso"
          class="mx-auto h-24 drop-shadow-md"
        />
      </div>

      <!-- Judul -->
      <h1 class="text-3xl font-extrabold text-center text-gray-800 mb-2 leading-snug">
        Absensi Ma'had Aly <br />
        Al Falah Ploso
      </h1>

      <div class="text-center border-b border-green-300 mb-4 pb-4">
        <p class="text-sm text-gray-500 tracking-wide uppercase">Hari Ini</p>
        <p class="text-2xl font-bold text-green-700 mt-1">{{ hariIni }}, {{ today }}</p>
        <p
          class="mt-3 text-3xl font-mono font-bold text-blue-700 bg-blue-100 px-5 py-2 rounded-lg inline-block shadow-md tracking-widest"
        >
          ⏰ {{ currentTime }}
        </p>
      </div>

      <!-- Attendance Form Component -->
      <AttendanceForm />
    </div>
  </section>
</template>

<script setup lang="ts">
import AttendanceForm from '@/components/AttendanceForm.vue'
import { getTodayJakarta, getDayNameJakarta } from '@/utils/date'
import { ref, onMounted, onUnmounted } from 'vue'

const tanggal = ref(getTodayJakarta())
const today = tanggal.value
const hariIni = getDayNameJakarta()

const currentTime = ref(getCurrentTime())

function getCurrentTime(): string {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

let interval: number

onMounted(() => {
  interval = window.setInterval(() => {
    currentTime.value = getCurrentTime()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>
