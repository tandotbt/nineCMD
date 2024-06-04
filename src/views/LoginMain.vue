<template>
  <breadcrumbPage :pages="pages" />
  <n-gradient-text :size="24" type="info">
    {{ t('page.login') }}
  </n-gradient-text>

  <n-form
    ref="formRef"
    :model="formValue"
    :rules="rules"
    label-width="120"
    label-placement="left"
    require-mark-placement="right-hanging"
    size="small"
    @submit.prevent="handleSubmit"
  >
    <n-grid cols="40" item-responsive responsive="screen" :x-gap="12" :y-gap="8">
      <n-form-item-gi
        span="40 xs:35 s:30 m:20 l:20 xl:20 xxl:20"
        :label="t('@--views--LoginMain-vue.label.agent')"
        path="user.agentAddress"
      >
        <n-input
          v-model:value="formValue.user.agentAddress"
          type="text"
          placeholder="0xabc..."
          clearable
          :loading="useDataArenaParticipate.isFetchingAgentFinded ? true : undefined"
          :disabled="
            useDataArenaParticipate.isUseAvatartLogin || useFetchDataUser9C.isFetchingDataUser9C
          "
        />
      </n-form-item-gi>
      <n-form-item-gi
        span="40 xs:35 s:30 m:20 l:20 xl:20 xxl:20"
        :label="t('@--views--LoginMain-vue.label.agentPassword')"
        path="user.password"
      >
        <n-input
          type="password"
          show-password-on="click"
          v-model:value="formValue.user.password"
          :placeholder="t('@--views--LoginMain-vue.placeholder.agentPassword')"
        />
      </n-form-item-gi>
      <n-form-item-gi
        span="40 xs:35 s:30 m:20 l:20 xl:20 xxl:20"
        :label="t('@--views--LoginMain-vue.label.avatar')"
        path="user.avatarAddress"
      >
        <n-select
          v-model:value="formValue.user.avatarAddress"
          filterable
          placeholder="0xabc..."
          :options="useDataArenaParticipate.listAvatar"
          :loading="useDataArenaParticipate.isFetchingListAvatar"
          value-field="avataraddress"
          label-field="avatarname"
          :render-label="renderLabel"
          clearable
          tag
          :clear-filter-after-select="false"
          :disabled="disabledAvatarWhenAgentNotOk || useFetchDataUser9C.isFetchingDataUser9C"
        />
      </n-form-item-gi>
      <n-form-item-gi label=" " span="40 xs:35 s:30 m:20 l:20 xl:20 xxl:20">
        <n-switch
          v-model:value="useDataArenaParticipate.isUseAvatartLogin"
          @update:value="resetValue"
          :disabled="useFetchDataUser9C.isFetchingDataUser9C"
        >
          <template #checked>
            {{ t('@--views--LoginMain-vue.switch.checked') }}
          </template>
          <template #unchecked>
            {{ t('@--views--LoginMain-vue.switch.unchecked') }}
          </template>
        </n-switch>
      </n-form-item-gi>
      <n-form-item-gi label=" " span="40 xs:35 s:30 m:20 l:20 xl:20 xxl:20">
        <n-button
          attr-type="submit"
          type="primary"
          size="large"
          :loading="isFetching"
          :disabled="isFetching"
        >
          {{ t('@--views--LoginMain-vue.submit') }}
        </n-button>
      </n-form-item-gi>
      <n-grid-item span="40">
        <n-divider title-placement="left">{{ t('@--views--LoginMain-vue.divider') }} </n-divider>
      </n-grid-item>
      <n-grid-item offset="10" span="20">
        <n-select
          v-model:value="useExtensionService.selectServiceSign"
          size="large"
          :options="useExtensionService.listServiceExtensions"
          :disabled="useHandlerCreatNewAction.listActionStartNextLength !== 0"
        />
      </n-grid-item>
      <n-grid-item span="40">
        <n-tabs
          class="card-tabs"
          default-value="extensions"
          size="large"
          animated
          justify-content="space-evenly"
        >
          <n-tab-pane
            name="selfHosting"
            :tab="t('@--views--LoginMain-vue.typeService.selfHosting')"
          >
            <n-grid cols="40" item-responsive responsive="screen" :x-gap="12" :y-gap="8">
              <n-form-item-gi
                span="40 xs:35 s:30 m:30 l:30 xl:30 xxl:30"
                :label="t('@--views--LoginMain-vue.label.url')"
                path="server.url"
              >
                <n-input-group>
                  <n-button size="medium" @click="openPythonanywhere()">
                    <template #icon>
                      <n-icon><OpenNewTab /></n-icon>
                    </template>
                  </n-button>
                  <n-input
                    v-model:value="formValue.server.url"
                    :placeholder="t('@--views--LoginMain-vue.placeholder.url')"
                  />
                  <n-input-group-label>.pythonanywhere.com</n-input-group-label>
                </n-input-group>
              </n-form-item-gi>
              <n-form-item-gi
                span="30 xs:30 s:30 m:30 l:30 xl:30 xxl:30"
                :label="t('@--views--LoginMain-vue.label.urlUsername')"
                path="server.username"
              >
                <n-input
                  v-model:value="formValue.server.username"
                  :placeholder="t('@--views--LoginMain-vue.placeholder.urlUsername')"
                />
              </n-form-item-gi>
              <n-form-item-gi
                span="30 xs:30 s:30 m:30 l:30 xl:30 xxl:30"
                :label="t('@--views--LoginMain-vue.label.urlPassword')"
                path="server.password"
              >
                <n-input
                  type="password"
                  show-password-on="click"
                  v-model:value="formValue.server.password"
                  :placeholder="t('@--views--LoginMain-vue.placeholder.urlPassword')"
                />
              </n-form-item-gi>
            </n-grid>
          </n-tab-pane>
          <n-tab-pane name="extensions" :tab="t('@--views--LoginMain-vue.typeService.extensions')">
            <n-grid cols="40" item-responsive responsive="screen" :x-gap="12" :y-gap="8">
              <n-form-item-gi span="40 xs:35 s:30 m:30 l:30 xl:30 xxl:30" label=" ">
                <n-flex>
                  <template
                    v-for="(extension, extensionKey) in listExtensionsInfo"
                    :key="extensionKey"
                  >
                    <n-button
                      round
                      size="large"
                      :color="extension.colorButonConnect"
                      :ghost="!extension.isConnected"
                      @click="tryConnect(extensionKey)"
                      v-if="extension.connectButton"
                      :loading="extension.isLoading"
                    >
                      <template #icon>
                        <n-icon size="24" :component="extension.logo" />
                      </template>
                      {{ t(extension.connectButton) }}
                    </n-button>
                  </template>
                </n-flex>
              </n-form-item-gi>
            </n-grid>
          </n-tab-pane>
        </n-tabs>
      </n-grid-item>
      <n-form-item-gi span="35 xs:35 s:35 m:35 l:35 xl:35 xxl:35" label=" ">
        <n-carousel :space-between="10" show-arrow autoplay dot-placement="top" :show-dots="false">
          <n-scrollbar
            v-for="(extension, extensionIndex) in listExtensionsInfo"
            :key="extensionIndex"
          >
            <n-thing class="carousel-img">
              <template #avatar>
                <n-avatar
                  :style="{
                    backgroundColor: extension.color
                  }"
                >
                  <n-icon size="24" :component="extension.logo" />
                </n-avatar>
              </template>
              <template #header>
                {{ t(extension.header) }}
                <n-text tag="span" :depth="3">#{{ t(extension.typeService) }}</n-text>
              </template>
              <template #description>
                {{ t(extension.description) }}
              </template>
              <n-flex vertical>
                <div>
                  <n-tag v-if="extension.verify" round :bordered="false" type="success">
                    {{ t('@--views--LoginMain-vue.typeService.recommended') }}
                    <template #icon>
                      <n-icon :component="verifyIcon" />
                    </template>
                  </n-tag>
                </div>
                <n-ellipsis expand-trigger="click" line-clamp="3" :tooltip="false">
                  <span v-html="t(extension.content)"></span>
                </n-ellipsis>
              </n-flex>
              <template #footer><avatarGroup :listImg="extension.footer" /> </template>
              <template #action>
                <n-flex>
                  <n-button
                    size="small"
                    v-for="(buttonData, buttonIndex) in extension.button"
                    :key="buttonIndex"
                    @click="openLink(buttonData.link)"
                  >
                    <template #icon>
                      <n-icon :component="buttonData.icon" />
                    </template>
                    {{ buttonData.content }}
                  </n-button>
                </n-flex>
              </template>
            </n-thing>
          </n-scrollbar>
        </n-carousel>
      </n-form-item-gi>
    </n-grid>
  </n-form>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import breadcrumbPage from '@/components/other/breadcrumbPage.vue'
