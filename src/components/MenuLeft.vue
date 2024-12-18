<template>
  <n-menu ref="menuRef" v-model:value="selectedKey" :options="menuOptions" :accordion="true" />
</template>

<script setup>
import { h, ref, computed, onMounted, shallowRef } from 'vue'
import { NIcon } from 'naive-ui'
import {
  HomeRound as HomeIcon,
  LogInRound as LoginIcon,
  StadiumRound as ArenaIcon,
  LeaderboardRound as LeaderboardIcon,
  ShoppingCartFilled as ShopIcon,
  HomeRound as FishIcon,
  HomeRound as PawIcon
} from '@vicons/material'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHandlerMenuLeftStore } from '@/stores/handlerMenuLeft'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
import { useArenaSeasonStore } from '@/stores/arenaSeason'
const { t } = useI18n()
const useHandlerMenuLeft = useHandlerMenuLeftStore()
const useFetchDataUser9C = useFetchDataUser9CStore()
const useArenaSeason = useArenaSeasonStore()

// Ngăn click leaderboard khi chưa join arena
const isUseFetchArena = computed(() => useFetchDataUser9C.isUseFetchArena)

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
        icon: renderIcon(ArenaIcon),
        children: [
          {
            label: () =>
              h(
                isUseFetchArena.value ? RouterLink : 'span',
                {
                  to: {
                    name: 'arena-leaderboard-route',
                    params: {
                      champId: useArenaSeason.champIdActive,
                      roundId: useArenaSeason.roundIdActive
                    }
                  }
                },
                { default: () => t('page.arena.leaderboard') }
              ),
            key: 'go-arena-leaderboard-route',
            icon: renderIcon(LeaderboardIcon),
            children: [
              {
                label: () =>
                  h(
                    isUseFetchArena.value ? RouterLink : 'span',
                    {
                      to: {
                        name: 'arena-before-attack-route',
                        params: {
                          champId: useArenaSeason.champIdActive,
                          roundId: useArenaSeason.roundIdActive,
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
                name: 'shop-route'
              }
            },
            { default: () => t('page.shop') }
          ),
        key: 'go-shop-route',
        icon: renderIcon(ShopIcon)
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
