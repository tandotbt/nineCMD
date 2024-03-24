import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useConfigURLStore } from './configURL'
import {
    COST_AP_BY_STAKE,
    COST_AP_BY_STAKE_MIN
} from '@/utilities/constants'
export const useFetchDataUser9CStore = defineStore('fetchDataUser9CStore', () => {
    const useConfigURL = useConfigURLStore()

    const agentAddress = ref('0x123')
    const avatarAddress = ref('0x123')
    const temp = ref("");
    // Sử dụng temp để lợi dụng fetch lại dữ liệu khi url thay đổi, thay đổi agent avatar thì fetch lại dữ liệu luôn
    const nodeChoosed = computed(() => useConfigURL.selectedNode + temp.value)
    const postDataJson = computed(() => {
        return {
            query: `query{stateQuery{stakeStates(addresses:"${agentAddress.value.trim()}"){deposit}agent(address:"${agentAddress.value.trim()}"){gold crystal}avatar(avatarAddress:"${avatarAddress.value.trim()}"){address actionPoint level dailyRewardReceivedIndex name stageMap{pairs count}runes{runeId level}inventory{consumables{grade id itemType itemSubType elementalType requiredBlockIndex itemId mainStat}materials{grade id itemType itemSubType elementalType requiredBlockIndex itemId}costumes{grade id itemType itemSubType elementalType requiredBlockIndex itemId equipped}equipments{grade id itemType itemSubType elementalType requiredBlockIndex setId stat{statType baseValue totalValue additionalValue}equipped itemId level exp skills{id elementalType power chance statPowerRatio referencedStatType}buffSkills{id elementalType power chance statPowerRatio referencedStatType}statsMap{hP aTK dEF cRI hIT sPD}}}itemMap{count pairs}}}}`,
        }
    })
    /* eslint-disable no-unused-vars */
    watch(postDataJson, (newValue, oldValue) => {
        // Tạo một số nguyên ngẫu nhiên từ 1 đến 3
        const randomSpaces = Math.floor(Math.random() * 3) + 1;

        // Tạo chuỗi gồm các khoảng trắng, mục đích làm url khác đi thì chắc ko cần random :v
        temp.value = " ".repeat(randomSpaces);
    })

    const useApi = (url) => {
        return useFetch(url, { refetch: true }, {
            beforeFetch({ options, cancel }) {
                // Kiểm tra điều kiện của agent và avatar để fetch hay ko
                const regex = /^0x[a-zA-Z0-9]+$/
                if (!regex.test(agentAddress.value.trim()) || !regex.test(avatarAddress.value.trim())) {
                    cancel()
                }
                if (agentAddress.value.trim().length !== 42 || avatarAddress.value.trim().length !== 42) {
                    cancel()
                }
                options.headers = {
                    ...options.headers,
                    "Content-Type": "application/json"
                }
                return options
            },
            // Lọc ra những dữ liệu cần

            afterFetch(ctx) {
                if (ctx.data.errors) {
                    ctx.data.errors.forEach(error => {
                        console.log(error.message);
                    });
                    ctx.data = null;
                } else {
                    let stakeNCG = parseFloat(ctx.data.data.stateQuery.stakeStates[0] ? ctx.data.data.stateQuery.stakeStates[0].deposit : 0)
                    let costAPNow = COST_AP_BY_STAKE_MIN; // Giả sử stake lớn hơn 500.000 ncg
                    for (let i = 0; i < COST_AP_BY_STAKE.length; i++) {
                        const { ncgStake, costAP } = COST_AP_BY_STAKE[i];
                        if (stakeNCG < ncgStake) {
                            costAPNow = costAP;
                            break; // Kết thúc vòng lặp nếu tìm thấy mốc ncgStake phù hợp
                        }
                    }
                    const defaultResponse = {
                        crystal: parseFloat(parseFloat(ctx.data.data.stateQuery.agent.crystal).toFixed(2)),
                        ncg: parseFloat(parseFloat(ctx.data.data.stateQuery.agent.gold).toFixed(2)),
                        AP: ctx.data.data.stateQuery.avatar.actionPoint,
                        blockRefillAP: ctx.data.data.stateQuery.avatar.dailyRewardReceivedIndex,
                        inventory: ctx.data.data.stateQuery.avatar.inventory,
                        itemMap: ctx.data.data.stateQuery.avatar.itemMap.pairs,
                        name: ctx.data.data.stateQuery.avatar.name,
                        level: ctx.data.data.stateQuery.avatar.level,
                        runes: ctx.data.data.stateQuery.avatar.runes,
                        stage: ctx.data.data.stateQuery.avatar.stageMap.pairs.filter(subArray => !subArray[0].toString().startsWith("100000")).length,
                        stakeNCG,
                        costAP: costAPNow
                    };
                    ctx.data = defaultResponse;
                }
                return ctx;
            }

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
