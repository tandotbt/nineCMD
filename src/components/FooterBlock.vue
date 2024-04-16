<template>
  <infoBlock />
  <n-divider vertical />
  <ManageUseNode />
</template>

<script>
import ManageUseNode from './ManageUseNode.vue'
import infoBlock from './other/infoBlock.vue'
export default {
  components: {
    ManageUseNode,
    infoBlock
  }
}
</script>
