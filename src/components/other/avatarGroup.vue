<template>
  <!-- :max="5" -->
  <n-avatar-group :options="options" :size="28">
    <template #avatar="{ option: { name, src } }">
      <n-tooltip>
        <template #trigger>
          <n-avatar :src="src" />
        </template>
        {{ name }}
      </n-tooltip>
    </template>
    <template #rest="{ options: restOptions, rest }">
      <n-dropdown :options="createDropdownOptions(restOptions)" placement="top">
        <n-avatar>+{{ rest }}</n-avatar>
      </n-dropdown>
    </template>
  </n-avatar-group>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    listImg: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    return {
      // {
      //     name: "Leonardo DiCaprio",
      //     src: "https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg"
      //  }
      options: props.listImg,
      createDropdownOptions: (options) =>
        options.map((option) => ({
          key: option.name,
          label: option.name
        }))
    }
  }
})
</script>
