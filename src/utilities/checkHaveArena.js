function getType(row, season) {
  if (row < season)
    return 'error'
  else if (row > season)
    return 'info'
  else
    return 'success';
}

function handleError() {
  return {
    championshipId: 0,
    roundId: 0,
    titleArena: "error",
    img: "/assets/medalArena/offSeason.png",
    blockToEndSeason: "8888/8888",
    statusSeason: 'error',
    percentageSeason: 100,
    startBlockIndex: 0,
    endBlockIndex: 1,
    active: true,
    totalRound: 0,
    nowRound: 0,
    blockEndRound: 0,
    maxPurchaseCount: 40,
    maxPurchaseCountDuringInterval: 8
  };
}

import { computed } from 'vue'

export default function checkHaveArena(blockNow, dataSheet, GAME_CONFIG_daily_arena_interval, selectedPlanet) {
  try {
    const seasonAdd = computed(() => selectedPlanet === "odin" ? 4 : 1)
    const champAdd = computed(() => selectedPlanet === "odin" ? 0 : -1)
    let arenaSeasonCount = 0
    arenaSeasonCount += seasonAdd.value
    let championshipCount = 1;
    championshipCount += champAdd.value

    // Duyệt qua từng phần tử của indexedObject
    let keyArenaActive = 0
    let sameChamp = {}
    for (const [blockStart, row] of Object.entries(dataSheet)) {
      if (row['arena_type'] === "Season") {
        row.title = `Season ${arenaSeasonCount}!`;
        row.img = `https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons/Item/70${String(championshipCount).padStart(2, '0')}${String(row['round']).padStart(2, '0')}.png`;
        arenaSeasonCount++;
      } else if (row['arena_type'] === "Championship") {
        row.img = `https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons/Item/70${String(championshipCount).padStart(2, '0')}${String(row['round']).padStart(2, '0')}.png`;
        row.title = `Championship ${championshipCount++}!`
      } else if (row['arena_type'] === "OffSeason") {
        row.title = "Off season";
        row.img = "/assets/medalArena/offSeason.png";
      }
      if (blockNow > blockStart) keyArenaActive = blockStart
      // Thêm vào danh sách các mùa cùng champ
      if (!sameChamp[row['id']]) {
        sameChamp[row['id']] = [];
      }
      sameChamp[row['id']].push(blockStart);
    }
    let result = {}
    let resultAll = {}
    result['active'] = handleError()
    // Tìm ra arena đang diễn ra
    if (keyArenaActive !== 0) {

      const row = dataSheet[keyArenaActive]

      const championshipId = row['id']
      // Những arena có cùng champ
      const listSameChamp = Object.values(sameChamp[championshipId])
      for (const key of listSameChamp) {
        if (Object.prototype.hasOwnProperty.call(dataSheet, key)) {
          const season = dataSheet[key]
          const maxPurchaseCount = season['max_purchase_count']
          const maxPurchaseCountDuringInterval = season['max_purchase_count_during_interval']
          const startBlockIndex = season['start_block_index']
          const endBlockIndex = season['end_block_index']
          const totalRound = parseFloat((endBlockIndex - startBlockIndex + 1) / GAME_CONFIG_daily_arena_interval).toFixed(2)
          const nowRound = Math.floor((blockNow - startBlockIndex + 1) / GAME_CONFIG_daily_arena_interval + 1)
          const blockEndRound = GAME_CONFIG_daily_arena_interval - Math.abs(blockNow - startBlockIndex + 1 - GAME_CONFIG_daily_arena_interval * nowRound)

          const roundId = season['round']
          const titleArena = season['title']
          const img = season['img']

          resultAll[`${championshipId}_${roundId}`] = {
            championshipId,
            roundId,
            titleArena,
            img,
            blockToEndSeason: `${blockNow - startBlockIndex + 1}/${endBlockIndex - startBlockIndex + 1}`,
            statusSeason: getType(keyArenaActive, key),
            percentageSeason: ((blockNow - startBlockIndex + 1) / (endBlockIndex - startBlockIndex + 1)) * 100,
            startBlockIndex,
            endBlockIndex,
            active: keyArenaActive === key,
            totalRound,
            nowRound,
            blockEndRound,
            maxPurchaseCount,
            maxPurchaseCountDuringInterval
          }
          if (keyArenaActive === key) result['active'] = resultAll[`${championshipId}_${roundId}`]
        } else {
          resultAll[key] = handleError()
        }
      }
      result['all'] = resultAll
      return result
    }
    result['all'] = resultAll
    return result
  } catch (error) {
    console.error("Error occurred:", error);
    return handleError()
  }
}