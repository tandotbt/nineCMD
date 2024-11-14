export function convertToArenaParticipants(leaderboardByAvatarAddress, my_score) {
  let CPNext = 1;
  const uniqueParticipants = {};

  leaderboardByAvatarAddress.forEach((item) => {
    const avatarAddress = item.simpleAvatar.address;
    const hashedPart = avatarAddress.slice(2, 6);
    const nameWithHash = `${item.simpleAvatar.name} <size=80%><color=#A68F7E>#${hashedPart}</color></size>`;
    let winScore = 0;
    const score = item.arenaScore.score;

    if (score >= my_score) {
      winScore = 20;
    } else if (score > my_score - 100) {
      winScore = 18;
    } else {
      winScore = 16;
    }

    const participant = {
      avatarAddr: avatarAddress,
      score: item.arenaScore.score,
      rank: item.rank,
      winScore: winScore,
      loseScore: -1,
      cp: CPNext,
      portraitId: 10200000,
      level: item.simpleAvatar.level,
      nameWithHash,
    };
    // Dữ liệu mimir trả về bị lặp avatarAddress, ngăn trùng avatar
    if (
      !uniqueParticipants[avatarAddress] ||
      uniqueParticipants[avatarAddress].score < score
    ) {
      uniqueParticipants[avatarAddress] = participant;
    }

    CPNext++;
  });

  return Object.values(uniqueParticipants);
}