import { ref, markRaw, h, computed, watch } from 'vue'
// import { useMessage } from 'naive-ui'
import {
  HomeRound as HomeIcon,
  LogInRound as LoginIcon,
  OpenInNewRound as OpenNewTab,
  FileDownloadRound as DownloadIcon,
  CheckCircleOutlineOutlined as verifyIcon
} from '@vicons/material'
// import { useLoadingBar } from 'naive-ui'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
import { useExtensionServiceStore } from '@/stores/extensionService'
import { useHandlerCreatNewActionStore } from '@/stores/handlerCreatNewAction'
import avatarGroup from '@/components/other/avatarGroup.vue'
import logoChrono from '@/components/icons/logoChrono.vue'
import logoNineCMDSign from '@/components/icons/logoNineCMDSign.vue'
import githubMark from '@/components/icons/githubMark.vue'
import docsPage from '@/components/icons/docsPage.vue'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
const useFetchDataUser9C = useFetchDataUser9CStore()
const useExtensionService = useExtensionServiceStore()
const useHandlerCreatNewAction = useHandlerCreatNewActionStore()
// Hỗ trợ dịch
const { t } = useI18n()

// Thanh thing
const listExtensionsInfo = ref({
  NineCMDSign: {
    header: '@--views--LoginMain-vue.thing.NineCMDSign.header',
    typeService: '@--views--LoginMain-vue.typeService.selfHosting',
    verify: null,
    connectButton: null,
    logo: markRaw(logoNineCMDSign),
    color: 'yellow',
    description: '@--views--LoginMain-vue.thing.NineCMDSign.description',
    content: '@--views--LoginMain-vue.thing.NineCMDSign.content',
    footer: [
      {
        name: 'tandotbt',
        src: getImageBase64FromCacheOrFetch(
          'https://avatars.githubusercontent.com/u/92938902?s=64&v=4'
        )
      }
    ],
    button: [
      {
        icon: markRaw(githubMark),
        link: 'https://github.com/tandotbt/Nine_CMD_sign/',
        content: '@tandotbt/Nine_CMD_sign'
      },
      {
        icon: markRaw(DownloadIcon),
        link: 'https://github.com/tandotbt/Nine_CMD_sign/releases/tag/v2.0/',
        content: 'v2.0'
      }
    ]
  },
  Chrono: {
    header: '@--views--LoginMain-vue.thing.Chrono.header',
    typeService: '@--views--LoginMain-vue.typeService.extensions',
    verify: true,
    connectButton: '@--views--LoginMain-vue.thing.Chrono.connectButton',
    colorButonConnect: '#f0b90b',
    isLoading: computed(() => useExtensionService.allData.Chrono.connect.isLoading),
    isConnected: computed(() => useExtensionService.allData.Chrono.connect.isConnected),
    logo: markRaw(logoChrono),
    color: '#f0b90b',
    description: '@--views--LoginMain-vue.thing.Chrono.description',
    content: '@--views--LoginMain-vue.thing.Chrono.content',
    footer: [
      {
        name: 'moreal',
        src: getImageBase64FromCacheOrFetch(
          'https://avatars.githubusercontent.com/u/26626194?s=64&v=4'
        )
      },
      {
        name: 'Akamig',
        src: getImageBase64FromCacheOrFetch(
          'https://avatars.githubusercontent.com/u/6278999?s=64&v=4'
        )
      },
      {
        name: 'longfin',
        src: getImageBase64FromCacheOrFetch(
          'https://avatars.githubusercontent.com/u/128436?s=64&v=4'
        )
      },
      {
        name: 'jckdotim',
        src: getImageBase64FromCacheOrFetch(
          'https://avatars.githubusercontent.com/u/276766?s=64&v=4'
        )
      },
      {
        name: 'kimwz',
        src: getImageBase64FromCacheOrFetch(
          'https://avatars.githubusercontent.com/u/1468382?s=64&v=4'
        )
      }
    ],
    button: [
      {
        icon: markRaw(githubMark),
        link: 'https://github.com/planetarium/chrono/',
        content: '@planetarium/chrono'
      },

      {
        icon: markRaw(githubMark),
        link: 'https://github.com/tandotbt/chrono/',
        content: '@tandotbt/chrono'
      },
      {
        icon: markRaw(docsPage),
        link: 'https://chrono-docs.pages.dev/',
        content: 'Docs'
      },
      {
        icon: markRaw(DownloadIcon),
        link: 'https://github.com/tandotbt/chrono/releases/tag/v1.0.0/',
        content: 'v1.0.0'
      }
    ]
  }
})
// Hàm thử kết nối chung
function tryConnect(extension) {
  const connectExtension = {
    Chrono: () => useExtensionService.executeTryConnectChrono()
  }

  const tryConnectFunction = connectExtension[extension]
  if (tryConnectFunction) {
    tryConnectFunction()
  } else {
    console.warn(`${extension} extension chưa hỗ trợ`)
  }
}
// Hàm mở link truyền vào
function openLink(url) {
  window.open(url, '_blank')
}
import { useRouter } from 'vue-router'
const router = useRouter()

