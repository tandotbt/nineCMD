<template>
  <div class="blocks-container">
    <n-grid :cols="24" :x-gap="12" :y-gap="12">
      <n-grid-item :span="24">
        <BlockStats
          :title="t('page.home')"
          :latest-block="blockStore.blockNow"
          :avg-block-time="(blockStore.averageBlockTimeMs / 1000).toFixed(2)"
          :is-fetching="blockStore.isFetching"
          :is-tracking="blockStore.startBlockIndex !== null"
          :is-notification-supported="blockStore.isNotificationSupported"
          :btn-fetch-text="t('app_btn_fetch_latest')"
          :btn-tracking-text="t('app_btn_tracking')"
          :btn-notify-text="t('app_btn_notify_after', { n: blockStore.notificationThreshold })"
          :label-latest-block="t('app_stat_latest_block')"
          :label-avg-time="t('app_stat_avg_block_time')"
          :label-tracked="t('app_stat_blocks_tracked')"
          :blocks-tracked="blockStore.blocksTracked"
          @fetch="handleFetch"
          @set-marker="blockStore.setNotificationMarker"
        />
      </n-grid-item>

      <n-grid-item :span="24">
        <n-card :title="t('home_form_label_threshold_title')" size="small" :bordered="true">
          <NotificationConfigForm
            v-model:threshold="blockStore.notificationThreshold"
            :block-now="blockStore.blockNow"
            :start-block-index="blockStore.startBlockIndex"
            :label-threshold="t('home_form_label_threshold')"
            :placeholder-threshold="t('home_form_placeholder_threshold')"
            :suffix-blocks="t('home_form_suffix_blocks')"
            :btn-save-text="t('home_btn_save_config')"
            :btn-marker-text="t('home_btn_set_marker_now')"
            :info-current-block="t('home_info_current_block')"
            :info-marker="t('home_info_marker')"
            :info-remaining="
              t('home_info_remaining', {
                n: Math.max(
                  0,
                  (blockStore.notificationThreshold ?? 0) -
                    (blockStore.blockNow - (blockStore.startBlockIndex || 0)),
                ),
              })
            "
            @save="handleSaveConfig"
            @set-marker="blockStore.setNotificationMarker"
          />
        </n-card>
      </n-grid-item>

      <n-grid-item :span="24">
        <BlockHistory
          :title="t('app_card_block_history')"
          :blocks="blockStore.blocks"
          :label-index="t('app_block_index')"
          :label-hash="t('app_block_hash')"
          :label-virtual="t('app_block_virtual')"
        />
      </n-grid-item>
    </n-grid>

    <div class="actions">
      <n-button type="primary" @click="router.push('/')">
        {{ t('notfound_btn_back') }}
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlockStore } from '@/stores/useBlockStore'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BlockStats from '@/components/block/BlockStats.vue'
import BlockHistory from '@/components/block/BlockHistory.vue'
import NotificationConfigForm from '@/components/block/NotificationConfigForm.vue'
import { useMessage } from 'naive-ui'

const { t } = useI18n()
const blockStore = useBlockStore()
const router = useRouter()
const message = useMessage()

const handleFetch = () => {
  blockStore.fetchLatestBlock()
}

const handleSaveConfig = () => {
  message.success(t('home_msg_save_success', { n: blockStore.notificationThreshold }))
}
</script>

<style scoped>
.blocks-container {
  padding: 0;
}

.actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
