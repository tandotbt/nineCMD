<script setup lang="ts">
import { NFormItem, NInput, NButton } from 'naive-ui'

interface Props {
  label: string
  placeholder?: string
  modelValue: string
  loading?: boolean
  buttonText: string
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
}>()

function handleInput(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="login-input-group">
    <n-form-item :label="label">
      <n-input
        :value="modelValue"
        :placeholder="placeholder"
        @update:value="handleInput"
        @keyup.enter="$emit('submit')"
      >
        <template #prefix>
          <slot name="prefix"></slot>
        </template>
      </n-input>
    </n-form-item>
    <n-button type="primary" block :loading="loading" @click="$emit('submit')">
      {{ buttonText }}
      <template #icon>
        <slot name="button-icon"></slot>
      </template>
    </n-button>
  </div>
</template>

<style scoped>
.login-input-group {
  padding: 16px 0;
}
</style>
