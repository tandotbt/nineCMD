<template>
  <n-space vertical style="padding: 20px; max-width: 1200px; margin: 0 auto">
    <n-card :title="t('arenaLookup.title')">
      <n-space vertical>
        <n-flex>
          <n-input
            v-model:value="arenaLookup.searchQuery"
            :placeholder="t('arenaLookup.placeholder')"
            clearable
            style="flex: 1"
          />
          <n-button
            type="primary"
            :loading="arenaLookup.isFetchingLeaderboard"
            @click="arenaLookup.refreshLeaderboard()"
          >
            {{ t('arenaLookup.refresh') }}
          </n-button>
        </n-flex>

        <n-text :depth="3" style="font-size: 80%; font-style: italic">
          {{ t('arenaLookup.seasonInfo') }}
          <n-text v-if="arenaLookup.lastSeasonId" code>
            #{{ arenaLookup.lastSeasonId }}
          </n-text>
          <n-text v-else>{{ t('arenaLookup.emptySeason') }}</n-text>
        </n-text>

        <n-data-table
          size="small"
          :columns="columns"
          :data="arenaLookup.leaderboardFiltered"
          :pagination="{ pageSize: 20 }"
          :max-height="600"
          striped
          :loading="arenaLookup.isFetchingLeaderboard"
          :row-key="rowKey"
        />

        <n-text
          v-if="arenaLookup.errorLeaderboard"
          type="error"
          style="font-size: 12px"
        >
          {{ arenaLookup.errorLeaderboard.message }}
        </n-text>
      </n-space>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { NButton, type DataTableColumns } from 'naive-ui'
import { useArenaLookupStore } from '../stores/arenaLookup'
import type { ArenaAvatarOption } from '../types/arenaLookup'

const { t } = useI18n()
const router = useRouter()
const arenaLookup = useArenaLookupStore()

// ============================================================
// Columns
// ============================================================
const columns = ref<DataTableColumns<ArenaAvatarOption>>([
  { title: 'Name', key: 'avatarname' },
  {
    title: 'Agent',
    key: 'agentAddress',
    width: 150,
    render: (row) => `${(row.agentAddress || '').slice(0, 10)}…`
  },
  {
    title: 'Avatar',
    key: 'avataraddress',
    width: 150,
    render: (row) => `${(row.avataraddress || '').slice(0, 10)}…`
  },
  { title: 'Level', key: 'level', width: 80 },
  { title: 'Score', key: 'score', width: 80 },
  {
    title: '',
    key: 'action',
    width: 180,
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          onClick: () => useThisForLogin(row)
        },
        { default: () => t('arenaLookup.useForLogin') }
      )
  }
])

function rowKey(row: ArenaAvatarOption): string {
  return row.avataraddress
}

/**
 * Click "Use for Login" → save to localStorage + navigate to /login
 */
function useThisForLogin(row: ArenaAvatarOption): void {
  try {
    localStorage.setItem(LOGIN_PREFILL_AGENT, row.agentAddress)
    localStorage.setItem(LOGIN_PREFILL_AVATAR, row.avataraddress)
  } catch {
    // ignore (private mode / quota)
  }
  router.push({ name: 'login' })
}

onMounted(() => {
  // Trigger fetch if block ready, watcher in store will also handle
  if (
    arenaLookup.isBlockReady &&
    arenaLookup.leaderboardList.length === 0 &&
    !arenaLookup.isLeaderboardAutoFetched
  ) {
    arenaLookup.fetchLeaderboard()
  }
})
</script>