// Hook để kiểm tra trước khi rời khỏi route ngăn thank loading.Bar lỗi
router.beforeEach((to, from, next) => {
  if (isFetching.value && to.path !== '/login') {
    // Nếu đang trong quá trình fetching và đường dẫn không phải là '/login', chuyển hướng đến trang '/login'
    next('/login')
  } else {
    // Trường hợp còn lại, cho phép chuyển trang bình thường
    next()
  }
})
// Thanh loading khi fetch data
// const loadingBar = useLoadingBar()
const isFetching = computed(() => useFetchDataUser9C.isFetchingDataUser9C)
// // eslint-disable-next-line no-unused-vars
// watch(isFetching, (newValue, oldValue) => {
//   if (newValue) {
//     loadingBar.start()
//   } else {
//     loadingBar.finish()
//   }
// })

// Thanh pages
const pages = ref([
  { title: 'page.home', path: { name: 'home-route' }, icon: markRaw(HomeIcon) },
  { title: 'page.login', path: { name: 'login-route' }, icon: markRaw(LoginIcon) }
])

// Biến kiểm tra form lỗi hay không
const formRef = ref(null)
// Hiện tin nhắn (Không dùng do xung đột với use node, tắt thông báo này lại kích hoạt các kia)
// const message = useMessage()
// Hàm khi submit
function handleSubmit() {
  // e.preventDefault()
  formRef.value.validate((errors) => {
    if (!errors) {
      // message.success(t('@--views--LoginMain-vue.message.loginSuccess.span'))
      // message.success(
      //   t('@--views--LoginMain-vue.message.loginSuccess.agent', [formValue.value.user.agentAddress])
      // )
      // message.success(
      //   t('@--views--LoginMain-vue.message.loginSuccess.avatar', [
      //     formValue.value.user.avatarAddress
      //   ])
      // )

      // Truyền dữ liệu cho store
      useFetchDataUser9C.userAgent = formValue.value.user.agentAddress
      useFetchDataUser9C.userAvatar = formValue.value.user.avatarAddress
      useFetchDataUser9C.userPassword = formValue.value.user.password
      useFetchDataUser9C.serverUrl = formValue.value.server.url
      useFetchDataUser9C.serverUsername = formValue.value.server.username
      useFetchDataUser9C.serverPassword = formValue.value.server.password
    } else {
      console.log(errors)
      // message.error(t('@--views--LoginMain-vue.message.loginInvalid'))
    }
  })
}
// Dữ liệu sau Submit
const formValue = ref({
  user: {
    agentAddress: null,
    avatarAddress: null,
    password: ''
  },
  server: {
    url: '',
    username: '',
    password: ''
  }
})
// Khóa trường avatar khi load và nhập agent đỡ lỗi
const disabledAvatarWhenAgentNotOk = computed(() => {
  if (useDataArenaParticipate.isFetchingListAvatar) return true

  if (useDataArenaParticipate.isUseAvatartLogin) return false

  return useDataArenaParticipate.isUseAvatartLoginOK && !useDataArenaParticipate.isUseAvatartLogin
    ? false
    : true
})

