import { useStorage } from '@vueuse/core';
import fillMissingKeys from './fillMissingKeys';

export default function caculatorScoreGuild(listAllArena) {
  const dataTempNineCMD = useStorage('nine-cmd-data-temp', {}, sessionStorage);
  const listGuild = dataTempNineCMD.value['listGuild'];

  // Example data for filling missing keys
  const exempleData = {
    // "nameGuild": "",
    // "agentAddress": "0xabc",
    // "avatarAddress": "0xabc",
    // "avatarAddr": "0xabc",
    "score": 0,
    // "rank": 0,
    // "winScore": 0,
    // "loseScore": 0,
    // "cp": 0,
    // "portraitId": 10200000,
    // "level": 0,
    // "nameWithHash": "empty <size=80%><color=#A68F7E>#abc</color></size>",
    // "rankMember": 10
  };

  // Map listGuild to include all required keys
  const members = listGuild.map(obj1 => {
    const obj2 = listAllArena.find(obj2 => obj2.avatarAddr.toLowerCase() === obj1.avatarAddress.toLowerCase()) || {};
    return { ...obj1, ...obj2 };
  });

  // Fill missing keys for each member
  const membersRefill = members.map(obj => fillMissingKeys(obj, exempleData));

  // Initialize guilds object to store guild information
  const guilds = {};

  // Populate guilds object with members data and calculate total scores
  membersRefill.forEach(member => {
    if (!guilds[member.nameGuild]) {
      guilds[member.nameGuild] = {
        members: [],
        totalScoreGuild: 0,
        totalCPGuild: 0,
        rankGuild: 0, // Initialize rankGuild for each guild
        totalScoreGuildDiff: 0
      };
    }

    guilds[member.nameGuild].members.push({
      ...member,
      rankMember: 0 // Initialize rankMember for each member in a guild
    });

    guilds[member.nameGuild].totalScoreGuild += member.score || 0;
    guilds[member.nameGuild].totalCPGuild += member.cp || 0;
  });

  // Sort guilds by total score
  const sortedGuilds = Object.keys(guilds).sort((a, b) => guilds[b].totalScoreGuild - guilds[a].totalScoreGuild);

  // Assign ranks to members and guilds
  let guildRank = 1;

  let memberRankOld = 0;
  let memberRankOldScore = 0;
  let guildRankOld = 0;
  let guildRankOldScore = 0;
  sortedGuilds.forEach(guildName => {
    const guild = guilds[guildName];
    let memberRank = 1;

    // Sort members of the guild by score
    guild.members.sort((a, b) => b.score - a.score);

    // Assign rank for each member in the guild
    guild.members.forEach(member => {
      if (memberRank === 1) {
        memberRankOld = 1;
        memberRankOldScore = member.score;
      }
      if (member.score === memberRankOldScore) member.rankMember = memberRankOld;
      else {
        member.rankMember = memberRank;
        memberRankOld = memberRank;
        memberRankOldScore = member.score;
      }
      memberRank++;
    });

    if (guildRank === 1) {
      guildRankOld = 1;
      guildRankOldScore = guild.totalScoreGuild;
    }
    if (guild.totalScoreGuild === guildRankOldScore) {
      guild.rankGuild = guildRankOld
      guild.totalScoreGuildDiff = guild.totalScoreGuild - guildRankOldScore
    } else {
      guild.rankGuild = guildRank;
      guildRankOld = guildRank;
      guild.totalScoreGuildDiff = guild.totalScoreGuild - guildRankOldScore
      guildRankOldScore = guild.totalScoreGuild;
    }
    guildRank++;
  });

  // Output guilds object to console
  return guilds
}
