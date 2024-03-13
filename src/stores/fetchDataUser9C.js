/* eslint-disable no-unused-vars */

// after fetch sẽ lấy những dữ liệu cần, nếu ko có data sẽ trả về dữ liệu mặc định

import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useConfigURLStore } from './configURL'
export const useFetchDataUser9C = defineStore('fetchDataUser9C', () => {
    const useConfigURL = useConfigURLStore()

    const agentAddress = ref('0x123')
    const avatarAddress = ref('0x123')
    const temp = ref("");
    // Sử dụng temp để lợi dụng fetch lại dữ liệu khi url thay đổi, thay đổi agent avatar thì fetch lại dữ liệu luôn
    const nodeChoosed = computed(() => useConfigURL.selectedNode + temp.value)
    const postDataJson = computed(() => {
        return {
            query: `query{stateQuery{stakeStates(addresses:"${agentAddress.value}"){deposit}agent(address:"${agentAddress.value}"){gold crystal}avatar(avatarAddress:"${avatarAddress.value}"){address actionPoint level dailyRewardReceivedIndex name stageMap{pairs count}runes{runeId level}inventory{consumables{grade id itemType itemSubType elementalType requiredBlockIndex itemId mainStat}materials{grade id itemType itemSubType elementalType requiredBlockIndex itemId}costumes{grade id itemType itemSubType elementalType requiredBlockIndex itemId equipped}equipments{grade id itemType itemSubType elementalType requiredBlockIndex setId stat{statType baseValue totalValue additionalValue}equipped itemId level exp skills{id elementalType power chance statPowerRatio referencedStatType}buffSkills{id elementalType power chance statPowerRatio referencedStatType}statsMap{hP aTK dEF cRI hIT sPD}}}itemMap{count pairs}}}}`,
        }
    })
    watch(postDataJson, (newValue, oldValue) => {
        // Tạo một số nguyên ngẫu nhiên từ 1 đến 3
        const randomSpaces = Math.floor(Math.random() * 3) + 1;

        // Tạo chuỗi gồm các khoảng trắng và chỉ lấy phần ngắn gọn
        temp.value = " ".repeat(randomSpaces);
    })
    const useApi = (url) => {
        return useFetch(url, { refetch: true }, {
            beforeFetch({ options, cancel }) {
                // Kiểm tra điều kiện của agent và avatar để fetch hay ko
                const regex = /^0x[a-zA-Z0-9]+$/
                if (!regex.test(agentAddress.value) || !regex.test(avatarAddress.value)) {
                    cancel()
                }
                if (agentAddress.value.length !== 42 || avatarAddress.value.length !== 42) {
                    cancel()
                }
                options.headers = {
                    ...options.headers,
                    "Content-Type": "application/json"
                }
                return options
            },
            afterFetch(ctx) {
                return ctx
            },
        }).json().post(postDataJson)
    }
    const { data: dataUser9C, error: errorDataUser9C, isFetching: isFetchingDataUser9C } = useApi(nodeChoosed)


    return {
        nodeChoosed,
        agentAddress,
        avatarAddress,
        dataUser9C,
        errorDataUser9C,
        isFetchingDataUser9C,
        postDataJson,
        temp
    }

})
