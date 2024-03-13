<template>
  <breadcrumbPage :pages="pages" />
  <n-gradient-text :size="24" type="info"> {{ t('page.arena.main') }} </n-gradient-text>
  <p>Chọn 1 mùa kèm agentAddress</p>
  <router-link
    :to="{
      name: 'arena-leaderboard-route',
      params: { agentAddress: '0x123' }
    }"
    >{{ t('page.arena.leaderboard') }}
  </router-link>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, markRaw } from 'vue'
import { HomeRound as HomeIcon, StadiumRound as ArenaIcon } from '@vicons/material'
import breadcrumbPage from '@/components/breadcrumbPage.vue'
const { t } = useI18n()
const pages = ref([
  { title: 'page.home', path: { name: 'home-route' }, icon: markRaw(HomeIcon) },
  { title: 'page.arena.main', path: { name: 'arena-route' }, icon: markRaw(ArenaIcon) }
])
</script>
