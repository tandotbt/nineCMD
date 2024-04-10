<template>
  <infoBlock />
  <n-divider vertical />
  <manageUseNode />
</template>

<script>
import manageUseNode from './manageUseNode.vue'
import infoBlock from './infoBlock.vue'
export default {
  components: {
    manageUseNode,
    infoBlock
  }
}
</script>
