<template>
  #{{ blockNow }}
  <n-divider vertical />
  {{ avgBlockNow }}s
  <n-divider vertical />
  {{ avgTransNow }}
  <n-divider vertical />
  {{ selectedPlanet }}
</template>

<script>
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
import { useWebSocketBlockStore } from '@/stores/webSocketBlock'
import { computed, watch } from 'vue'
import { useConfigURLStore } from '@/stores/configURL'
import { useLoadingBar } from 'naive-ui'
import { useI18n } from 'vue-i18n'
export default {
  setup() {
    const { n } = useI18n()
    const useFetchDataUser9C = useFetchDataUser9CStore()
    const webSocketBlockStore = useWebSocketBlockStore()
    const configURLStore = useConfigURLStore()
    const loadingBar = useLoadingBar()
    const isFetching = computed(
      () => configURLStore.isFetching || useFetchDataUser9C.isFetchingDataUser9C
    )
    const hasError = computed(() => configURLStore.hasError)
    // Hàm xử lý hiển thị loadingBar
    // eslint-disable-next-line no-unused-vars
    watch(isFetching, (newValue, oldValue) => {
      if (newValue) {
        loadingBar.start()
      } else if (hasError.value) {
        loadingBar.error()
      } else {
        loadingBar.finish()
      }
    })
    return {
      blockNow: computed(() => n(webSocketBlockStore.calculateAVG.blockNow, 'decimal')),
      avgBlockNow: computed(() => n(webSocketBlockStore.calculateAVG.avgBlockNow, 'decimal')),
      avgTransNow: computed(() => n(webSocketBlockStore.calculateAVG.avgTransNow, 'decimal')),
      selectedPlanet: computed(() => configURLStore.selectedPlanet)
    }
  }
}
</script>
