<template>
  <div>
    <!-- Input Form -->
    <div class="space-y-4 mb-6">
      <div>
        <label class="block font-semibold mb-1">Kelas</label>
        <input :value="kelas" class="input bg-gray-100" disabled />
      </div>

      <div>
        <label class="block font-semibold mb-1">Tanggal</label>
        <input v-model="tanggal" type="date" class="input" />
      </div>

      <button
        @click="loadSiswa"
        :disabled="loading || submitting"
        class="btn-warning w-full flex items-center justify-center"
      >
        <LoadingSpinner v-if="loading" class="mr-2" />
        Muat Mahasantri
      </button>
    </div>

    <!-- Table -->
    <form v-if="showForm" @submit.prevent="submitAbsen">
      <div class="overflow-x-auto mb-4 max-h-[70vh]">
        <table class="table-auto min-w-full border text-center text-sm">
          <thead class="bg-gray-100 sticky top-0 z-10 shadow text-sm">
            <tr>
              <th class="px-2">No</th>
              <th class="px-2">Kamar</th>
              <th class="px-2">Nama</th>
              <th class="px-2">M</th>
              <th class="px-2">I</th>
              <th class="px-2">S</th>
              <th class="px-2">A</th>
              <th class="px-2">Jam</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(siswa, i) in siswaList"
              :key="i"
              class="border-b hover:bg-gray-50 transition"
              :class="{
                'bg-green-100': absensi[i].status === 'M',
                'bg-yellow-100': absensi[i].status === 'I',
                'bg-blue-100': absensi[i].status === 'S',
                'bg-red-100': absensi[i].status === 'A',
              }"
            >
              <td class="px-2">{{ i + 1 }}</td>
              <td class="text-left px-2">{{ siswa.kamar }}</td>
              <td class="text-left px-2">
                {{ siswa.nama }}
                <span v-if="absensi[i].readonly" class="text-xs text-yellow-600 italic">
                  (izin majek)</span
                >
              </td>
              <td class="px-1">
                <input
                  type="radio"
                  :name="`status-${i}`"
                  value="M"
                  v-model="absensi[i].status"
                  @change="setJam(i)"
                  :disabled="submitting || absensi[i].readonly"
                />
              </td>
              <td class="px-1">
                <input
                  type="radio"
                  :name="`status-${i}`"
                  value="I"
                  v-model="absensi[i].status"
                  @change="setJam(i)"
                  :disabled="submitting || absensi[i].readonly"
                />
              </td>
              <td class="px-1">
                <input
                  type="radio"
                  :name="`status-${i}`"
                  value="S"
                  v-model="absensi[i].status"
                  @change="setJam(i)"
                  :disabled="submitting || absensi[i].readonly"
                />
              </td>
              <td class="px-1">
                <input
                  type="radio"
                  :name="`status-${i}`"
                  value="A"
                  v-model="absensi[i].status"
                  @change="setJam(i)"
                  :disabled="submitting || absensi[i].readonly"
                />
              </td>
              <td class="px-2">{{ absensi[i].jam }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 px-4 py-3 bg-gray-100 rounded-md shadow text-sm text-gray-700 space-y-1">
        <div class="font-medium">
          Total Mahasantri: <span class="font-bold text-gray-900">{{ siswaList.length }}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div class="text-green-700">✔️ Hadir: {{ count('M') }}</div>
          <div class="text-yellow-700">🟡 Izin: {{ count('I') }}</div>
          <div class="text-blue-700">🔵 Sakit: {{ count('S') }}</div>
          <div class="text-red-700">❌ Alpha: {{ count('A') }}</div>
        </div>
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="btn-success w-full flex items-center justify-center mt-4"
      >
        <LoadingSpinner v-if="submitting" class="mr-2" />
        <span v-if="submitting">Mengirim... ({{ uploadProgress }}%)</span>
        <span v-else>Kirim Absensi</span>
      </button>
    </form>

    <!-- Toast -->
    <ToastMessage v-if="toast.message" :type="toast.type" :message="toast.message" />
  </div>
</template>

<script setup lang="ts">
import type { Absensi, Siswa } from '@/types/attendance'
import { getTodayDateInputFormat } from '@/utils/date'
import { classScriptUrls } from '@/config'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ToastMessage from '@/components/ToastMessage.vue'

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tanggal = ref(getTodayDateInputFormat())

const siswaList = ref<Siswa[]>([])
const absensi = ref<Absensi[]>([])
const showForm = ref(false)
const loading = ref(false)
const submitting = ref(false)
const uploadProgress = ref(0)

const toast = ref({
  message: '',
  type: 'success' as 'success' | 'error' | 'info',
})

const user = JSON.parse(localStorage.getItem('loginUser') || '{}')
const kelas = ref(user.kelas || '')

if (!user || !user.kelas) {
  router.push('/login')
}

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.value = { message, type }
  setTimeout(() => (toast.value.message = ''), 3000)
}

