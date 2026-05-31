<template>
  <n-space align="center" justify="center">
    <FooterInfoBlock />
    <n-divider vertical />
    <FooterNodeManager />
  </n-space>
</template>

<script setup lang="ts">
import { NSpace, NDivider } from 'naive-ui'
import FooterInfoBlock from '@/components/footer/FooterInfoBlock.vue'
import FooterNodeManager from '@/components/footer/FooterNodeManager.vue'
</script>
