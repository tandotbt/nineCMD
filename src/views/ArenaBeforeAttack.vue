<template>
  <breadcrumbPage :pages="pages" />
  <n-gradient-text :size="24" type="info"> {{ t('page.arena.attack') }} </n-gradient-text>
  <p>{{ $route.params }}</p>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, markRaw } from 'vue'
import {
  HomeRound as HomeIcon,
  StadiumRound as ArenaIcon,
  LeaderboardRound as LeaderboardIcon,
  NumbersRound as AttackIcon
} from '@vicons/material'
import breadcrumbPage from '@/components/other/breadcrumbPage.vue'
const { t } = useI18n()
const pages = ref([
  { title: 'page.home', path: { name: 'home-route' }, icon: markRaw(HomeIcon) },
  { title: 'page.arena.main', path: { name: 'arena-route' }, icon: markRaw(ArenaIcon) },
  {
    title: 'page.arena.leaderboard',
    path: {
      name: 'arena-leaderboard-route',
      params: { agentAddress: '0x123Home' }
    },
    icon: markRaw(LeaderboardIcon)
  },
  {
    title: 'page.arena.attack',
    path: {
      name: 'arena-before-attack-route',
      params: {
        agentAddress: '0x123Home',
        agentEmeny: '0x999'
      }
    },
    icon: markRaw(AttackIcon)
  }
])
</script>
