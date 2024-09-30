import { useStorage } from '@vueuse/core'

import getListGuildFromCacheOrFetch from '@/utilities/getListGuildFromCacheOrFetch'
import caculatorScoreGuild from '@/utilities/caculatorScoreGuild'
import fillMissingKeys from '@/utilities/fillMissingKeys'
function extractNameAndTag(nameWithHash, avatarAddr) {
  const startIndex = nameWithHash.indexOf('<size=80%>') // Tìm vị trí bắt đầu của từ '<size=80%>'
  const avatarName = nameWithHash.substring(0, startIndex).trim() // Chỉ giữ lại phần trước của tên và loại bỏ khoảng trắng thừa
  const tag = avatarAddr.slice(2, 6)
  if (avatarName && tag) return `${avatarName} #${tag}`
  else 'Error'
}
const dataTempNineCMD = useStorage('nine-cmd-data-temp', {}, sessionStorage)
const exempleData =
{
  "avatarAddr": "0xabc",
  "score": 0,
  "rank": 888888,
  "winScore": 0,
  "loseScore": 0,
  "cp": 0,
  "portraitId": 10200000,
  "level": 0,
  "nameWithHash": "empty #abc",
  "avatarAddress": "0xabc",
  "win": 0,
  "lose": 0,
  "ticket": 0,
  "ticketResetCount": 0,
  "purchasedTicketCount": 0,
  "avataraddress": "0xabc",
  "currenttickets": 0,
  "purchasedTicketNCG": 0,
  "nextPTNCG": 0,
  "stake": 0,
  "purchasedTicketCountOld": 0,
  "ticketBuy": 0,
  "nameGuild": "",
  "rankGuild": 0,
  "totalCPGuild": 0,
  "totalScoreGuild": 0,
  "totalScoreGuildDiff": 0,
  "rankMember": 0,
  "winRate": -0.01
}



export default async function mergeListArena(rawArena, champIdSelect, roundIdSelect, roundActive, selectedNode, selectedPlanet, avatarAddress, maxPurchaseCountDuringIntervalActive, dataArenaWinLose, dataArenaTicketBought) {

  try {

    const rawArenaUsing = rawArena.length > 0 ? rawArena : dataArenaWinLose.arenaParticipants
    const mergedArray = rawArenaUsing.map(obj1 => {
      const obj2 = dataArenaWinLose.arenaInformation.find(obj2 => obj2.avatarAddress.toLowerCase() === obj1.avatarAddr.toLowerCase()) || {};
      return { ...obj1, ...obj2 };
    })

    const mergedArray2 = mergedArray.map(obj1 => {
      const obj2 = dataArenaTicketBought.find(obj2 => obj2.avataraddress.toLowerCase() === obj1.avatarAddr.toLowerCase()) || {};
      return { ...obj1, ...obj2 };
    });

    let result = mergedArray2.map(item => {
      if (item.ticket !== undefined && item.ticketResetCount !== undefined) {
        item.ticket = roundActive - 1 >= item.ticketResetCount ? maxPurchaseCountDuringIntervalActive : item.ticket;
        item.ticketBuy = item.purchasedTicketCountOld !== undefined ? item.purchasedTicketCount - item.purchasedTicketCountOld : -1;
      } else if (item.currenttickets) {
        item.ticket = item.currenttickets // Sử dụng thông tin vé từ jsonblod
      }
      const nameGuild = getListGuildFromCacheOrFetch(item.avatarAddr);
      item.nameGuild = nameGuild !== undefined ? nameGuild : "";
      item.nameWithHash = extractNameAndTag(item.nameWithHash, item.avatarAddr);
      return item;
    });

    // Thêm dữ liệu guild
    const listScoreGuild = caculatorScoreGuild(dataArenaWinLose.arenaParticipants)
    dataTempNineCMD.value['listGuildScore'] = listScoreGuild
    result
      .filter(member => member.nameGuild && member.nameGuild !== "")
      .forEach(member => {
        const dataScoreGuild = listScoreGuild[member.nameGuild]
        if (dataScoreGuild) {
          member.rankGuild = dataScoreGuild.rankGuild;
          member.totalCPGuild = dataScoreGuild.totalCPGuild;
          member.totalScoreGuild = dataScoreGuild.totalScoreGuild;
          member.totalScoreGuildDiff = dataScoreGuild.totalScoreGuildDiff;

          const memberData = dataScoreGuild.members.find(memberData => memberData.avatarAddress.toLowerCase() === member.avatarAddr.toLowerCase());
          if (memberData) {
            member.rankMember = memberData.rankMember;
          }
        }
      });
    // Sử dụng map để áp dụng hàm fillMissingKeys cho mỗi đối tượng trong mảng data
    let newResult = result.map(obj => fillMissingKeys(obj, exempleData));
    return newResult

  } catch (error) {
    console.error(`Error mergeListArena data: ${error}`)

    return rawArena.map(obj => fillMissingKeys(obj, exempleData))
  }
}
