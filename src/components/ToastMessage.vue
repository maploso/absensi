<!-- src/components/ToastMessage.vue -->
<template>
  <div
    class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white animate-fade-in-up"
    :class="{
      'bg-green-600': type === 'success',
      'bg-red-600': type === 'error',
      'bg-blue-600': type === 'info',
    }"
  >
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: 'success' | 'error' | 'info'
  message: string
}>()
</script>

<style scoped>
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(10px) translateX(-50%);
  }
  100% {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}
</style>
