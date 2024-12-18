<template>
  <n-divider>Shop Avatar Mimir</n-divider>
  <n-flex>
    <n-input-group>
      <n-input
        :style="{ width: '33%' }"
        maxlength="42"
        show-count
        clearable
        placeholder="Avatar Address Seller"
        v-model:value="useFetchDataShopMimirAvatar.avatarAddressSeller"
      />
      <n-button
        @click="useFetchDataShopMimirAvatar.executeShopMimirAvatar"
        :disabled="useFetchDataShopMimirAvatar.isFetchingALL"
        :style="{ width: '10%' }"
      >
        Get
      </n-button>
      <n-button
        @click="useFetchDataShopMimirAvatar.abortShopMimirAvatar"
        :disabled="!useFetchDataShopMimirAvatar.isFetchingALL"
        :style="{ width: '10%' }"
      >
        Stop
      </n-button>
    </n-input-group>
  </n-flex>
  <n-data-table
    :columns="columns"
    :data="dataTable"
    :loading="useFetchDataShopMimirAvatar.isFetchingALL"
    :pagination="pagination"
  />
</template>

<script setup>
import { computed, h, reactive } from 'vue'
import { useFetchDataShopMimirAvatarStore } from '@/stores/fetchDataShopMimirAvatar'
import { NButton, NTag, useMessage } from 'naive-ui'
const useFetchDataShopMimirAvatar = useFetchDataShopMimirAvatarStore()
const message = useMessage()

function createColumns({ buyThis }) {
  return [
    {
      type: 'selection'
    },
    {
      type: 'expand',
      // eslint-disable-next-line no-unused-vars
      expandable: (rowData) => true,
      renderExpand: (rowData) =>
        h('pre', { style: { 'white-space': 'pre-wrap' } }, JSON.stringify(rowData, null, 2))
    },
    {
      title: 'No.',
      key: 'indexKey',
      render: (row) => {
        return `${row.indexKey + 1}`
      }
    },
    {
      title: 'Name',
      key: 'name'
    },
    {
      title: 'CP',
      key: 'cp'
    },
    {
      title: 'Type',
      key: 'itemSubType'
    },
    {
      title: 'Stat',
      key: 'statsMap',
      render(row) {
        const stats = Object.entries(row.statsMap).map(([tagKey, tagValue]) => {
          return tagValue > 0
            ? h(
                NTag,
                {
                  style: {
                    marginRight: '6px'
                  },
                  type: 'info',
                  bordered: false
                },
                {
                  default: () => `${tagKey}: ${tagValue}`
                }
              )
            : null
        })

        return stats
      }
    },
    {
      title: 'Action',
      key: 'actions',
      render(row) {
        return h(
          NButton,
          {
            size: 'small',
            onClick: () => buyThis(row)
          },
          {
            default: () => {
              const rawValue = row.price.rawValue
              const decimalPlaces = row.price.decimalPlaces

              return (parseInt(rawValue) / 10 ** decimalPlaces).toString() + ' ' + row.price.ticker
            }
          }
        )
      }
    }
  ]
}
const columns = createColumns({
  buyThis(rowData) {
    message.info(`buy ${rowData.name}`)
  }
})
const dataTable = computed(
  () => useFetchDataShopMimirAvatar.shopDataMimirAll['dataShopMimirAvatar']
)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [5, 10, 20],
  pageSlot: 5,
  onChange: (page) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  }
})
</script>
