import { defineStore } from 'pinia'

export const useHandlerMenuLeft = defineStore('handlerMenuLeft', {
    state: () => ({
        selectedKey: '1'
    }),
    actions: {
        showOption(key) {
            this.selectedKey = key
        },
    },
})