import { whenever } from '@vueuse/core'
// Bộ lọc điều kiện
const rules = {
  user: {
    agentAddress: [
      {
        required: true,
        message: () => t('@--views--LoginMain-vue.rules.agent.required'),
        trigger: 'blur'
      },
      {
        trigger: ['input', 'blur'],
        // level: 'warning',
        level: 'error',
        validator(_rule, value) {
          value = value !== null ? value.trim() : value
          useDataArenaParticipate.isUseAvatartLoginOK = false
          const regex = /^0x[a-zA-Z0-9]+$/
          if (!regex.test(value)) {
            // Xóa nhân vật cũ khi đổi agent
            formValue.value.user.avatarAddress = null
            return new Error(t('@--views--LoginMain-vue.rules.agent.start0x'))
          }
          if (value !== null) {
            if (value.length !== 42) {
              // Xóa nhân vật cũ khi đổi agent
              formValue.value.user.avatarAddress = null
              return new Error(t('@--views--LoginMain-vue.rules.agent.length42'))
            }
          }
          if (!useDataArenaParticipate.isUseAvatartLogin) useDataArenaParticipate.address = value
          useDataArenaParticipate.isUseAvatartLoginOK = true
          return true
        }
      }
    ],
    avatarAddress: [
      {
        required: true,
        message: () => t('@--views--LoginMain-vue.rules.avatar.required'),
        trigger: 'blur'
      },
      {
        trigger: ['input', 'blur'],
        // level: 'warning',
        level: 'error',
        validator(_rule, value) {
          value = value !== null ? value.trim() : value
          useDataArenaParticipate.isUseAvatartLoginOK = false
          const regex = /^0x[a-zA-Z0-9]+$/
          if (!regex.test(value)) {
            return new Error(t('@--views--LoginMain-vue.rules.avatar.start0x'))
          }
          if (value !== null) {
            if (value.length !== 42) {
              return new Error(t('@--views--LoginMain-vue.rules.avatar.length42'))
            }
          }
          if (useDataArenaParticipate.isUseAvatartLogin) {
            // Hàm lấy agent theo avatar address
            useDataArenaParticipate.isUseAvatartLoginOK = true
            useDataArenaParticipate.address = value
            // Hàm theo dõi khi fetch xong thì lấy address
            whenever(
              computed(() => !useDataArenaParticipate.isFetchingAgentFinded),
              () => (formValue.value.user.agentAddress = useDataArenaParticipate.agentFinded)
            )
          }
          return true
        }
      }
    ],
    password: {
      required: false,
      message: 'Please input your password',
      trigger: ['input', 'blur']
    }
  },
  server: {
    url: {
      required: false,
      message: 'Please input your url server',
      trigger: 'blur'
    },
    username: {
      required: false,
      message: 'Please input your url server',
      trigger: 'blur'
    },
    password: {
      required: false,
      message: 'Please input your url server',
      trigger: 'blur'
    }
  }
}

