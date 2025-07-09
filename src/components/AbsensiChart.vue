<template>
  <div class="space-y-4">
    <!-- Chart -->
    <canvas ref="canvasRef" class="max-w-full"></canvas>

    <!-- 🔁 Toggle Button: Bawah, Tengah -->
    <div class="flex justify-center">
      <button
        @click="isPersentase = !isPersentase"
        class="bg-blue-100 text-blue-700 px-4 py-1 rounded-md font-medium text-sm hover:bg-blue-200 transition"
      >
        {{ isPersentase ? 'Tampilkan Jumlah' : 'Tampilkan Persentase' }}
      </button>
    </div>

    <!-- Statistik Harian -->
    <div class="space-y-2 bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
      <div
        v-for="(stat, index) in statistikPerTanggal"
        :key="index"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-3 gap-y-2 items-center bg-white rounded-md px-4 py-2 shadow-sm hover:bg-gray-50 text-sm"
      >
        <div class="font-semibold text-gray-700">📅 {{ stat.tanggal }}</div>
        <div class="text-green-700 font-medium">
          ✔️
          <span class="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">{{ stat.M }}</span>
        </div>
        <div class="text-yellow-700 font-medium">
          🟡
          <span class="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">{{
            stat.I
          }}</span>
        </div>
        <div class="text-blue-700 font-medium">
          🔵
          <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{{ stat.S }}</span>
        </div>
        <div class="text-red-700 font-medium">
          ❌
          <span class="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">{{ stat.A }}</span>
        </div>
        <div class="text-gray-600 text-sm">
          🎯 {{ Math.round((stat.M / totalSiswa) * 100) || 0 }}%
        </div>
      </div>
    </div>

    <!-- 📊 Statistik Global -->
    <div class="bg-white rounded-lg p-4 shadow border border-gray-200">
      <h3 class="font-semibold text-gray-700 text-base mb-2">📊 Statistik Global</h3>
      <div class="flex flex-wrap gap-3 text-sm">
        <div class="text-green-700 font-medium">
          ✔️ Hadir:
          <span class="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">{{
            totalGlobal.M
          }}</span>
        </div>
        <div class="text-yellow-700 font-medium">
          🟡 Izin:
          <span class="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">{{
            totalGlobal.I
          }}</span>
        </div>
        <div class="text-blue-700 font-medium">
          🔵 Sakit:
          <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{{
            totalGlobal.S
          }}</span>
        </div>
        <div class="text-red-700 font-medium">
          ❌ Alpha:
          <span class="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">{{
            totalGlobal.A
          }}</span>
        </div>
        <div class="text-gray-600 font-medium">
          🎯 Rata-rata Hadir:
          <span class="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs"
            >{{ rataHadirGlobal }}%</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Chart, registerables, type ChartData } from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{
  tanggalList: string[]
  rekap: { nama: string; kelas: string; absensi: string[] }[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const isPersentase = ref(false)

const totalSiswa = computed(() => props.rekap.length || 1)

const statistikPerTanggal = computed(() =>
  props.tanggalList.map((tgl, i) => {
    const stat = {
      tanggal: new Date(tgl).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
      }),
      M: 0,
      I: 0,
      S: 0,
      A: 0,
    }
    props.rekap.forEach((s) => {
      const status = s.absensi[i]
      if (status && stat[status as keyof typeof stat] !== undefined) {
        stat[status as keyof typeof stat]++
      }
    })
    return stat
  }),
)

const totalGlobal = computed(() => {
  const total = { M: 0, I: 0, S: 0, A: 0 }
  statistikPerTanggal.value.forEach((s) => {
    total.M += s.M
    total.I += s.I
    total.S += s.S
    total.A += s.A
  })
  return total
})

const rataHadirGlobal = computed(() => {
  const totalHari = statistikPerTanggal.value.length
  const totalHadir = totalGlobal.value.M
  const totalKesempatan = totalSiswa.value * totalHari
  if (totalKesempatan === 0) return 0
  return Math.round((totalHadir / totalKesempatan) * 100)
})

function getChartData(): ChartData<'bar'> {
  if (isPersentase.value) {
    return {
      labels: statistikPerTanggal.value.map((s) => s.tanggal),
      datasets: [
        {
          label: 'Persentase Hadir (✔️)',
          data: statistikPerTanggal.value.map((s) => Math.round((s.M / totalSiswa.value) * 100)),
          backgroundColor: 'rgba(34,197,94,0.7)',
          borderRadius: 4,
        },
      ],
    }
  } else {
    return {
      labels: statistikPerTanggal.value.map((s) => s.tanggal),
      datasets: [
        {
          label: 'Hadir (✔️)',
          data: statistikPerTanggal.value.map((s) => s.M),
          backgroundColor: 'rgba(34,197,94,0.7)',
          borderRadius: 4,
        },
        {
          label: 'Izin (🟡)',
          data: statistikPerTanggal.value.map((s) => s.I),
          backgroundColor: 'rgba(234,179,8,0.7)',
          borderRadius: 4,
        },
        {
          label: 'Sakit (🔵)',
          data: statistikPerTanggal.value.map((s) => s.S),
          backgroundColor: 'rgba(59,130,246,0.7)',
          borderRadius: 4,
        },
        {
          label: 'Alpha (❌)',
          data: statistikPerTanggal.value.map((s) => s.A),
          backgroundColor: 'rgba(239,68,68,0.7)',
          borderRadius: 4,
        },
      ],
    }
  }
}

function renderChart() {
  if (!canvasRef.value) return
  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(canvasRef.value, {
    type: 'bar',
    data: getChartData(),
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: isPersentase.value ? 100 : undefined,
          ticks: {
            callback: (value) => (isPersentase.value ? `${value}%` : `${value}`),
          },
          title: {
            display: true,
            text: isPersentase.value ? 'Persentase Hadir (%)' : 'Jumlah Mahasantri',
          },
        },
        x: {
          title: { display: true, text: 'Tanggal' },
        },
      },
    },
  })
}

watch([() => props.rekap, () => props.tanggalList, isPersentase], renderChart)

onMounted(renderChart)
</script>
