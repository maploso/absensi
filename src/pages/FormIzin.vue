<template>
  <div class="max-w-xl mx-auto py-6 space-y-4">
    <h2 class="text-xl font-bold">Form Input Izin</h2>

    <div class="grid gap-4">
      <!-- Kelas -->
      <div>
        <label class="block font-semibold mb-1">Kelas</label>
        <select v-model="form.kelas" class="input" :disabled="isFormDisabled">
          <option v-for="k in availableClasses" :key="k" :value="k">{{ k }}</option>
        </select>
      </div>

      <!-- Nomor -->
      <div>
        <label class="block font-semibold mb-1">Nomor Mahasantri</label>
        <input v-model="form.no" type="text" class="input" :disabled="isFormDisabled" />
      </div>

      <!-- Nama -->
      <div>
        <label class="block font-semibold mb-1">Nama</label>
        <div class="relative min-h-[2.5rem] rounded border px-3 py-2 bg-gray-100 flex items-center">
          <span class="text-gray-800 font-medium">
            {{ form.nama || '—' }}
          </span>
          <LoadingSpinner v-if="loadingNama" :size="20" color="#16a34a" class="ml-2" />
        </div>
      </div>

      <!-- Tanggal -->
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-semibold mb-1">Tanggal Mulai</label>
          <input v-model="form.dari" type="date" class="input" :disabled="isFormDisabled" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Tanggal Sampai</label>
          <input v-model="form.sampai" type="date" class="input" :disabled="isFormDisabled" />
        </div>
      </div>

      <!-- Keterangan -->
      <div>
        <label class="block font-semibold mb-1">Keterangan</label>
        <input v-model="form.keterangan" type="text" class="input" :disabled="isFormDisabled" />
      </div>

      <!-- Tombol -->
      <button
        @click="submitIzin"
        :disabled="isSubmitDisabled || isFormDisabled || loading || loadingNama"
        class="btn-success w-full flex items-center justify-center"
      >
        <LoadingSpinner v-if="loading" class="mr-2" />
        <span>{{ loading ? 'Mengirim...' : 'Kirim' }}</span>
      </button>
    </div>

    <ToastMessage v-if="toast.message" :type="toast.type" :message="toast.message" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { classScriptUrls, availableClasses } from '@/config'
import ToastMessage from '@/components/ToastMessage.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { getTodayDateInputFormat } from '@/utils/date'
import { debounce } from '@/utils/debounce'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('loginUser') || '{}')

if (!user || user.role !== 'admin') {
  router.push('/login')
}

const form = ref({
  kelas: '',
  no: '',
  nama: '',
  dari: '',
  sampai: '',
  keterangan: '',
})

const toast = ref({ message: '', type: 'success' as 'success' | 'error' | 'info' })
const loading = ref(false)
const loadingNama = ref(false)

onMounted(() => {
  form.value.dari = getTodayDateInputFormat()
})
const isFormDisabled = computed(() => loading.value)

const isSubmitDisabled = computed(() => {
  return (
    loading.value ||
    loadingNama.value ||
    !form.value.kelas ||
    !form.value.no ||
    !form.value.dari ||
    !form.value.sampai ||
    !form.value.nama ||
    !form.value.keterangan.trim()
  )
})

function showToast(msg: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.value = { message: msg, type }
  setTimeout(() => (toast.value.message = ''), 3000)
}

function resetForm() {
  form.value = {
    kelas: '',
    no: '',
    nama: '',
    dari: getTodayDateInputFormat(),
    sampai: '',
    keterangan: '',
  }
}

let currentRequestId = 0

const fetchNamaMahasantri = debounce(async () => {
  const requestId = ++currentRequestId
  const { kelas, no } = form.value
  if (!kelas || !no) {
    form.value.nama = ''
    return
  }

  const url = classScriptUrls[kelas]
  if (!url) return

  loadingNama.value = true
  try {
    const res = await fetch(`${url}?action=cariMahasantri&kelas=${kelas}&no=${no}`)
    const result = await res.json()

    if (requestId !== currentRequestId) return

    form.value.nama = result.status === 'success' ? result.data.nama : ''
  } catch {
    if (requestId === currentRequestId) {
      form.value.nama = ''
    }
  } finally {
    if (requestId === currentRequestId) {
      loadingNama.value = false
    }
  }
}, 400)

watch(
  () => [form.value.kelas, form.value.no],
  () => {
    fetchNamaMahasantri()
  },
)

watch(
  () => [form.value.dari, form.value.sampai],
  ([dari, sampai]) => {
    if (!dari || !sampai) return

    const dariDate = new Date(dari)
    const sampaiDate = new Date(sampai)

    if (sampaiDate < dariDate) {
      showToast('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.', 'error')
    }
  },
)

async function submitIzin() {
  if (isSubmitDisabled.value) return

  const dariDate = new Date(form.value.dari)
  const sampaiDate = new Date(form.value.sampai)
  if (sampaiDate < dariDate) {
    return showToast('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.', 'error')
  }

  const url = classScriptUrls[form.value.kelas]
  if (!url) return showToast(`URL kelas ${form.value.kelas} belum dikonfigurasi.`, 'error')

  loading.value = true
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'tambahIzin',
        data: {
          kelas: form.value.kelas,
          no: form.value.no,
          nama: form.value.nama,
          dari: form.value.dari,
          sampai: form.value.sampai,
          keterangan: form.value.keterangan,
        },
      }),
    })

    const result = await res.json()
    if (result.status === 'success') {
      showToast('Izin berhasil ditambahkan.', 'success')
      resetForm()
    } else {
      showToast(result.message || 'Gagal menambahkan izin.', 'error')
    }
  } catch (err) {
    showToast(`Error: ${String(err)}`, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.input {
  @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-green-200;
}
.btn-success {
  @apply bg-green-600 text-white py-2 px-4 rounded font-semibold transition;
}
.btn-success:hover:enabled {
  @apply bg-green-700;
}
.btn-success:disabled {
  @apply bg-red-700 cursor-not-allowed;
}
</style>
