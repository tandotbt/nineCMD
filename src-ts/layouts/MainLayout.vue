<template>
  <n-layout style="height: 100vh">
    <!-- Header -->
    <n-layout-header
      bordered
      style="height: 10vh; padding: 0vh"
      :inverted="false"
      position="absolute"
    >
      <PlaceholderHeader />
    </n-layout-header>

    <!-- Content area with Sider -->
    <n-layout position="absolute" style="top: 10vh; bottom: 10vh" has-sider>
      <!-- Sidebar -->
      <n-layout-sider
        ref="menuLeftRef"
        bordered
        show-trigger="bar"
        collapse-mode="width"
        position="absolute"
        :collapsed-width="0"
        :width="300"
        :native-scrollbar="false"
        :inverted="false"
        style="max-height: 80vh"
        :collapsed="collapsed"
        @collapse="collapsed = true"
        @expand="collapsed = false"
      >
        <PlaceholderMenuLeft @themeChange="onThemeChange" />
      </n-layout-sider>

      <!-- Main content -->
      <n-layout style="max-height: 80vh">
        <n-scrollbar :style="{ 'z-index': 0 }">
          <router-view v-slot="{ Component, route }">
            <Transition :name="(route.meta.transition as string) || 'fade'" mode="out-in">
              <div :key="route.name as string">
                <component :is="Component" />
              </div>
            </Transition>
          </router-view>
        </n-scrollbar>
      </n-layout>
    </n-layout>

    <!-- Footer -->
    <n-layout-footer
      bordered
      style="height: 10vh; padding: 3vh"
      :inverted="false"
      position="absolute"
    >
      <PlaceholderFooter />
    </n-layout-footer>

    <!-- Float Button -->
    <PlaceholderFloatButton />
  </n-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import {
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NLayoutFooter,
  NScrollbar
} from 'naive-ui'
import PlaceholderHeader from '@/components/PlaceholderHeader.vue'
import PlaceholderMenuLeft from '@/components/PlaceholderMenuLeft.vue'
import PlaceholderFooter from '@/components/PlaceholderFooter.vue'
import PlaceholderFloatButton from '@/components/PlaceholderFloatButton.vue'

const emit = defineEmits<{
  'themeChange': [isDark: boolean]
}>()

// Sidebar collapse state
const collapsed = ref<boolean>(true)
const menuLeftRef = ref<HTMLElement | null>(null)

// Close sidebar when clicking outside
onClickOutside(menuLeftRef, () => {
  collapsed.value = true
})

function onThemeChange(isDark: boolean): void {
  emit('themeChange', isDark)
}
</script>
