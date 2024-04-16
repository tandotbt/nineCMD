<template>
  <n-breadcrumb>
    <n-breadcrumb-item
      v-for="page in pages"
      :key="page.title"
      @click="showOption(`go-${page.path.name}`)"
    >
      <router-link :to="page.path">
        <n-icon :component="page.icon" /> {{ t(page.title) }}
      </router-link>
    </n-breadcrumb-item>
  </n-breadcrumb>
</template>
<script>
import { useI18n } from 'vue-i18n'
import { useHandlerMenuLeftStore } from '@/stores/handlerMenuLeft'

export default {
  props: {
    pages: {
      type: Array,
      required: true
    }
  },
  setup() {
    const { t } = useI18n()
    const useHandlerMenuLeft = useHandlerMenuLeftStore()
    const showOption = useHandlerMenuLeft.showOption

    return { t, showOption }
  }
}
</script>
