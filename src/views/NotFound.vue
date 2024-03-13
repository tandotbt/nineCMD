<template>
  <breadcrumbPage :pages="pages" />
  <n-result status="404" :title="t('page.notFound')" :description="t('page-notFound.detail')">
    <template #icon> <aloneIcon /></template>
    <template #footer>
      <router-link :to="{ name: 'home-route' }">
        <n-button @click="showOption('go-home-route')">{{ t('page.home') }}</n-button>
      </router-link>
    </template>
  </n-result>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import breadcrumbPage from '@/components/breadcrumbPage.vue'
import { ref, markRaw } from 'vue'
import { HomeRound as HomeIcon, WarningAmberRound as NotFoundIcon } from '@vicons/material'
import aloneIcon from '@/components/icons/aloneIcon.vue'
const { t } = useI18n()
const pages = ref([
  { title: 'page.home', path: { name: 'home-route' }, icon: markRaw(HomeIcon) },
  { title: 'page.notFound', path: { name: 'not-found-route' }, icon: markRaw(NotFoundIcon) }
])
import { useHandlerMenuLeft } from '@/stores/handlerMenuLeft'

const handlerMenuLeft = useHandlerMenuLeft()
const showOption = handlerMenuLeft.showOption
</script>
