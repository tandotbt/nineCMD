<template>
  <n-menu ref="menuRef" v-model:value="selectedKey" :options="menuOptions" :accordion="true" />
</template>

<script setup>
import { h, ref, onMounted, shallowRef } from 'vue'
import { NIcon } from 'naive-ui'
import {
  HomeRound as HomeIcon,
  LogInRound as LoginIcon,
  HomeRound as FishIcon,
  HomeRound as PawIcon
} from '@vicons/material'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHandlerMenuLeftStore } from '@/stores/handlerMenuLeft'
const { t } = useI18n()
const useHandlerMenuLeft = useHandlerMenuLeftStore()
const selectedKey = ref(useHandlerMenuLeft.selectedKey)
const menuRef = shallowRef(null)
const selectAndExpand = (key) => {
  useHandlerMenuLeft.selectedKey = key
  menuRef.value.showOption(key)
}
// Làm kiểu gì đó mà có thể chuyển lựa chọn của menu khi click nút ở nơi khác
onMounted(() => {
  selectAndExpand(selectedKey)
})
function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = [
  {
    label: 'Game tab',
    key: 'game-tab',
    icon: renderIcon(FishIcon),
    children: [
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: 'home-route'
              }
            },
            { default: () => t('page.home') }
          ),
        key: 'go-home-route',
        icon: renderIcon(HomeIcon)
      },
      {
        key: 'divider-1',
        type: 'divider',
        props: {
          style: {
            marginLeft: '32px'
          }
        }
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: 'login-route'
              }
            },
            { default: () => t('page.login') }
          ),
        key: 'go-login-route',
        icon: renderIcon(LoginIcon)
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: 'arena-route'
              }
            },
            { default: () => t('page.arena.main') }
          ),
        key: 'go-arena-route',
        icon: renderIcon(HomeIcon),
        children: [
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    name: 'arena-leaderboard-route',
                    params: { agentAddress: '0x123Home' }
                  }
                },
                { default: () => t('page.arena.leaderboard') }
              ),
            key: 'go-arena-leaderboard-route',
            icon: renderIcon(HomeIcon),
            children: [
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        name: 'arena-before-attack-route',
                        params: {
                          agentAddress: '0x123Home',
                          agentEmeny: '0x999'
                        }
                      }
                    },
                    { default: () => t('page.arena.attack') }
                  ),
                key: 'go-arena-before-attack-route',
                icon: renderIcon(HomeIcon)
              }
            ]
          }
        ]
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: 'not-found-route'
              }
            },
            { default: () => t('page.notFound') }
          ),
        key: 'go-not-found-route',
        icon: renderIcon(HomeIcon)
      }
    ]
  },
  {
    label: 'Nine CMD',
    key: 'nine-cmd',
    icon: renderIcon(PawIcon),
    children: [
      {
        label: 'Temp',
        key: 'temp'
      }
    ]
  }
]
</script>