// Danh sách các agent address đã biết
import { useDataArenaParticipateStore } from '@/stores/dataArenaParticipate'
const useDataArenaParticipate = useDataArenaParticipateStore()
function renderLabel(option) {
  return [
    option.avatarname,
    h(
      'span',
      {
        style: {
          fontSize: '80%',
          fontStyle: 'italic'
        }
      },
      {
        default: () =>
          ` ${option.avataraddress !== undefined ? option.avataraddress.slice(0, 6) : ''}` // Có lỗi khi đổi planet mà dùng cách nhập bằng avatarAddress, khi đổi nếu agentAddress ko tồn tại bên planet đổi sang thì avatar == undefined
      }
    )
  ]
}
// Hàm làm mới dữ liệu nhập khi đổi cách login
function resetValue() {
  formValue.value.user.agentAddress = null
  formValue.value.user.avatarAddress = null
  useDataArenaParticipate.isUseAvatartLoginOK = false
  formRef.value.restoreValidation()
}
// Theo dõi sự thay đổi của isUseAvatartLogin được tắt bởi webSocketBlock.js
const isUseAvatartLogin = computed(() => useDataArenaParticipate.isUseAvatartLogin)

// Hàm mở link openPythonanywhere
function openPythonanywhere() {
  let baseUrl = formValue.value.server.url || 'ninecmd'
  window.open(`https://${baseUrl}.pythonanywhere.com`, '_blank')
}

// eslint-disable-next-line no-unused-vars
watch(isUseAvatartLogin, (newValue, oldValue) => {
  resetValue()
})
</script>
<style scoped>
.carousel-img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
}
</style>
