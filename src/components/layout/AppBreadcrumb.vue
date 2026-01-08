<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Home24Regular as HomeIcon,
  Box24Regular as BlocksIcon,
  Settings24Regular as SettingsIcon,
  Earth24Regular as PlanetIcon,
  ChevronRight24Regular as SeparatorIcon,
  Database24Regular as DataIcon,
  Link24Regular as ApiIcon,
} from '@vicons/fluent'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

interface BreadcrumbItem {
  label: string
  key: string
  icon?: Component
  path?: string
}

const breadcrumbItems = computed(() => {
  const items: BreadcrumbItem[] = [
    {
      label: t('breadcrumb_home'),
      key: 'home',
      path: '/',
      icon: HomeIcon,
    },
  ]

  const pathSegments = route.path.split('/').filter(Boolean)

  if (pathSegments.includes('blocks')) {
    items.push({
      label: t('breadcrumb_blocks'),
      key: 'blocks',
      path: '/blocks',
      icon: BlocksIcon,
    })
  }

  if (pathSegments.includes('settings')) {
    items.push({
      label: t('breadcrumb_settings'),
      key: 'settings',
      icon: SettingsIcon,
    })

    if (pathSegments.includes('planets')) {
      items.push({
        label: t('breadcrumb_planets'),
        key: 'planets',
        path: '/settings/planets',
        icon: PlanetIcon,
      })
    }

    if (pathSegments.includes('apis')) {
      items.push({
        label: t('breadcrumb_apis'),
        key: 'apis',
        path: '/settings/apis',
        icon: ApiIcon,
      })
    }
  }

  if (pathSegments.includes('data-explorer')) {
    items.push({
      label: t('csv_explorer_title'),
      key: 'csv-explorer',
      path: '/data-explorer',
      icon: DataIcon,
    })
  }

  return items
})

const handleLink = (path?: string) => {
  if (path && route.path !== path) {
    router.push(path)
  }
}
</script>

<template>
  <n-breadcrumb class="app-breadcrumb" :separator="'>'">
    <template #separator>
      <n-icon :component="SeparatorIcon" size="14" />
    </template>
    <n-breadcrumb-item
      v-for="item in breadcrumbItems"
      :key="item.key"
      @click="handleLink(item.path)"
    >
      <div class="breadcrumb-item-content">
        <n-icon v-if="item.icon" :component="item.icon" class="item-icon" />
        <span class="item-label">{{ item.label }}</span>
      </div>
    </n-breadcrumb-item>
  </n-breadcrumb>
</template>

<style scoped>
.app-breadcrumb {
  margin-bottom: 20px;
  padding: 8px 12px;
  background-color: rgba(128, 128, 128, 0.05);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
}

.breadcrumb-item-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.breadcrumb-item-content:hover {
  background-color: rgba(128, 128, 128, 0.15);
  transform: translateY(-1px);
}

.item-icon {
  font-size: 18px;
  opacity: 0.8;
}

.item-label {
  font-weight: 500;
  font-size: 0.95rem;
}

:deep(.n-breadcrumb-item__separator) {
  margin: 0 4px;
  display: flex;
  align-items: center;
  opacity: 0.4;
}

/* Dark mode adjustment if needed, though rgba usually works well on both */
</style>
