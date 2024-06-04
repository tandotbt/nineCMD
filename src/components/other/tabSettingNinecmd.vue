<template>
  <n-flex justify="space-around" vertical>
    <n-flex>
      <n-input-number
        v-model:value="valueTimeout"
        :placeholder="
          t(
            '@--components--tabSettingNinecmd-vue.placeholder.timeoutUseNode',
            { TIMEOUT_USE_NODE },
            TIMEOUT_USE_NODE
          )
        "
        :min="TIMEOUT_USE_NODE"
      />
      <n-select
        style="width: 300px"
        v-model:value="useExtensionService.selectServiceSign"
        :options="useExtensionService.listServiceExtensions"
        :disabled="useHandlerCreatNewAction.listActionStartNextLength !== 0"
      />
    </n-flex>
    <n-transfer
      ref="transfer"
      v-model:value="useHandlerCreatNewAction.listActionStartNext"
      :options="useHandlerCreatNewAction.listActions"
      :render-source-label="renderLabel"
      virtual-scroll
      source-filterable
      target-filterable
    />

    <n-steps
      style="margin-left: 10px"
      vertical
      :current="currentStep"
      :update-value-on-input="false"
      :status="currentStepStatus"
    >
      <n-step v-for="(step, index) in steps" :key="index" :title="step.title">
        <div class="n-step-description">
          <p>
            <n-ellipsis :expand-trigger="'click'" :line-clamp="1" :tooltip="false">
              <span v-html="step.description"></span>
            </n-ellipsis>
          </p>

          <n-button
            v-if="currentStep === index + 2"
            :type="buttonType"
            size="small"
            @click="handlePrevClick"
            :disabled="!canAgainPreStep"
          >
            {{ t('@--components--tabSettingNinecmd-vue.button.again') }}
          </n-button>
          <n-button
            v-if="index + 1 === steps.length"
            :type="buttonType"
            size="small"
            @click="handleOpen9cscan"
            :disabled="!canOpen9cscan"
          >
            {{ t('@--components--tabSettingNinecmd-vue.button.open9cscan') }}
          </n-button>
        </div>
      </n-step>
    </n-steps>
  </n-flex>
</template>
<script setup>
import { ref, computed, h, reactive } from 'vue'
import { useMessage, NEllipsis, NAvatar } from 'naive-ui'
import { useFetch, watchImmediate } from '@vueuse/core'
import {
  TIMEOUT_USE_NODE,
  LIST_ACTIONS_AVAILABLE,
  TIME_RETRY,
  API_NINECMD,
  LOGIN_YOUR_SERVER
} from '@/utilities/constants'
import { useRefHistory } from '@vueuse/core'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
import { useHandlerCreatNewActionStore } from '@/stores/handlerCreatNewAction'
import { useExtensionServiceStore } from '@/stores/extensionService'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
//// Các biến
// Giúp làm mới dữ liệu khi hoàn thành 1 quy trình
const useFetchDataUser9C = useFetchDataUser9CStore()
const useHandlerCreatNewAction = useHandlerCreatNewActionStore()
const useExtensionService = useExtensionServiceStore()

// Trạng thái nút again
const buttonType = computed(() => {
  switch (currentStepStatus.value) {
    case 'error':
      return 'error'
    case 'finish':
      return 'success'
    default:
      return 'default'
  }
})

// Tổng các bước
const steps = ref([
  {
    title: computed(() => t('@--components--tabSettingNinecmd-vue.steps.step1')),
    description: computed(() => postDataJsonStep.value[1])
  },
  {
    title: computed(() => t('@--components--tabSettingNinecmd-vue.steps.step2')),
    description: computed(() => postDataJsonStep.value[2])
  },
  {
    title: computed(() => t('@--components--tabSettingNinecmd-vue.steps.step3')),
    description: computed(() => postDataJsonStep.value[3])
  },
  {
    title: computed(() => t('@--components--tabSettingNinecmd-vue.steps.step4')),
    description: computed(() => postDataJsonStep.value[4])
  },
  {
    title: computed(() => t('@--components--tabSettingNinecmd-vue.steps.step5')),
    description: computed(() => postDataJsonStep.value[5])
  },
  {
    title: computed(() => t('@--components--tabSettingNinecmd-vue.steps.step6')),
    description: computed(() => postDataJsonStep.value[6])
  },
  {
    title: computed(() => t('@--components--tabSettingNinecmd-vue.steps.step7')),
    description: computed(() => postDataJsonStep.value[7])
  },
  {
    title: computed(() => t('@--components--tabSettingNinecmd-vue.steps.step8')),
    description: computed(() => postDataJsonStep.value[8])
  },
  {
    title: computed(() => t('@--components--tabSettingNinecmd-vue.steps.step9')),
    description: computed(() => postDataJsonStep.value[9])
  },
  {
    title: computed(() => t('@--components--tabSettingNinecmd-vue.steps.step10')),
    description: computed(() => postDataJsonStep.value[10])
  }
])
const urlYourServerPath = ref('/publicKey')

