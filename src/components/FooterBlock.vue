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
import { computed, watchEffect } from 'vue'
import { useConfigURLStore } from '@/stores/configURL'
import { useLoadingBar } from 'naive-ui'

export default {
  setup() {
    const webSocketBlockStore = useWebSocketBlockStore()
    const configURLStore = useConfigURLStore()
    const loadingBar = useLoadingBar()
    const isFetching = computed(() => configURLStore.isFetching)
    // Hàm xử lý hiển thị loadingBar
    const handleLoadingBar = () => {
      if (isFetching.value) {
        loadingBar.start()
      } else {
        loadingBar.finish()
      }
    }

    // Watch effect để theo dõi thay đổi trong configURLStore.isFetching và chạy handleLoadingBar tương ứng
    watchEffect(() => {
      handleLoadingBar()
    })

    return {
      blockNow: computed(() => webSocketBlockStore.calculateAVG.blockNow),
      avgBlockNow: computed(() => webSocketBlockStore.calculateAVG.avgBlockNow),
      avgTransNow: computed(() => webSocketBlockStore.calculateAVG.avgTransNow),
      // dataConfig: computed(() => configURLStore.dataConfig),
      // isFetching,
      selectedPlanet: computed(() => configURLStore.selectedPlanet)
    }
  }
}
</script>
