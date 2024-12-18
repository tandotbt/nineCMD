<template>
  <n-divider>Shop Mimir</n-divider>
  <n-flex>
    <n-input-number
      v-model:value="useFetchDataShopMimir.pageIndex"
      :min="0"
      placeholder="Page index"
    />
    <n-input-number
      v-model:value="useFetchDataShopMimir.pageLength"
      :min="1"
      placeholder="Page length"
    />
    <n-button
      @click="useFetchDataShopMimir.executeShopMimir"
      :disabled="useFetchDataShopMimir.isFetchingShopMimir"
    >
      Get
    </n-button>
    <n-button
      @click="useFetchDataShopMimir.abortShopMimir"
      :disabled="!useFetchDataShopMimir.isFetchingShopMimir"
    >
      Stop
    </n-button>
    <n-button
      @click="previousPage"
      :disabled="!useFetchDataShopMimir.hasPreviousPage || useFetchDataShopMimir.pageIndex === 0"
    >
      Previous
    </n-button>
    <n-button @click="nextPage" :disabled="!useFetchDataShopMimir.hasNextPage">Next</n-button>
  </n-flex>
  <n-data-table
    :columns="columns"
    :data="dataTable"
    :loading="useFetchDataShopMimir.isFetchingShopMimir"
  />
</template>

<script setup>
import { computed, h } from 'vue'
import { useFetchDataShopMimirStore } from '@/stores/fetchDataShopMimir'
import { NButton, NTag, useMessage } from 'naive-ui'
const useFetchDataShopMimir = useFetchDataShopMimirStore()
const message = useMessage()

function previousPage() {
  message.info('previousPage')
  useFetchDataShopMimir.previousPage()
}
function nextPage() {
  message.info('nextPage')
  useFetchDataShopMimir.nextPage()
}

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
      render: (_, index) => {
        return `${index + 1}`
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
const dataTable = computed(() => useFetchDataShopMimir.shopDataMimirAll['dataShopMimir'])
</script>