// Tạo dữ liệu đầu vào cho nineCMD api
function creatNextPostDataJsonAll() {
  function formatRunes(inputRunes) {
    const array = inputRunes.split(',')
    const formattedArray = []
    for (let i = 0; i < array.length - 1; i += 2) {
      formattedArray.push([array[i], array[i + 1]])
    }
    return formattedArray
  }
  url9cmdServerPath.value = `/${dataBegin.value.pathNineCMD}`
  switch (useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[0]) {
    case 'refillAP':
      postDataJsonAll.value = {
        agentAddress: dataBegin.value.agent,
        avatarAddress: dataBegin.value.avatar,
        serverPlanet: dataBegin.value.planet,
        locale: dataBegin.value.locale
      }
      return
    case 'battleArena':
      postDataJsonAll.value = {
        agentAddress: dataBegin.value.agent,
        avatarAddress: dataBegin.value.avatar,
        avatarAddressEnemy: dataBegin.value.avatarAddressEnemy,
        champId: 0,
        roundId: 0,
        ticket: parseInt(dataBegin.value.ticket),
        equipments: dataBegin.value.equipments ? dataBegin.value.equipments.split(',') : [],
        costumes: dataBegin.value.costumes ? dataBegin.value.costumes.split(',') : [],
        runeInfos: dataBegin.value.runeInfos ? formatRunes(dataBegin.value.runeInfos) : [],
        auras: dataBegin.value.auras ? dataBegin.value.auras.split(',') : [],
        serverPlanet: dataBegin.value.planet,
        locale: dataBegin.value.locale,
        isLimit: dataBegin.value.isLimit.toLowerCase() === 'true'
      }
      return
    default:
      console.log('error tạo dữ liệu cho nineCMD api')
  }
}
// Hàm chọn data post cho bước sau
function afterFetchStep(data) {
  switch (currentStep.value) {
    case 2:
      break
    case 3:
      urlYourServerPath.value = '/publicKey'
      // Post cho get public key
      postDataJsonAll.value = {
        agentAddress: dataBegin.value.agent,
        password: encodeURIComponent(useFetchDataUser9C.userPassword),
        locale: dataBegin.value.locale
      }
      break
    // Tạo dữ liệu cho nineCMD
    case 4:
      data = data.message
      creatNextPostDataJsonAll()
      break
    case 5:
      data = data.message
      postDataJsonAll.value = {
        query: `
          query {
            transaction {
              nextTxNonce(address: "${dataBegin.value.agent}")
            }
          }
        `
      }
      break
    case 6:
      data = data.data.transaction.nextTxNonce
      postDataJsonAll.value = {
        query: `
            query {
              transaction {
                unsignedTransaction(
                  publicKey: "${postDataJsonStep.value[4]}",
                  plainValue: "${postDataJsonStep.value[5]}",
                  nonce: ${data}
                )
              }
            }
          `
      }
      break
    case 7:
      urlYourServerPath.value = '/signature'
      data = data.data.transaction.unsignedTransaction
      postDataJsonAll.value = {
        agentAddress: dataBegin.value.agent,
        password: encodeURIComponent(useFetchDataUser9C.userPassword),
        unsignedTransaction: data,
        locale: dataBegin.value.locale
      }
      break
    case 8:
      data = data.message
      postDataJsonAll.value = {
        query: `
          query {
            transaction {
              signTransaction(
                unsignedTransaction: "${postDataJsonStep.value[7]}",
                signature: "${data}"
              )
            }
          }
        `
      }
      break
    case 9:
      data = data.data.transaction.signTransaction
      postDataJsonAll.value = {
        query: `
          mutation {
            stageTransaction(
              payload: "${data}"
            )
          }
        `
      }
      break
    case 10:
      data = `Done in ${(new Date() - timeDoneStart.value) / 1000}s<br/>${data.data.stageTransaction}`
      break
    default:
      console.log('error afterFetchStep')
  }
  return data
}

// Một object ánh xạ tên hành động vào dữ liệu mới cùng với những dữ liệu cần
// const actionDataMap = computed(() => {
//   return {
//     refillAP: {
//       label: `${useConfigURL.selectedPlanet} | Refill AP | ${nameAndTag.value} | ${d(timeNow.value, 'useTimeNode')}`,
//       value: `refillAP<br/>${useConfigURL.selectedPlanet}<br/>${locale.value}<br/>${useConfigURL.selectedNode}<br/>${useConfigURL.apiRest9cscan}<br/>${useConfigURL.web9cscanUrl}<br/>${useFetchDataUser9C.agentAddress}<br/>${useFetchDataUser9C.avatarAddress}<br/>${d(timeNow.value, 'useTimeNode')}`,
//       disabled: false,
//       labelImg: '/assets/icons/UI_main_icon_box.png'
//     },
//     sweep: {
//       label: 'Sweep',
//       value: 'sweep_value',
//       disabled: false
//     },
//     repeat: {
//       label: 'Repeat',
//       value: 'repeat_value',
//       disabled: false
//     }
//   }
// })

// Tạo dữ liệu bước ban đầu
async function getDataBegin() {
  switch (useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[0]) {
    case 'refillAP':
      dataBegin.value = {
        typeAction: LIST_ACTIONS_AVAILABLE.refillAP,
        planet: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[1],
        locale: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[2],
        urlNode: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[3],
        api9cscan: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[4],
        web9cscan: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[5],
        agent: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[6],
        avatar: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[7],
        pathNineCMD: 'refillAP'
      }
      return
    case 'battleArena':
      dataBegin.value = {
        typeAction: LIST_ACTIONS_AVAILABLE.battleArena,
        planet: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[1],
        locale: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[2],
        urlNode: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[3],
        api9cscan: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[4],
        web9cscan: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[5],
        agent: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[6],
        avatar: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[7],
        avatarAddressEnemy: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[8],
        ticket: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[9],
        equipments: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[10],
        costumes: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[11],
        runeInfos: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[12],
        auras: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[13],
        isLimit: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[14],
        pathNineCMD: 'attackArena'
      }
      return
    default:
      console.log('error chọn type action')
  }
}

