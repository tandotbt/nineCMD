<script setup lang="ts">
import { useNotification } from 'naive-ui'
import { onMounted } from 'vue'

const notification = useNotification()

onMounted(() => {
  // Listen for messages from Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION') {
        notification.info({
          title: event.data.title,
          content: event.data.body,
          duration: 10000,
        })
      }
    })
  }
})
</script>

<template>
  <div style="display: none"></div>
</template>
