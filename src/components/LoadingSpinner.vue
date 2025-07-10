<template>
  <svg
    class="spinner align-middle"
    :width="size"
    :height="size"
    viewBox="0 0 50 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" :stroke="color" />
  </svg>
</template>

<script setup lang="ts">
const { size, color } = withDefaults(
  defineProps<{
    size?: number
    color?: string
  }>(),
  {
    size: 20,
    color: '#ffffff', // default: putih
  },
)
</script>

<style scoped>
.spinner {
  display: inline-block;
  vertical-align: middle;
  animation: rotate 1s linear infinite;
}
.path {
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}
@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}
@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