function getAppUrl(): string | null {
  return classScriptUrls[kelas.value.trim().toUpperCase()] || null
}

function setJam(index: number) {
  const now = new Date()
  absensi.value[index].jam = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatJam(raw: string | undefined) {
  if (!raw) return '-'
  const date = new Date(raw)
  // Jika invalid date, langsung return raw
  if (isNaN(date.getTime())) return raw
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function count(status: 'M' | 'I' | 'S' | 'A') {
  return absensi.value.filter((a) => a.status === status).length
}

async function loadSiswa() {
  if (!kelas.value.trim()) return showToast('Mohon isi Kelas!', 'error')
  if (!tanggal.value) return showToast('Mohon isi Tanggal!', 'error')

  const appUrl = getAppUrl()
  if (!appUrl) return showToast(`URL untuk kelas "${kelas.value}" belum dikonfigurasi.`, 'error')

  loading.value = true
  showForm.value = false

  try {
    const res = await fetch(
      `${appUrl}?action=absensi&kelas=${encodeURIComponent(kelas.value)}&tanggal=${encodeURIComponent(tanggal.value)}`,
    )
    if (!res.ok) throw new Error('Gagal mengambil data siswa.')

    const data = await res.json()
    const siswaData: Siswa[] = data.siswa || []
    const absensiData = (data.absensi || []) as {
      no: string
      status: string
      jam: string
      tanggal: string
    }[]

    siswaList.value = siswaData

    if (siswaList.value.length === 0) return showToast('Data siswa tidak ditemukan.', 'info')

    const absensiList: Absensi[] = absensiData.map((a) => ({
      no: a.no,
      nama: '',
      status: a.status as Absensi['status'],
      jam: formatJam(a.jam),
    }))

    absensi.value = siswaList.value.map((siswa) => {
      const found = absensiList.find((a) => a.no === siswa.no)
      const status = found?.status ?? 'A'
      const jam = found?.jam ?? '-'
      return {
        no: siswa.no,
        nama: siswa.nama,
        kamar: siswa.kamar,
        status,
        jam,
        readonly: status === 'I' && jam === '-', // ← ini untuk booking izin
      }
    })

    showForm.value = true
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    showToast(`Error: ${message}`, 'error')
  } finally {
    loading.value = false
  }
}

async function submitAbsen() {
  if (!kelas.value.trim()) return showToast('Mohon isi Kelas!', 'error')
  if (!tanggal.value) return showToast('Mohon isi Tanggal!', 'error')
  if (absensi.value.length === 0) return showToast('Tidak ada data absensi untuk dikirim.', 'error')

  const appUrl = getAppUrl()
  if (!appUrl) return showToast(`URL untuk kelas "${kelas.value}" belum dikonfigurasi.`, 'error')

  submitting.value = true
  uploadProgress.value = 0

  try {
    // Simulasikan progres (karena fetch tidak support native progress)
    const interval = setInterval(() => {
      if (uploadProgress.value < 90) uploadProgress.value += 10
    }, 150)

    const res = await fetch(appUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        kelas: kelas.value,
        tanggal: tanggal.value,
        absensi: absensi.value,
      }),
    })

    clearInterval(interval)
    uploadProgress.value = 100

    const data = await res.json()

    if (data.status === 'success') {
      showToast('Absensi berhasil dikirim.', 'success')
      resetForm()
    } else {
      throw new Error(data.message || 'Gagal mengirim absensi.')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    showToast(`Error: ${message}`, 'error')
  } finally {
    submitting.value = false
    setTimeout(() => (uploadProgress.value = 0), 1000)
  }
}

function resetForm() {
  showForm.value = false
  siswaList.value = []
  absensi.value = []
  tanggal.value = getTodayDateInputFormat()
}
</script>

<style scoped>
@reference "tailwindcss";

.input {
  @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-green-200;
}
.btn-warning {
  @apply bg-yellow-500 text-white py-2 px-4 rounded font-semibold hover:bg-yellow-600 transition;
}
.btn-success {
  @apply bg-green-600 text-white py-2 px-4 rounded font-semibold hover:bg-green-700 transition;
}
</style>