// Logic bắt đầu bước tiếp theo
async function startNextStep() {
  showMessStop.value = true
  if (!useNodeRef.value) return
  console.log('=== Bắt đầu step' + currentStep.value)

  const useExtension = {
    Chrono: async (stepNow) => await processUseChrono(stepNow)
  }
  const tryUseExtension = useExtension[useExtensionService.selectServiceSign]
  switch (currentStep.value) {
    case 2:
      await getDataBegin()
      await checkGetID(2)
      break
    case 3:
      await checkSuccess(3)
      break
    // Lấy public key
    case 4:
      if (tryUseExtension) {
        await tryUseExtension(4)
      } else {
        await checkYourServer(4)
      }
      break
    // Dùng nineCMD API
    case 5:
      await check9cmdServer(5)
      break
    // Nhận nextTxNonce
    case 6:
      if (tryUseExtension) {
        await tryUseExtension(6)
      } else {
        await processUseNode(6)
      }
      break
    case 7:
      if (tryUseExtension) {
        await tryUseExtension(7)
      } else {
        await processUseNode(7)
      }
      break
    case 8:
      if (tryUseExtension) {
        await tryUseExtension(8)
      } else {
        await processUseNode(8)
      }
      break
    case 9:
      if (tryUseExtension) {
        await tryUseExtension(9)
      } else {
        await processUseNode(9)
      }
      break
    case 10:
      await processUseNode(10)
      break
    default:
      currentStep.value = 2
      startNextStep()
      console.log('Không tồn tại currentStep')
  }
  console.log('Kết thúc ' + currentStep.value)
}

// Hàm chỉnh label cho list đẹp
const renderLabel = function ({ option }) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        margin: '6px 0'
      }
    },
    {
      default: () => [
        h(NAvatar, {
          round: false,
          src: option.labelImg,
          size: 'medium'
        }),
        h(
          'div',
          {
            style: {
              display: 'flex',
              marginLeft: '6px',
              alignSelf: 'center'
            }
          },
          {
            default: () => option.label
          }
        )
      ]
    }
  )
}

const actionNext = computed(() => useHandlerCreatNewAction.listActionStartNext[0])

const valueTimeout = ref()
const currentStep = ref(1)
const currentStepStatus = ref('wait')
// Array chứa các action
// const listActions = ref([])
const dataBegin = ref({})
// const listActionStartNext = ref([])
// Biến để break khỏi case nếu action ko muốn chạy nữa
const useNodeRef = ref(false)
// Biến lưu trạng thái nút again
const canAgainPreStep = ref(true)
// Biến ko hiện thông báo dừng nếu đi đủ các bước
const showMessStop = ref(false)

// Biến cho việc đếm số lần thử
const timeRetry = ref(0)
const timeRetryGetID = ref(0)
const timeRetryCheckSuccess = ref(0)
const timeRetryYourServer = ref(0)
const timeRetry9cmdServer = ref(0)

const timeRetryMax = TIME_RETRY.timeRetryMax
const timeRetryGetIDMax = TIME_RETRY.timeRetryGetIDMax
const timeRetryCheckSuccessMax = TIME_RETRY.timeRetryCheckSuccessMax
const timeRetryYourServerMax = TIME_RETRY.timeRetryYourServerMax
const timeRetry9cmdServerMax = TIME_RETRY.timeRetry9cmdServerMax

// Biến liên quan đến thông báo
let messageReactive = null

// Biến cho các URL
const urlUseNode = computed(() => dataBegin.value.urlNode)
const urlGetListID = computed(
  () =>
    `${dataBegin.value.api9cscan}/accounts/${dataBegin.value.agent}/transactions?action=${dataBegin.value.typeAction}&limit=${timeRetryGetIDMax}`
)
const urlCheckSuccess = computed(
  () => `${dataBegin.value.api9cscan}/transactions/${transactionId.value}/status`
)
const urlYourServer = computed(() => useFetchDataUser9C.urlYourServer + urlYourServerPath.value)
const url9cmdServer = computed(() => API_NINECMD + url9cmdServerPath.value)

// Biến cho thông báo đầu ra
const message = useMessage()
// Mặc định TIMEOUT_USE_NODE giây chờ nếu null
const timeoutComputed = computed(() =>
  valueTimeout.value == null ? TIMEOUT_USE_NODE : valueTimeout.value
)

//// Biến cho fetch
// Biến lưu trữ dữ liệu post
const postDataJsonAll = ref('')
// Biến lưu all các dữ liệu trả về
const postDataJsonStep = ref(Array.from({ length: steps.value.length + 2 }, () => null))
// Lưu lại lịch sử của data post đi
const { undo } = useRefHistory(postDataJsonAll)
// Biến lưu số lượng các id đang có
const lengthTXid = computed(() => {
  const regex = /<br\s*\/?>/i
  // Lấy danh sách id từ kết quả fetch trước
  let hasBrTag = regex.test(postDataJsonStep.value[currentStep.value - 1])
  if (hasBrTag) {
    return postDataJsonStep.value[currentStep.value - 1].split('<br/>').length
  } else {
    return 0
  }
})
// Id để check success
const transactionId = computed(() => {
  const regex = /<br\s*\/?>/i
  // Lấy danh sách id từ kết quả fetch trước
  let hasBrTag = regex.test(postDataJsonStep.value[currentStep.value - 1])
  if (hasBrTag) {
    return postDataJsonStep.value[currentStep.value - 1].split('<br/>')[timeRetryCheckSuccess.value]
  } else {
    return 0
  }
})

