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
          <n-input
            v-model:value="formValue.server.url"
            :placeholder="t('@--views--LoginMain-vue.placeholder.url')"
          />
          <n-input-group-label>.pythoneverywhere.com</n-input-group-label>
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
        <n-button attr-type="submit" type="primary">
          {{ t('@--views--LoginMain-vue.submit') }}
        </n-button>
      </n-form-item-gi>
    </n-grid>
  </n-form>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import breadcrumbPage from '@/components/breadcrumbPage.vue'
import { ref, markRaw, h, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { HomeRound as HomeIcon, LogInRound as LoginIcon } from '@vicons/material'

import { useFetchDataUser9C } from '@/stores/fetchDataUser9C'
const fetchDataUser9C = useFetchDataUser9C()

// Hỗ trợ dịch
const { t } = useI18n()

// Thanh pages
const pages = ref([
  { title: 'page.home', path: { name: 'home-route' }, icon: markRaw(HomeIcon) },
  { title: 'page.login', path: { name: 'login-route' }, icon: markRaw(LoginIcon) }
])

// Biến kiểm tra form lỗi hay không
const formRef = ref(null)
// Hiện tin nhắn
const message = useMessage()
// Hàm khi submit
function handleSubmit() {
  // e.preventDefault()
  formRef.value.validate((errors) => {
    if (!errors) {
      message.success(t('@--views--LoginMain-vue.message.loginSuccess.span'))
      message.success(
        t('@--views--LoginMain-vue.message.loginSuccess.agent', [formValue.value.user.agentAddress])
      )
      message.success(
        t('@--views--LoginMain-vue.message.loginSuccess.avatar', [
          formValue.value.user.avatarAddress
        ])
      )

      // Truyền dữ liệu cho store
      fetchDataUser9C.agentAddress = formValue.value.user.agentAddress
      fetchDataUser9C.avatarAddress = formValue.value.user.avatarAddress
    } else {
      console.log(errors)
      message.error('Invalid')
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
  return useDataArenaParticipate.isUseAvatartLoginOK & !useDataArenaParticipate.isUseAvatartLogin
    ? false
    : true
})
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
          useDataArenaParticipate.isUseAvatartLoginOK = false
          const regex = /^0x[a-zA-Z0-9]+$/
          if (!regex.test(value)) {
            return new Error(t('@--views--LoginMain-vue.rules.agent.start0x'))
          }
          if (value !== null) {
            if (value.length !== 42) {
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
            // Độ trễ 2s giúp điền avatar sẽ nhận đúng agent, nếu ko sẽ nhận nhầm agent của lần fetch trước
            setTimeout(() => {
              formValue.value.user.agentAddress =
                useDataArenaParticipate.isFetchingAgentFinded &&
                useDataArenaParticipate.errorAgentFinded === null
                  ? null
                  : useDataArenaParticipate.agentFinded
            }, 2000)
          }
          return true
        }
      }
    ],
    password: {
      required: false,
      message: 'Please input your age',
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
        default: () => ` ${option.avataraddress.slice(0, 6)}`
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
</script>
