import { defineStore } from 'pinia'

export const useHandlerMenuLeftStore = defineStore('handlerMenuLeftStore', {
  state: () => ({
    selectedKey: '1'
  }),
  actions: {
    showOption(key) {
      this.selectedKey = key
    }
  }
})