//// Các biến lấy từ vị trí khác
const usernameAPI = computed(() =>
  useFetchDataUser9C.serverUsername !== ''
    ? useFetchDataUser9C.serverUsername
    : LOGIN_YOUR_SERVER.username
)
const passwordAPI = computed(() =>
  useFetchDataUser9C.serverPassword !== ''
    ? useFetchDataUser9C.serverPassword
    : LOGIN_YOUR_SERVER.password
)

// Thời gian bắt đầu action
// const timeNow = useNow()
const timeDoneStart = ref(new Date())

//// Các hàm
// Hàm tự chạy khi có action mới
watchImmediate(actionNext, async (newValue, oldValue) => {
  // Nếu oldValue rỗng => bắt đầu lần đầu tiền thì ko có createMessageStop()
  await removeTimeout()
  if (newValue && !oldValue) {
    // Cài đầu vào
    timeDoneStart.value = new Date()
    currentStep.value = 2
    postDataJsonStep.value[1] = newValue
    useNodeRef.value = true
    startNextStep()
  } else if (newValue && oldValue) {
    // Nếu vẫn còn action thì sẽ chạy
    // Cài đầu vào
    timeDoneStart.value = new Date()
    if (showMessStop.value) await createMessageStop()
    await canAbortUseNode()
    currentStep.value = 2
    postDataJsonStep.value[1] = newValue
    useNodeRef.value = true
  } else if (!newValue) {
    // Hủy đang chạy nếu ko có action được chọn
    if (showMessStop.value) await createMessageStop()
    await canAbortUseNode()
  }
})

//// Fetch node
const {
  execute: executeFetchNode,
  abort,
  canAbort,
  onFetchError
} = useFetch(
  urlUseNode,
  { immediate: false },
  {
    beforeFetch({ options }) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json'
      }
      return options
    },
    // Lọc ra những dữ liệu cần
    afterFetch(ctx) {
      // Hàm nếu có errors trong data trả về
      if (ctx.data.errors !== undefined) {
        let messageError = ''
        ctx.data.errors.forEach((error) => {
          console.log(error.message)
          messageError += error.message + '<br/>'
        })
        ctx.data = messageError
        hasErrorUseNode()
        return ctx
      }
      // Nếu ko có lỗi
      resetTimeTry()
      ctx.data = afterFetchStep(ctx.data)
      postDataJsonStep.value[currentStep.value] = ctx.data

      return ctx
    }
  }
)
  .json()
  .post(postDataJsonAll)

onFetchError((error) => {
  // Khi lỗi
  hasErrorUseNode()
  console.log(error)
})
// Hàm khi node có lỗi
function hasErrorUseNode() {
  currentStepStatus.value = 'error'
  timeRetry.value++
  postDataJsonStep.value[currentStep.value] = null
}
//// Fetch get id để check success
const { execute: executeGetListID, onFetchError: onFetchErrorGetListID } = useFetch(
  urlGetListID,
  { immediate: false },
  {
    afterFetch(ctx) {
      // Hàm nếu có transactions trong data trả về
      if (ctx.data.transactions !== undefined) {
        postDataJsonStep.value[currentStep.value] = ''
        ctx.data.transactions.forEach((data) => {
          postDataJsonStep.value[currentStep.value] += data.id + '<br/>'
        })
        resetTimeTry()
        // Nếu ko có lỗi
        ctx.data = afterFetchStep(ctx.data)
        return ctx
      }
      postDataJsonStep.value[currentStep.value] = null
      currentStepStatus.value = 'error'
      timeRetryGetID.value += 1
      ctx.data = null
      return ctx
    }
  }
)
  .json()
  .get()

onFetchErrorGetListID(() => {
  postDataJsonStep.value[currentStep.value] = null
  currentStepStatus.value = 'error'
  timeRetryGetID.value += 1
})
//// Fetch ktra success
const { execute: executeCheckSuccess, onFetchError: onFetchErrorCheckSuccess } = useFetch(
  urlCheckSuccess,
  { immediate: false },
  {
    afterFetch(ctx) {
      // Hàm nếu có status trong data trả về
      if (ctx.data.status !== undefined) {
        if (timeRetryCheckSuccess.value === 0) postDataJsonStep.value[currentStep.value] = ''
        postDataJsonStep.value[currentStep.value] += ctx.data.status + '<br/>'
        if (ctx.data.status === 'SUCCESS') {
          resetTimeTry()
        } else {
          timeRetryCheckSuccess.value += 1
        } // Nếu ko có lỗi
        ctx.data = afterFetchStep(ctx.data)
        return ctx
      }
      postDataJsonStep.value[currentStep.value] = null
      currentStepStatus.value = 'error'
      timeRetryCheckSuccess.value += 1
      ctx.data = null
      return ctx
    }
  }
)
  .json()
  .get()

