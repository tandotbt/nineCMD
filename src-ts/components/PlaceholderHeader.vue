<template>
  <n-grid cols="24" item-responsive responsive="screen">
    <!-- Avatar section -->
    <n-grid-item span="1 m:1 l:1" style="height: 10vh">
      <HeaderAvatar />
    </n-grid-item>

    <!-- Name section -->
    <n-grid-item
      offset="0 m:0 l:0"
      span="1 m:1 l:1"
      style="
        height: 10vh;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        position: absolute;
        margin-left: 70px;
      "
    >
      <n-text depth="3" style="font-size: 12px">Guest #0000</n-text>
    </n-grid-item>

    <!-- Block refill AP progress -->
    <n-grid-item offset="7 m:7 l:8" span="7 m:6 l:4" style="padding: 3vh">
      <HeaderProgress :item="blockRefillProgress" />
    </n-grid-item>

    <!-- AP progress -->
    <n-grid-item offset="0 m:0 l:0" span="7 m:6 l:4" style="padding: 3vh">
      <HeaderProgress :item="apProgress" />
    </n-grid-item>

    <!-- Arena season progress -->
    <n-grid-item offset="0 m:0 l:0" span="5 m:4 l:3" style="padding: 3vh">
      <HeaderProgress :item="arenaProgress" />
    </n-grid-item>

    <!-- Banner carousel -->
    <n-grid-item offset="0 m:0 l:0" span="8 m:9 l:9" style="padding: 3vh">
      <HeaderBanner :banners="banners" />
    </n-grid-item>

    <!-- Currency / info placeholder -->
    <n-grid-item offset="0 m:0 l:0" span="3 m:3 l:5" style="padding: 3vh">
      <n-space align="center" justify="end">
        <n-text depth="3" style="font-size: 11px">NCG: 0</n-text>
      </n-space>
    </n-grid-item>
  </n-grid>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { NGrid, NGridItem, NText, NSpace } from 'naive-ui'
import HeaderAvatar from '@/components/header/HeaderAvatar.vue'
import HeaderProgress from '@/components/header/HeaderProgress.vue'
import HeaderBanner from '@/components/header/HeaderBanner.vue'
import type { HeaderProgressItem, HeaderBannerItem } from '../types/header'

// Placeholder progress items
const blockRefillProgress = reactive<HeaderProgressItem>({
  label: 'Block Refill AP',
  percentage: 50,
  text: '--:--:--',
  processing: false
})

const apProgress = reactive<HeaderProgressItem>({
  label: 'Action Point',
  percentage: 50,
  text: '0/999',
  processing: false
})

const arenaProgress = reactive<HeaderProgressItem>({
  label: 'Arena Season',
  percentage: 30,
  text: '--:--',
  processing: true
})

// Placeholder banners
const banners = ref<HeaderBannerItem[]>([])
</script>
