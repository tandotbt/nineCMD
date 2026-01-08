<script setup lang="ts">
defineProps<{
  threshold: number
  blockNow: number
  startBlockIndex: number | null
  labelThreshold: string
  placeholderThreshold: string
  suffixBlocks: string
  btnSaveText: string
  btnMarkerText: string
  infoCurrentBlock: string
  infoMarker: string
  infoRemaining: string
}>()

const emit = defineEmits<{
  (e: 'update:threshold', value: number): void
  (e: 'save'): void
  (e: 'set-marker'): void
}>()
</script>

<template>
  <n-form label-placement="top">
    <n-form-item :label="labelThreshold">
      <n-input-number
        :value="threshold"
        @update:value="(val: number | null) => emit('update:threshold', val || 1)"
        :min="1"
        :placeholder="placeholderThreshold"
        class="full-width"
      >
        <template #suffix> {{ suffixBlocks }} </template>
      </n-input-number>
    </n-form-item>

    <n-space vertical>
      <n-button type="primary" block @click="emit('save')"> {{ btnSaveText }} </n-button>
      <n-button block @click="emit('set-marker')">
        {{ btnMarkerText }}
      </n-button>
    </n-space>

    <div class="info-section">
      <n-text depth="3">
        {{ infoCurrentBlock }} <strong>{{ blockNow }}</strong>
      </n-text>
      <br />
      <n-text depth="3" v-if="startBlockIndex">
        {{ infoMarker }} <strong>{{ startBlockIndex }}</strong>
        {{ infoRemaining }}
      </n-text>
    </div>
  </n-form>
</template>

<style scoped>
.full-width {
  width: 100%;
}

.info-section {
  margin-top: 20px;
  padding: 12px;
  background-color: var(--n-color-embedded);
  border-radius: 8px;
}
</style>
