<template>
  <breadcrumbPage :pages="pages" />
  <n-gradient-text :size="24" type="info"> {{ t('page.shop') }} </n-gradient-text>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, markRaw } from 'vue'
import { HomeRound as HomeIcon, ShoppingCartFilled as ShopIcon } from '@vicons/material'
import breadcrumbPage from '@/components/other/breadcrumbPage.vue'
const { t } = useI18n()
const pages = ref([
  { title: 'page.home', path: { name: 'home-route' }, icon: markRaw(HomeIcon) },
  { title: 'page.shop', path: { name: 'shop-route' }, icon: markRaw(ShopIcon) }
])
</script>
<style scoped></style>
