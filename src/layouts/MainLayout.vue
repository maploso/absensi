<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <!-- Header (optional) -->
    <!-- <AppHeader /> -->

    <main class="flex-grow">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppFooter from '@/components/AppFooter.vue'
// import AppHeader from '@/components/AppHeader.vue'
</script>
