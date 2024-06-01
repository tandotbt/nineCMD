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
    dataSheet.forEach(row => {
      if (row[2] === "Season") {
        row.title = `Season ${arenaSeasonCount}!`;
        row.img = `/assets/medalArena/70${String(championshipCount).padStart(2, '0')}${String(row[1]).padStart(2, '0')}.png`;
        arenaSeasonCount++;
      } else if (row[2] === "Championship") {
        row.img = `/assets/medalArena/70${String(championshipCount).padStart(2, '0')}${String(row[1]).padStart(2, '0')}.png`;
        row.title = `Championship ${championshipCount++}!`
      } else if (row[2] === "OffSeason") {
        row.title = "Off season";
        row.img = "/assets/medalArena/offSeason.png";
      }
    });

    const matchingRows = dataSheet.filter(row => blockNow > parseInt(row[3]) && blockNow < parseInt(row[4]));

    if (matchingRows.length > 0) {
      const row = matchingRows[0];
      const championshipId = parseInt(row[0]);

      const filteredRows = dataSheet.filter(dataRow => parseInt(dataRow[0]) === championshipId);

      const result = filteredRows.map(dataRow => {
        const maxPurchaseCount = parseInt(dataRow[9])
        const maxPurchaseCountDuringInterval = parseInt(dataRow[10])
        const startBlockIndex = parseInt(dataRow[3]);
        const endBlockIndex = parseInt(dataRow[4]);
        const totalRound = parseFloat((endBlockIndex - startBlockIndex + 1) / GAME_CONFIG_daily_arena_interval).toFixed(2);
        const nowRound = Math.floor((blockNow - startBlockIndex + 1) / GAME_CONFIG_daily_arena_interval + 1);

        const blockEndRound = GAME_CONFIG_daily_arena_interval - Math.abs(blockNow - startBlockIndex + 1 - GAME_CONFIG_daily_arena_interval * nowRound);

        return {
          championshipId: parseInt(dataRow[0]),
          roundId: parseInt(dataRow[1]),
          titleArena: dataRow.title,
          img: dataRow.img,
          blockToEndSeason: `${blockNow - startBlockIndex + 1}/${endBlockIndex - startBlockIndex + 1}`,
          statusSeason: getType((dataRow[1]), parseInt(row[1])),
          percentageSeason: ((blockNow - startBlockIndex + 1) / (endBlockIndex - startBlockIndex + 1)) * 100,
          startBlockIndex,
          endBlockIndex,
          active: parseInt(dataRow[1]) === parseInt(row[1]),
          totalRound,
          nowRound,
          blockEndRound,
          maxPurchaseCount,
          maxPurchaseCountDuringInterval
        };
      });

      return result;
    }

    return [handleError()]

  } catch (error) {
    console.error("Error occurred:", error);
    return [handleError()]
  }
}