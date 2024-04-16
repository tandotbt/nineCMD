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
          :disabled="useDataArenaParticipate.isUseAvatartLogin"
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
          :disabled="disabledAvatarWhenAgentNotOk"
        />
      </n-form-item-gi>
      <n-form-item-gi label=" " span="40 xs:35 s:30 m:20 l:20 xl:20 xxl:20">
        <n-switch
          v-model:value="useDataArenaParticipate.isUseAvatartLogin"
          @update:value="resetValue"
        >
          <template #checked>
            {{ t('@--views--LoginMain-vue.switch.checked') }}
          </template>
          <template #unchecked>
            {{ t('@--views--LoginMain-vue.switch.unchecked') }}
          </template>
        </n-switch>
      </n-form-item-gi>
      <n-grid-item span="40">
        <n-divider title-placement="left">{{ t('@--views--LoginMain-vue.divider') }}</n-divider>
      </n-grid-item>
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
  OpenInNewRound as OpenNewTab
} from '@vicons/material'
import { useLoadingBar } from 'naive-ui'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
const useFetchDataUser9C = useFetchDataUser9CStore()

// Hỗ trợ dịch
const { t } = useI18n()

// Thanh loading khi fetch data

const loadingBar = useLoadingBar()
const isFetching = computed(() => useFetchDataUser9C.isFetchingDataUser9C)
// eslint-disable-next-line no-unused-vars
watch(isFetching, (newValue, oldValue) => {
  if (newValue) {
    loadingBar.start()
  } else {
    loadingBar.finish()
  }
})

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
        default: () => ` ${option.avataraddress !== null ? option.avataraddress.slice(0, 6) : ''}`
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
