<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  data: string
}>()

const { t } = useI18n()
</script>

<template>
  <n-card :title="t('planet_raw_data')" size="small">
    <div class="raw-data-container">
      <pre class="raw-data-content"><code>{{ data }}</code></pre>
    </div>
  </n-card>
</template>

<style scoped>
.raw-data-container {
  background-color: rgba(128, 128, 128, 0.05);
  padding: 12px;
  border-radius: 4px;
  max-height: 400px;
  overflow: auto;
}

.raw-data-content {
  margin: 0;
  font-family:
    v-mono, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