onFetchErrorCheckSuccess(() => {
  postDataJsonStep.value[currentStep.value] = null
  currentStepStatus.value = 'error'
  timeRetryCheckSuccess.value += 1
})

//// Fetch nhận public key và ký giao dịch
const { execute: executeYourServer, onFetchError: onFetchErrorYourServer } = useFetch(
  urlYourServer,
  { immediate: false },
  {
    beforeFetch({ options }) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${btoa(usernameAPI.value + ':' + passwordAPI.value)}`
      }

      return {
        options
      }
    },
    afterFetch(ctx) {
      // Hàm nếu có error trong data trả về
      if (ctx.data.error !== undefined) {
        // Nếu có mã error khác 0
        if (ctx.data.error !== 0) {
          console.log(ctx.data)
          postDataJsonStep.value[currentStep.value] = ctx.data.message
          currentStepStatus.value = 'error'
          timeRetryYourServer.value += 1
          ctx.data = ctx.data.message
          return ctx
        }
        // Nếu ko có lỗi
        resetTimeTry()
        ctx.data = afterFetchStep(ctx.data)
        postDataJsonStep.value[currentStep.value] = ctx.data

        return ctx
      }
      postDataJsonStep.value[currentStep.value] = ctx.data.message
      currentStepStatus.value = 'error'
      timeRetryYourServer.value += 1
      ctx.data = null
      return ctx
    },
    updateDataOnError: true,
    onFetchError(ctx) {
      // ctx.data can be null when 5xx response
      if (ctx.data.error !== undefined && ctx.data.error !== 0) {
        console.log(ctx.data)
        postDataJsonStep.value[currentStep.value] = ctx.data.message
      } else {
        postDataJsonStep.value[currentStep.value] = null
      }
      return ctx
    }
  }
)
  .json()
  .post(postDataJsonAll)

onFetchErrorYourServer(() => {
  // postDataJsonStep.value[currentStep.value] = null
  currentStepStatus.value = 'error'
  timeRetryYourServer.value += 1
})
//// Fetch dùng Server 9cmd
const url9cmdServerPath = ref('/refillAP')
const { execute: execute9cmdServer, onFetchError: onFetchError9cmdServer } = useFetch(
  url9cmdServer,
  { immediate: false },
  {
    beforeFetch({ options }) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json'
      }

      return {
        options
      }
    },
    afterFetch(ctx) {
      // Hàm nếu có error trong data trả về
      if (ctx.data.error !== undefined) {
        // Nếu có mã error khác 0
        if (ctx.data.error !== 0) {
          console.log(ctx.data)
          postDataJsonStep.value[currentStep.value] = ctx.data.message
          currentStepStatus.value = 'error'
          timeRetry9cmdServer.value += 1
          ctx.data = ctx.data.message
          return ctx
        }
        // Nếu ko có lỗi
        resetTimeTry()
        ctx.data = afterFetchStep(ctx.data)
        postDataJsonStep.value[currentStep.value] = ctx.data

        return ctx
      }
      postDataJsonStep.value[currentStep.value] = ctx.data.message
      currentStepStatus.value = 'error'
      timeRetry9cmdServer.value += 1
      ctx.data = null
      return ctx
    },
    updateDataOnError: true,
    onFetchError(ctx) {
      // ctx.data can be null when 5xx response
      if (ctx.data.error !== undefined && ctx.data.error !== 0) {
        console.log(ctx.data)
        postDataJsonStep.value[currentStep.value] = ctx.data.message
      } else {
        postDataJsonStep.value[currentStep.value] = null
      }
      return ctx
    }
  }
)
  .json()
  .post(postDataJsonAll)

onFetchError9cmdServer(() => {
  // postDataJsonStep.value[currentStep.value] = null
  currentStepStatus.value = 'error'
  timeRetry9cmdServer.value += 1
})

// Hàm xử lý việc thêm action vào list chờ
// // Logic thêm action mới vào list
// const handleActionNew = (actionName) => {
//   // Lấy dữ liệu mới từ object actionDataMap
//   let newAction = actionDataMap.value[actionName]
//   // Thêm dữ liệu mới vào cả hai mảng
//   listActions.value.push(newAction)
//   listActionStartNext.value.push(newAction.value)
// }
// Các hàm xử lý cho việc kiểm tra và xử lý các bước
// Hàm dừng nếu action đang chạy bị thay đổi
async function canAbortUseNode() {
  // Break khỏi case nếu đang chạy
  useNodeRef.value = false
  // Nút again được đặt lại
  canAgainPreStep.value = true
  // Hình ảnh wait
  currentStepStatus.value = 'wait'
  await resetTimeTry()
  // Hủy fetch nếu có thể
  if (canAbort.value) {
    abort()
    // Giảm đi 1 lượt để khi ra case lỗi thì ko cộng thêm
    timeRetry.value--
  }
  // Trạng thái ban đầu
  currentStepStatus.value = 'finish'
  // Chặn dùng nút again
  canAgainPreStep.value = false
}

// Logic kiểm tra lấy ID
async function checkGetID(stepNow) {
  currentStepStatus.value = 'wait'
  // Chặn dùng nút again
  canAgainPreStep.value = false
  // Hủy nếu không sử dụng node nữa
  if (!useNodeRef.value) return

  // Nếu dùng again thì sẽ break để chạy tới case trước
  if (currentStep.value !== stepNow) {
    return
  }

  // Fetch lấy dữ liệu
  currentStepStatus.value = 'process'
  await executeGetListID()
  // Hủy nếu không sử dụng node nữa
  if (!useNodeRef.value) return

  // Kiểm tra số lần thử fetch
  if (timeRetryGetID.value > timeRetryGetIDMax) {
    // Khi đã thử 5 lần mà ko có cái nào SUCCESS
    currentStepStatus.value = 'wait'
    await createMessageError(stepNow, timeRetryGetID.value, timeRetryGetIDMax)
    await canAbortUseNode()
    // Xóa action đang chạy khỏi list giống ở bước cuối
    useHandlerCreatNewAction.listActionStartNext.shift()
    // Nếu số lần thử tồn tại thì sẽ fetch lại không cần chờ
  } else if (timeRetryGetID.value > 0) {
    await createMessageError(stepNow, timeRetryGetID.value, timeRetryGetIDMax)
  } else {
    // Pass qua fetch khi timeRetryGetID == 0
    currentStepStatus.value = 'wait'
    await resetTimeTry()
    await handleNextClick()
    startNextStep()
  }
}
// Logic kiểm tra thành công
async function checkSuccess(stepNow) {
  currentStepStatus.value = 'wait'
  // Chặn dùng nút again
  canAgainPreStep.value = false
  // Hủy nếu không sử dụng node nữa
  if (!useNodeRef.value) return

  // Nếu dùng again thì sẽ break để chạy tới case trước
  if (currentStep.value !== stepNow) {
    return
  }

  // Fetch lấy dữ liệu
  currentStepStatus.value = 'process'
  await executeCheckSuccess()
  // Hủy nếu không sử dụng node nữa
  if (!useNodeRef.value) return

  // Kiểm tra số lần thử fetch
  if (timeRetryCheckSuccess.value > timeRetryCheckSuccessMax) {
    // Khi đã thử 5 lần mà ko có cái nào SUCCESS
    currentStepStatus.value = 'wait'
    await createMessageError(stepNow, timeRetryCheckSuccess.value, timeRetryCheckSuccessMax)
    await canAbortUseNode()
    // Xóa action đang chạy khỏi list giống ở bước cuối
    useHandlerCreatNewAction.listActionStartNext.shift()
    // Nếu số lần thử tồn tại thì sẽ fetch lại không cần chờ
  } else if (timeRetryCheckSuccess.value > 0 && lengthTXid.value !== 0) {
    if (timeRetryCheckSuccess.value < lengthTXid.value) {
      startNextStep()
    } else {
      createMessageErrorNoSuccess()
    }
  } else {
    // Pass qua fetch khi timeRetryCheckSuccess == 0
    currentStepStatus.value = 'wait'
    await resetTimeTry()
    await handleNextClick()
    startNextStep()
  }
}
// Logic kiểm tra với server của bạn
async function checkYourServer(stepNow) {
  currentStepStatus.value = 'wait'
  // Chặn dùng nút again
  canAgainPreStep.value = false
  // Hủy nếu không sử dụng node nữa
  if (!useNodeRef.value) return

  // Nếu dùng again thì sẽ break để chạy tới case trước
  if (currentStep.value !== stepNow) {
    return
  }

  // Fetch lấy dữ liệu
  currentStepStatus.value = 'process'
  await executeYourServer()
  // Hủy nếu không sử dụng node nữa
  if (!useNodeRef.value) return

  // Kiểm tra số lần thử fetch
  if (timeRetryYourServer.value > timeRetryYourServerMax) {
    // Khi đã thử 5 lần mà ko có cái nào SUCCESS
    currentStepStatus.value = 'wait'
    await createMessageError(stepNow, timeRetryYourServer.value, timeRetryYourServerMax)
    await canAbortUseNode()
    // Xóa action đang chạy khỏi list giống ở bước cuối
    useHandlerCreatNewAction.listActionStartNext.shift()
    // Nếu số lần thử tồn tại thì sẽ fetch lại không cần chờ
  } else if (timeRetryYourServer.value > 0) {
    await createMessageError(stepNow, timeRetryYourServer.value, timeRetryYourServerMax)
  } else {
    // Pass qua fetch khi timeRetryYourServer == 0
    currentStepStatus.value = 'wait'
    await resetTimeTry()
    await handleNextClick()
    startNextStep()
  }
}
// Logic kiểm tra với server 9cmd
async function check9cmdServer(stepNow) {
  currentStepStatus.value = 'wait'
  // Chặn dùng nút again
  canAgainPreStep.value = false
  // Hủy nếu không sử dụng node nữa
  if (!useNodeRef.value) return

  // Nếu dùng again thì sẽ break để chạy tới case trước
  if (currentStep.value !== stepNow) {
    return
  }

  // Fetch lấy dữ liệu
  currentStepStatus.value = 'process'
  await execute9cmdServer()
  // Hủy nếu không sử dụng node nữa
  if (!useNodeRef.value) return

  // Kiểm tra số lần thử fetch
  if (timeRetry9cmdServer.value > timeRetry9cmdServerMax) {
    // Khi đã thử 5 lần mà ko có cái nào SUCCESS
    currentStepStatus.value = 'wait'
    await createMessageError(stepNow, timeRetry9cmdServer.value, timeRetry9cmdServerMax)
    await canAbortUseNode()
    // Xóa action đang chạy khỏi list giống ở bước cuối
    useHandlerCreatNewAction.listActionStartNext.shift()
    // Nếu số lần thử tồn tại thì sẽ fetch lại không cần chờ
  } else if (timeRetry9cmdServer.value > 0) {
    await createMessageError(stepNow, timeRetry9cmdServer.value, timeRetry9cmdServerMax)
  } else {
    // Pass qua fetch khi timeRetry9cmdServer == 0
    currentStepStatus.value = 'wait'
    await resetTimeTry()
    await handleNextClick()
    // createMessage() // Bỏ qua chờ đợi
    startNextStep()
  }
}
// Logic chung cho việc sử dụng node
async function processUseNode(stepNow) {
  currentStepStatus.value = 'wait'
  // Chặn dùng nút again
  canAgainPreStep.value = false
  // Hủy nếu không sử dụng node nữa
  if (!useNodeRef.value) return

  // Nếu dùng again thì sẽ break để chạy tới case trước
  if (currentStep.value !== stepNow) {
    return
  }

  // Fetch lấy dữ liệu
  currentStepStatus.value = 'process'
  await executeFetchNode()
  // Hủy nếu không sử dụng node nữa
  if (!useNodeRef.value) return

  // Kiểm tra số lần thử fetch
  if (timeRetry.value > timeRetryMax) {
    // Khi đã thử 3 lần
    currentStepStatus.value = 'wait'
    await createMessageError(stepNow, timeRetry.value, timeRetryMax)
    await canAbortUseNode()
    // Xóa action đang chạy khỏi list giống ở bước cuối
    useHandlerCreatNewAction.listActionStartNext.shift()
    // Nếu số lần thử tồn tại thì sẽ fetch lại
  } else if (timeRetry.value > 0) {
    await createMessageError(stepNow, timeRetry.value, timeRetryMax)
  } else {
    // Pass qua fetch
    currentStepStatus.value = 'wait'
    await resetTimeTry()
    await handleNextClick()

    if (stepNow >= steps.value.length) {
      await resetTimeTry()
      showMessStop.value = false
      // createMessageRefreshDataUser9c()
      await waitForSeconds(TIMEOUT_USE_NODE)
      // useFetchDataUser9C.executeUser9C()
      // Xóa action đang chạy khỏi list giống ở bước cuối
      useHandlerCreatNewAction.listActionStartNext.shift()
    } else {
      createMessage()
    }
  }
}

// Logic chung cho việc sử dụng chrono
const dataInputExtensionChrono = reactive({
  4: computed(() => useFetchDataUser9C.agentAddress),
  6: computed(() => useFetchDataUser9C.agentAddress),
  7: computed(() => useFetchDataUser9C.agentAddress),
  8: computed(() => useFetchDataUser9C.agentAddress),
  9: computed(() => {
    return { agent: useFetchDataUser9C.agentAddress, plainValue: postDataJsonStep.value[5] }
  })
})
const useExtensionChrono = {
  // 4: async (agent) => await useExtensionService.executeGetPublicKeyChrono(0, { agent }),
  4: async (agent) => console.log(`Bỏ qua lấy public key của ${agent}`),
  6: async (agent) => console.log(`Bỏ qua lấy nextTxNonce của ${agent}`),
  7: async (agent) => console.log(`Bỏ qua lấy unsignedTransaction của ${agent}`),
  8: async (agent) => console.log(`Bỏ qua lấy signature của ${agent}`),
  9: async (args) => await useExtensionService.executeGetSignTransactionChrono(0, args)
}

const dataOutputExtensionChrono = reactive({
  // 4: computed(() => useExtensionService.allData.Chrono.publicKey.state)
  4: computed(() => t('@--components--tabSettingNinecmd-vue.other.messageSkipStep')),
  6: computed(() => t('@--components--tabSettingNinecmd-vue.other.messageSkipStep')),
  7: computed(() => t('@--components--tabSettingNinecmd-vue.other.messageSkipStep')),
  8: computed(() => t('@--components--tabSettingNinecmd-vue.other.messageSkipStep')),
  9: computed(() => useExtensionService.allData.Chrono.signTransaction.state)
})
const checkDataOutputExtensionChrono = reactive({
  // 4: async (output) => output.lenth == 0 || output.includes(' ')
  // eslint-disable-next-line no-unused-vars
  4: async (output) => false,
  // eslint-disable-next-line no-unused-vars
  6: async (output) => false,
  // eslint-disable-next-line no-unused-vars
  7: async (output) => false,
  // eslint-disable-next-line no-unused-vars
  8: async (output) => false,
  9: async (output) => output.lenth == 0 || output.includes(' ')
})
const afterFetchStepExtensionChrono = reactive({
  // eslint-disable-next-line no-unused-vars
  4: async (output) => {
    return {
      message: 'temp'
    }
  },
  // eslint-disable-next-line no-unused-vars
  6: async (output) => {
    return {
      data: { transaction: { nextTxNonce: 0 } }
    }
  },
  // eslint-disable-next-line no-unused-vars
  7: async (output) => {
    return {
      data: { transaction: { unsignedTransaction: 'temp' } }
    }
  },
  // eslint-disable-next-line no-unused-vars
  8: async (output) => {
    return {
      message: 'temp'
    }
  },
  9: async (output) => {
    return {
      data: { transaction: { signTransaction: output } }
    }
  }
})

async function processUseChrono(stepNow) {
  currentStepStatus.value = 'wait'
  // Chặn dùng nút again
  canAgainPreStep.value = false
  // Hủy nếu không sử dụng node nữa
  if (!useNodeRef.value) return

  // Nếu dùng again thì sẽ break để chạy tới case trước
  if (currentStep.value !== stepNow) {
    return
  }

  // Fetch lấy dữ liệu
  currentStepStatus.value = 'process'

  const tryUseExtension = useExtensionChrono[stepNow]
  const dataInput = dataInputExtensionChrono[stepNow]
  const checkDataOutput = checkDataOutputExtensionChrono[stepNow]
  const afterFetchStepInput = afterFetchStepExtensionChrono[stepNow]
  if (tryUseExtension) {
    await tryUseExtension(dataInput)
    const dataOutput = dataOutputExtensionChrono[stepNow]
    postDataJsonStep.value[stepNow] = dataOutput
    const isError = await checkDataOutput(dataOutput)
    if (isError) {
      await createMessageError(stepNow, 1, 1)
      await canAbortUseNode()
      // Xóa action đang chạy khỏi list giống ở bước cuối
      useHandlerCreatNewAction.listActionStartNext.shift()
      return
    }
    // Nếu ko có lỗi
    const afterFetchStepInputData = await afterFetchStepInput(dataOutput)
    afterFetchStep(afterFetchStepInputData)
    currentStepStatus.value = 'wait'
    await resetTimeTry()
    await handleNextClick()
    startNextStep()
  } else {
    // Dừng khi ko tìm thấy tiến trình
    currentStepStatus.value = 'wait'
    await createMessageError(stepNow, 1, 1)
    await canAbortUseNode()
    // Xóa action đang chạy khỏi list giống ở bước cuối
    useHandlerCreatNewAction.listActionStartNext.shift()
  }
}

// Logic tạo thông báo chờ
async function createMessage() {
  canAgainPreStep.value = true
  // if (!messageReactive) {
  messageReactive = message.loading(
    t('@--components--tabSettingNinecmd-vue.message.createMessage', {
      timeoutComputed: timeoutComputed.value
    }),
    {
      closable: true,
      duration: timeoutComputed.value * 1000,
      onAfterLeave: () => startNextStep()
    }
  )
  // }
}
// // Logic tạo thông báo chờ làm mới all dữ liệu nhân vật
// async function createMessageRefreshDataUser9c() {
//   canAgainPreStep.value = true
//   // if (!messageReactive) {
//   message.loading(`Chờ ${TIMEOUT_USE_NODE} giây làm mới dữ liệu sau 1 chu trình`, {
//     closable: false,
//     duration: TIMEOUT_USE_NODE * 1000
//   })
//   // }
// }
// Logic tạo thông báo lỗi
async function createMessageError(stepHasError, now, max) {
  canAgainPreStep.value = true
  // if (!messageReactive) {
  messageReactive = message.error(
    t('@--components--tabSettingNinecmd-vue.message.createMessageError', {
      stepHasError,
      now,
      max
    }),
    {
      closable: true,
      duration: timeoutComputed.value * 1000 * 2,
      onAfterLeave: () => startNextStep()
    }
  )
  // }
}
// Hiển thị cần chơi game thủ công 1 lần
async function createMessageErrorNoSuccess() {
  canAgainPreStep.value = true

  messageReactive = message.error(
    t('@--components--tabSettingNinecmd-vue.message.createMessageErrorNoSuccess', {
      action: useHandlerCreatNewAction.listActionStartNext[0].split('<br/>')[0]
    }),
    {
      closable: true,
      duration: (TIMEOUT_USE_NODE / 2) * 1000,
      onAfterLeave: () => startNextStep()
    }
  )
}

// Logic tạo thông báo dừng
async function createMessageStop() {
  message.info(
    t('@--components--tabSettingNinecmd-vue.message.createMessageStop', {
      currentStep: currentStep.value
    }),
    {
      closable: true,
      duration: timeoutComputed.value * 1000
    }
  )
}
// Logic loại bỏ timeout
async function removeTimeout() {
  if (messageReactive) {
    await messageReactive.destroy()
    messageReactive = null
  }
}
// Logic xử lý khi nút next được nhấn
async function handleNextClick() {
  currentStep.value = (currentStep.value % steps.value.length) + 1
}
// Logic xử lý khi open 9cscan được nhấn
const canOpen9cscan = computed(() =>
  postDataJsonStep.value[steps.value.length] !== null ? true : false
)
const urlOpen9cscan = computed(
  () =>
    `${dataBegin.value.web9cscan}/tx/${postDataJsonStep.value[steps.value.length].split('<br/>')[1]}`
)

async function handleOpen9cscan() {
  // Mở liên kết trong một tab mới
  window.open(urlOpen9cscan.value, '_blank')
}
// Logic xử lý khi nút previous được nhấn
async function handlePrevClick() {
  // Xử lý logic khi nút previous được nhấn
  currentStep.value = currentStep.value <= 2 ? 1 : currentStep.value - 1
  //Sử dụng lại data post trước đó
  undo()
  await resetTimeTry()
}

// Đặt lại lần thử fetch
async function resetTimeTry() {
  timeRetry.value = 0
  timeRetryGetID.value = 0
  timeRetryCheckSuccess.value = 0
  timeRetryYourServer.value = 0
  timeRetry9cmdServer.value = 0
}

async function waitForSeconds(seconds) {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}
</script>
