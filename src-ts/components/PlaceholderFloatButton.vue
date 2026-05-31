<template>
  <n-float-button :right="10" :bottom="10" position="fixed" type="primary" menu-trigger="hover">
    <n-icon>
      <ListIcon />
    </n-icon>
    <template #menu>
      <n-float-button shape="circle" type="default">
        <n-icon :component="HomeIcon" />
      </n-float-button>
    </template>
  </n-float-button>
</template>

<script setup lang="ts">
import { NFloatButton, NIcon } from 'naive-ui'
import {
  FormatListBulletedRound as ListIcon,
  HomeRound as HomeIcon
} from '@vicons/material'
</script>
