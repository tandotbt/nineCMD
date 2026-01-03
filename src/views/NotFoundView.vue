<template>
  <div class="not-found">
    <n-result
      status="404"
      :title="t('notfound_title')"
      :description="t('notfound_text')"
      size="huge"
    >
      <template #footer>
        <n-button type="primary" @click="router.push('/')">
          {{ t('notfound_btn_back') }}
        </n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
}

h1 {
  font-size: 72px;
  margin: 0;
  color: #f44336;
}

p {
  font-size: 20px;
  color: #666;
}

.back-home {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.back-home:hover {
  background-color: #1976d2;
}
</style>
