<template>
  <span>
    #{{ blockNow }}
    <n-divider vertical />
    {{ avgBlockNow }}s
    <n-divider vertical />
    {{ avgTransNow }} trans
    <n-divider vertical />
    {{ selectedPlanet }}
  </span>
  <!-- <h1>Fetch {{ isFetching }} chọn {{ selectedPlanet }}</h1>
    <p>Data config: {{ dataConfig }}</p> -->
</template>

<script>
import { useWebSocketBlockStore } from '@/stores/webSocketBlock'
import { computed, watch } from 'vue'
import { useConfigURLStore } from '@/stores/configURL'
import { useLoadingBar } from 'naive-ui'

export default {
  setup() {
    const webSocketBlockStore = useWebSocketBlockStore()
    const configURLStore = useConfigURLStore()
    const loadingBar = useLoadingBar()
    const isFetching = computed(() => configURLStore.isFetching)
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
      blockNow: computed(() => webSocketBlockStore.calculateAVG.blockNow),
      avgBlockNow: computed(() => webSocketBlockStore.calculateAVG.avgBlockNow),
      avgTransNow: computed(() => webSocketBlockStore.calculateAVG.avgTransNow),
      selectedPlanet: computed(() => configURLStore.selectedPlanet)
    }
  }
}
</script>
