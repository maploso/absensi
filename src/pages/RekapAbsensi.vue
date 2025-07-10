<template>
  <div
    class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center px-4 py-6"
  >
    <div class="bg-white shadow-xl rounded-xl p-6 w-full max-w-6xl border border-gray-100">
      <!-- Logo -->
      <div class="text-center mb-6">
        <img src="@/assets/logo.png" alt="Logo Ma'had Aly" class="h-20 mx-auto drop-shadow" />
      </div>

      <!-- Judul -->
      <h1 class="text-xl md:text-2xl font-bold text-center text-gray-800 leading-tight mb-1">
        Rekap Absensi Ma'had Aly
      </h1>
      <h2 class="text-lg md:text-xl font-semibold text-center text-gray-700 mb-4">
        Al Falah Ploso
      </h2>

      <!-- Form Input -->
      <!-- Filter Section -->
      <div class="space-y-4 mb-6">
        <!-- Kelas -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center shadow-sm">
          <div class="text-sm text-gray-500 mb-1">Kelas Anda</div>
          <div v-if="isAdmin">
            <label class="block font-semibold text-sm text-gray-700 mb-1">🏷️ Pilih Kelas</label>
            <select v-model="kelas" class="input">
              <option v-for="k in Object.keys(classScriptUrls)" :key="k" :value="k">{{ k }}</option>
            </select>
          </div>
          <div v-else>
            <div class="text-lg font-semibold text-green-700">{{ kelas }}</div>
          </div>
        </div>

        <!-- Rentang Tanggal + Tombol -->
        <div class="grid gap-4 md:grid-cols-3 items-end">
          <!-- Tanggal Awal -->
          <div>
            <label class="block font-semibold text-sm text-gray-700 mb-1">📅 Dari Tanggal</label>
            <input type="date" v-model="tanggalAwal" class="input" />
          </div>

          <!-- Tanggal Akhir -->
          <div>
            <label class="block font-semibold text-sm text-gray-700 mb-1">📅 Sampai Tanggal</label>
            <input type="date" v-model="tanggalAkhir" class="input" />
          </div>

          <!-- Tombol -->
          <div>
            <button
              @click="loadRekap"
              :disabled="loading"
              class="btn-primary w-full flex items-center justify-center"
            >
              <LoadingSpinner v-if="loading" class="mr-2" />
              <span>{{ loading ? 'Memuat...' : 'Muat Rekap' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tombol Shortcut -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <button @click="set7HariTerakhir" class="btn-secondary">7 Hari Terakhir</button>
        <button @click="set14HariTerakhir" class="btn-secondary">14 Hari Terakhir</button>
        <button @click="setBulanIni" class="btn-secondary">Bulan Ini</button>
        <button @click="resetFilter" class="btn-secondary">Reset</button>
      </div>

      <!-- Tabel Rekap -->
      <div v-if="rekap.length > 0" class="overflow-auto border rounded-lg">
        <table class="table-auto w-full text-sm text-center">
          <thead class="bg-green-100 sticky top-0 shadow text-gray-700">
            <tr>
              <th class="px-2 py-2">No</th>
              <th class="px-4 py-2 text-left">Nama</th>
              <th class="px-4 py-2">Kelas</th>
              <th class="px-4 py-2">Kamar</th>
              <th v-for="(tgl, i) in tanggalList" :key="i" class="px-4 py-2">
                {{ formatDate(tgl) }}
              </th>
              <th class="px-2 py-2">Hadir</th>
              <th class="px-2 py-2">Izin</th>
              <th class="px-2 py-2">Sakit</th>
              <th class="px-2 py-2">Alpha</th>
              <th class="px-2 py-2">%</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(siswa, i) in rekap" :key="i" class="border-b hover:bg-gray-50 transition">
              <td class="px-2 py-1">{{ i + 1 }}</td>
              <td class="px-2 py-1 text-left">{{ siswa.nama }}</td>
              <td class="px-2 py-1">{{ siswa.kelas }}</td>
              <td class="px-2 py-1">{{ siswa.kamar }}</td>
              <td v-for="(status, j) in siswa.absensi" :key="j" class="px-2 py-1">
                {{ status || '' }}
              </td>
              <td class="px-2 py-1">{{ siswa.count?.M || 0 }}</td>
              <td class="px-2 py-1">{{ siswa.count?.I || 0 }}</td>
              <td class="px-2 py-1">{{ siswa.count?.S || 0 }}</td>
              <td class="px-2 py-1">{{ siswa.count?.A || 0 }}</td>
              <td class="px-2 py-1">
                {{
                  siswa.absensi.length
                    ? Math.round(((siswa.count?.M || 0) / siswa.absensi.length) * 100)
                    : 0
                }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AbsensiChart
      v-if="rekap.length > 0"
      :tanggalList="tanggalList"
      :rekap="rekap"
      class="mb-6 w-full max-w-6xl"
    />

    <ToastMessage v-if="toast.message" :type="toast.type" :message="toast.message" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ToastMessage from '@/components/ToastMessage.vue'
import { classScriptUrls } from '@/config'
import { getTodayDateInputFormat } from '@/utils/date'
import AbsensiChart from '@/components/AbsensiChart.vue'
const router = useRouter()

// Ambil user login
const user = JSON.parse(localStorage.getItem('loginUser') || '{}')
if (!user || !user.kelas) {
  router.push('/login')
}
const isAdmin = user.role === 'admin'
const kelas = ref(user.kelas || '')
const tanggalAwal = ref(getTodayDateInputFormat())
const tanggalAkhir = ref(getTodayDateInputFormat())

const rekap = ref<
  {
    nama: string
    kelas: string
    kamar: string
    absensi: string[]
    count?: Record<string, number>
  }[]
>([])
const tanggalList = ref<string[]>([])
const loading = ref(false)

const toast = ref({
  message: '',
  type: 'info' as 'success' | 'error' | 'info',
})

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.value = { message, type }
  setTimeout(() => (toast.value.message = ''), 3000)
}

const appUrl = computed(() => {
  return classScriptUrls[kelas.value.trim().toUpperCase()] || ''
})

function formatDate(raw: string) {
  const date = new Date(raw)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

async function loadRekap() {
  const kelasTrimmed = kelas.value.trim()
  const start = tanggalAwal.value
  const end = tanggalAkhir.value

  if (!kelasTrimmed) return showToast('Mohon isi Kelas!', 'error')
  if (!start || !end) return showToast('Mohon isi tanggal awal dan akhir.', 'error')
  if (!appUrl.value)
    return showToast(`URL untuk kelas "${kelasTrimmed}" belum dikonfigurasi.`, 'error')

  const url = new URL(appUrl.value)
  url.searchParams.set('action', 'rekap')
  url.searchParams.set('kelas', kelasTrimmed)
  url.searchParams.set('start', start)
  url.searchParams.set('end', end)

  loading.value = true
  try {
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`Gagal fetch: ${res.status}`)

    const data = await res.json()
    if (data.status !== 'success') throw new Error(data.message || 'Gagal mengambil data.')

    rekap.value = (data.rekap || []).map(
      (item: { nama: string; kelas: string; absensi: string[] }) => {
        const count = { M: 0, I: 0, S: 0, A: 0 }
        item.absensi.forEach((s) => {
          if (count[s as keyof typeof count] !== undefined) count[s as keyof typeof count]++
        })
        return { ...item, count }
      },
    )

    tanggalList.value = data.tanggalList || []

    if (rekap.value.length === 0) showToast('Data rekap tidak ditemukan.', 'info')
  } catch (err) {
    showToast((err as Error).message, 'error')
  } finally {
    loading.value = false
  }
}

function set7HariTerakhir() {
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const past = new Date(today)
  past.setDate(today.getDate() - 6)
  tanggalAwal.value = past.toISOString().split('T')[0]
  tanggalAkhir.value = getTodayDateInputFormat()
  loadRekap()
}

function set14HariTerakhir() {
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const past = new Date(today)
  past.setDate(today.getDate() - 13)
  tanggalAwal.value = past.toISOString().split('T')[0]
  tanggalAkhir.value = getTodayDateInputFormat()
  loadRekap()
}

function setBulanIni() {
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  tanggalAwal.value = startOfMonth.toISOString().split('T')[0]
  tanggalAkhir.value = getTodayDateInputFormat()
  loadRekap()
}

function resetFilter() {
  const today = getTodayDateInputFormat()
  tanggalAwal.value = today
  tanggalAkhir.value = today
}
</script>

<style scoped>
@reference "tailwindcss";

.input {
  @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-green-200;
}
.btn-primary {
  @apply bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 transition;
}
.btn-secondary {
  @apply bg-gray-200 text-gray-700 py-1.5 px-4 rounded font-semibold hover:bg-gray-300 transition;
}
</style>
