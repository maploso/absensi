<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 class="text-xl font-bold mb-4 text-center text-gray-700">Login</h2>

      <div class="space-y-4">
        <input v-model="username" type="text" placeholder="Username" class="input" />
        <input v-model="password" type="password" placeholder="Password" class="input" />

        <button
          @click="handleLogin"
          :disabled="loading"
          class="btn-main w-full flex items-center justify-center"
        >
          <span v-if="loading" class="loader mr-2"></span>
          <span>{{ loading ? 'Memproses...' : '🔐 Masuk' }}</span>
        </button>

        <p v-if="error" class="text-red-500 text-sm text-center mt-2">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginEndpoint } from '@/config'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const hashed = await hashPassword(password.value)

    const res = await fetch(`${loginEndpoint}?username=${username.value}&password=${hashed}`)
    const data = await res.json()

    if (data.status === 'success') {
      localStorage.setItem(
        'loginUser',
        JSON.stringify({
          username: username.value,
          nama: data.nama,
          kelas: data.kelas,
        }),
      )
      router.push('/')
    } else {
      error.value = data.message || 'Login gagal'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Terjadi kesalahan saat login.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.input {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400;
}
.btn-main {
  @apply bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition;
}
.loader {
  @apply inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin;
}
</style>
