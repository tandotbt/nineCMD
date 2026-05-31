<template>
  <router-link :to="{ name: 'login' }">
    <n-avatar
      round
      :size="48"
      :src="avatarSrc"
      style="margin: 2vh 1vh"
    >
      {{ initials }}
    </n-avatar>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NAvatar } from 'naive-ui'

const props = defineProps<{
  avatarAddress?: string
  portraitId?: number
  level?: number
}>()

const avatarSrc = computed(() => {
  return ''
})

const initials = computed(() => {
  return (props.level ?? 0) > 0 ? `Lv${props.level}` : '?'
})
</script>
