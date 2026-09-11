/**
 * economyTracker.js
 * Engine toán học tính toán dòng tiền, tài nguyên tích lũy và bóc tách Liveops Events
 * theo mô hình người chơi hoàn hảo (Perfect Run - chơi không thua).
 * Hỗ trợ bật/tắt (toggle) từng sự kiện Liveops linh hoạt theo nhu cầu cân bằng game.
 */

import { DEFAULT_ECONOMY_CONFIG } from './economyEventsConfig.js';

/**
 * Chuẩn hóa phần thưởng từ format Remote Config
 */
export function normalizeReward(item) {
  const id = item.id || item.type || item.name;
  const count = item.count ?? item.amount ?? item.reward ?? 0;
  return { id, count };
}

/**
 * Phân loại phần thưởng về các kho tài nguyên core
 */
export function classifyReward(id, count) {
  switch (id) {
    case 'Coin':
      return { category: 'coin', amount: count, icon: '🪙', label: `${count.toLocaleString()} Gold` };
    case 'Heart':
    case 'HeartTime':
      return { category: 'heart', amount: count, icon: '❤️', label: `${count}m Tim vô hạn` };
    case 'LightningTime':
    case 'OTime':
    case 'ExtraTTime':
    case 'ExtraTime':
      return { category: 'speedUp', amount: count, icon: '⚡', label: `${count}m SpeedUp x2` };
    case 'Growth':
      return { category: 'booster', boosterKey: 'claw', amount: count, icon: '🦀', label: `${count} Claw (Gắp)` };
    case 'Compass':
      return { category: 'booster', boosterKey: 'hand', amount: count, icon: '🖐️', label: `${count} Hand (Đổi)` };
    case 'Magnet':
      return { category: 'booster', boosterKey: 'shuffle', amount: count, icon: '🔀', label: `${count} Shuffle (Xáo)` };
    case 'Freeze':
      return { category: 'booster', boosterKey: 'superShooter', amount: count, icon: '❄️', label: `${count} Freeze` };
    case 'Lightning':
      return { category: 'booster', boosterKey: 'superShooter', amount: count, icon: '⚡', label: `${count} Lightning` };
    case 'ExtraT':
      return { category: 'booster', boosterKey: 'addTray', amount: count, icon: '📥', label: `${count} Add Tray (Khay)` };
    default:
      if (id && id.toLowerCase().includes('coin')) return { category: 'coin', amount: count, icon: '🪙', label: `${count} Coin` };
      return { category: 'other', amount: count, icon: '🎁', label: `${count} ${id}` };
  }
}

/**
 * Helper tạo visual payload cho mốc thưởng (icon đơn lẻ hoặc rương báu)
 * @param {Array<Object>} rawRewards Danh sách reward items
 * @param {string} title Tiêu đề của mốc
 * @returns {Object} { icon, label, count, isChest, rewardItems: [{ icon, label, amount }] }
 */
export function formatMilestoneReward(rawRewards = [], title = '') {
  if (!rawRewards || rawRewards.length === 0) {
    return { icon: '🎁', label: title, count: 0, isChest: false, rewardItems: [] };
  }

  const items = rawRewards.map(r => {
    const nr = normalizeReward(r);
    const cl = classifyReward(nr.id, nr.count);
    return cl || { category: 'other', amount: nr.count, icon: '🎁', label: `${nr.count} ${nr.id}` };
  }).filter(Boolean);

  if (items.length === 0) {
    return { icon: '🎁', label: title, count: 0, isChest: false, rewardItems: [] };
  }

  if (items.length === 1) {
    const single = items[0];
    return {
      icon: single.icon,
      label: single.label,
      count: single.amount,
      isChest: false,
      rewardItems: items
    };
  }

  // Nếu có từ 2 items trở lên -> hiển thị RƯƠNG BÁU
  return {
    icon: '🧰',
    label: `${title}: ${items.length} phần thưởng`,
    count: items.length,
    isChest: true,
    rewardItems: items
  };
}

export class EconomyTracker {
  constructor(config = DEFAULT_ECONOMY_CONFIG) {
    this.config = config;
    this.enabledEvents = {
      level_wins: true,
      weekly: this.config.weeklyChallenge?.enabled ?? true,
      key_challenge: this.config.keyChallenge?.enabled ?? true,
      treasure_cave: this.config.treasureCave?.enabled ?? true,
      adventure_rush: this.config.adventureRush?.enabled ?? true,
      bear_pass: this.config.bearPass?.enabled ?? true,
      dragon_treasure: this.config.dragonTreasure?.enabled ?? true,
      magic_crafting: this.config.magicCrafting?.enabled ?? true,
      cloud_quest: this.config.cloudQuest?.enabled ?? true,
      grand_hunt: this.config.grandHunt?.enabled ?? true,
      mission_control: this.config.missionControl?.enabled ?? true,
      daily_gift: true
    };
    this.initLookups();
  }

  updateConfig(newConfig) {
    this.config = newConfig;
    if (newConfig.weeklyChallenge?.enabled !== undefined) this.enabledEvents.weekly = newConfig.weeklyChallenge.enabled;
    if (newConfig.keyChallenge?.enabled !== undefined) this.enabledEvents.key_challenge = newConfig.keyChallenge.enabled;
    if (newConfig.treasureCave?.enabled !== undefined) this.enabledEvents.treasure_cave = newConfig.treasureCave.enabled;
    if (newConfig.adventureRush?.enabled !== undefined) this.enabledEvents.adventure_rush = newConfig.adventureRush.enabled;
    if (newConfig.bearPass?.enabled !== undefined) this.enabledEvents.bear_pass = newConfig.bearPass.enabled;
    if (newConfig.dragonTreasure?.enabled !== undefined) this.enabledEvents.dragon_treasure = newConfig.dragonTreasure.enabled;
    if (newConfig.magicCrafting?.enabled !== undefined) this.enabledEvents.magic_crafting = newConfig.magicCrafting.enabled;
    if (newConfig.cloudQuest?.enabled !== undefined) this.enabledEvents.cloud_quest = newConfig.cloudQuest.enabled;
    if (newConfig.grandHunt?.enabled !== undefined) this.enabledEvents.grand_hunt = newConfig.grandHunt.enabled;
    if (newConfig.missionControl?.enabled !== undefined) this.enabledEvents.mission_control = newConfig.missionControl.enabled;
    this.initLookups();
  }

  toggleEvent(eventId, isEnabled) {
    this.enabledEvents[eventId] = !!isEnabled;
  }

  isEventEnabled(eventId) {
    return this.enabledEvents[eventId] !== false;
  }

  getEnabledEventsMap() {
    return { ...this.enabledEvents };
  }

  initLookups() {
    this.hardLevelsSet = new Set(this.config.difficultyLevels?.hard || []);
    this.superHardLevelsSet = new Set(this.config.difficultyLevels?.superHard || []);
  }

  getLevelDifficulty(level) {
    if (this.superHardLevelsSet.has(level)) return "SuperHard";
    if (this.hardLevelsSet.has(level)) return "Hard";
    if (level > 600) {
      if (level % 10 === 0) return "SuperHard";
      if (level % 10 === 4 || level % 10 === 7) return "Hard";
    }
    return "Normal";
  }

  getLevelWinCoin(level) {
    const diff = this.getLevelDifficulty(level);
    const winGoldArr = this.config.core?.winLevelGold || [25, 50, 75];
    if (diff === "SuperHard") return winGoldArr[2] ?? 75;
    if (diff === "Hard") return winGoldArr[1] ?? 50;
    return winGoldArr[0] ?? 25;
  }

  /**
   * Tính toán toàn diện trạng thái Economy tại Level targetLevel
   * @param {number} targetLevel 
   * @returns {Object} Chi tiết kho tài nguyên và phân nhóm nguồn gốc
   */
  calculateLevelEconomy(targetLevel) {
    const cfg = this.config;
    const diff = this.getLevelDifficulty(targetLevel);
    const currentWinCoin = this.getLevelWinCoin(targetLevel);

    // 1. Thống kê nguồn Coin từ màn chơi (Level Wins)
    let levelWinsCoin = 0;
    let normalWinsCount = 0;
    let hardWinsCount = 0;
    let superHardWinsCount = 0;

    for (let l = 1; l <= targetLevel; l++) {
      const d = this.getLevelDifficulty(l);
      const c = this.getLevelWinCoin(l);
      if (this.isEventEnabled('level_wins')) {
        levelWinsCoin += c;
      }
      if (d === "SuperHard") superHardWinsCount++;
      else if (d === "Hard") hardWinsCount++;
      else normalWinsCount++;
    }

    // 2. Key Challenge Rewards
    let keyChallengeCoin = 0;
    let keyChallengeHeartMinutes = 0;
    const keyChallengeBoosters = { claw: 0, hand: 0, shuffle: 0, superShooter: 0, addTray: 0 };
    let keyChallengeMilestonesAchieved = 0;
    let currentKeys = 0;
    let nextKeyMilestone = null;

    const kcUnlock = cfg.keyChallenge?.levelUnlocked ?? 40;
    const keysPerWin = (cfg.keyChallenge?.keyEachWin ?? 3) + (cfg.keyChallenge?.keyExtraFirstWin ?? 1);

    if (this.isEventEnabled('key_challenge') && targetLevel >= kcUnlock) {
      const levelsInKC = targetLevel - kcUnlock + 1;
      currentKeys = levelsInKC * keysPerWin;
      const rewardsList = cfg.keyChallenge?.rewards || [];
      rewardsList.forEach((r) => {
        if (currentKeys >= r.key) {
          keyChallengeMilestonesAchieved++;
          if (r.type === "Gold") keyChallengeCoin += r.amount;
          else if (r.type === "Heart") keyChallengeHeartMinutes += r.amount;
          else if (r.type === "Booster") {
            if (r.boosterId === 0) keyChallengeBoosters.claw += r.amount;
            else if (r.boosterId === 1) keyChallengeBoosters.hand += r.amount;
            else if (r.boosterId === 2) keyChallengeBoosters.shuffle += r.amount;
            else if (r.boosterId === 3) keyChallengeBoosters.superShooter += r.amount;
          }
        } else if (!nextKeyMilestone) {
          nextKeyMilestone = {
            step: r.step,
            targetKey: r.key,
            keysNeeded: r.key - currentKeys,
            rewardName: r.name || `${r.amount} ${r.type}`
          };
        }
      });
    }

    // 3. Treasure Cave Rewards
    let treasureCaveCoin = 0;
    let tcStreaksCompleted = 0;
    let currentTcStreak = 0;
    const tcUnlock = cfg.treasureCave?.levelUnlocked ?? 67;
    const maxStreak = cfg.treasureCave?.maxStreak ?? 7;
    const winReward = cfg.treasureCave?.expectedWinReward ?? 180;

    if (this.isEventEnabled('treasure_cave') && targetLevel >= tcUnlock) {
      const levelsInTC = targetLevel - tcUnlock + 1;
      tcStreaksCompleted = Math.floor(levelsInTC / maxStreak);
      currentTcStreak = levelsInTC % maxStreak;
      treasureCaveCoin = tcStreaksCompleted * winReward;
    }

    // 4. Weekly Challenge
    let weeklyCoin = 0;
    let weeklyHeartMinutes = 0;
    const weeklyBoosters = { claw: 0, hand: 0, shuffle: 0, superShooter: 0, addTray: 0 };
    const weeklyUnlock = cfg.weeklyChallenge?.levelUnlocked ?? 11;
    const weeklyCycle = cfg.weeklyChallenge?.cycleLevels ?? 20;

    if (this.isEventEnabled('weekly') && targetLevel >= weeklyUnlock) {
      const levelsInWeekly = targetLevel - weeklyUnlock + 1;
      const cycles = Math.floor(levelsInWeekly / weeklyCycle);
      const rwd = cfg.weeklyChallenge?.rewardsPerCycle || {};
      weeklyCoin = cycles * (rwd.gold || 0);
      weeklyHeartMinutes = cycles * (rwd.heartMinutes || 0);
      if (rwd.boosters) {
        weeklyBoosters.claw = cycles * (rwd.boosters.claw || 0);
        weeklyBoosters.hand = cycles * (rwd.boosters.hand || 0);
        weeklyBoosters.shuffle = cycles * (rwd.boosters.shuffle || 0);
        weeklyBoosters.superShooter = cycles * (rwd.boosters.superShooter || 0);
      }
    }

    // 5. Daily Free Coin
    const levelsPerDay = cfg.dailyFreeCoin?.estimatedLevelsPerDay ?? 15;
    const daysPlayed = Math.max(1, Math.floor(targetLevel / levelsPerDay));
    const dailyCoinAmount = this.isEventEnabled('daily_gift')
      ? daysPlayed * (cfg.dailyFreeCoin?.coinPerDay ?? 100)
      : 0;

    // 6. Adventure Rush (Collect Object, 30 checkpoints)
    let advCoin = 0;
    let advHeartMinutes = 0;
    let advSpeedUpMinutes = 0;
    const advBoosters = { claw: 0, hand: 0, shuffle: 0, superShooter: 0, addTray: 0 };
    let advCheckpointsDone = 0;
    const advUnlock = cfg.adventureRush?.levelUnlocked ?? 20;
    const advRate = cfg.adventureRush?.collectRatePerLevel ?? 15;

    if (this.isEventEnabled('adventure_rush') && targetLevel >= advUnlock && cfg.adventureRush?.data?.Checkpoints) {
      let cumulativeMission = 0;
      cfg.adventureRush.data.Checkpoints.forEach(cp => {
        cumulativeMission += cp.mission;
        const estLevel = advUnlock + Math.ceil(cumulativeMission / advRate);
        if (targetLevel >= estLevel) {
          advCheckpointsDone++;
          const nr = normalizeReward(cp);
          const c = classifyReward(nr.id, nr.count);
          if (c) {
            if (c.category === 'coin') advCoin += c.amount;
            else if (c.category === 'heart') advHeartMinutes += c.amount;
            else if (c.category === 'speedUp') advSpeedUpMinutes += c.amount;
            else if (c.category === 'booster') advBoosters[c.boosterKey] += c.amount;
          }
        }
      });
    }

    // 7. Bear Pass (Mission Pass, 31 checkpoints, Unlock Lvl 36)
    let bpCoin = 0;
    let bpHeartMinutes = 0;
    let bpSpeedUpMinutes = 0;
    const bpBoosters = { claw: 0, hand: 0, shuffle: 0, superShooter: 0, addTray: 0 };
    let bpCheckpointsDone = 0;
    const bpUnlock = cfg.bearPass?.levelUnlocked ?? 36;

    if (this.isEventEnabled('bear_pass') && targetLevel >= bpUnlock && cfg.bearPass?.data?.checkpoints) {
      let cumulativeWinsReq = 0;
      cfg.bearPass.data.checkpoints.forEach((cp, idx) => {
        const m = cp.checkpoint?.missions?.[0] || 'L,1';
        const stepWins = parseInt(m.split(',')[1] || '1', 10);
        cumulativeWinsReq += stepWins;
        const estLevel = bpUnlock + cumulativeWinsReq;
        if (targetLevel >= estLevel) {
          bpCheckpointsDone++;
          (cp.checkpoint?.freeUnified || []).forEach(item => {
            const nr = normalizeReward(item);
            const c = classifyReward(nr.id, nr.count);
            if (c) {
              if (c.category === 'coin') bpCoin += c.amount;
              else if (c.category === 'heart') bpHeartMinutes += c.amount;
              else if (c.category === 'speedUp') bpSpeedUpMinutes += c.amount;
              else if (c.category === 'booster') bpBoosters[c.boosterKey] += c.amount;
            }
          });
        }
      });
    }

    // 8. Dragon Treasure (Win streak pool, Unlock Lvl 61, cycle 10 levels)
    let dtCoin = 0;
    let dtPoolsWon = 0;
    const dtUnlock = cfg.dragonTreasure?.levelUnlocked ?? 61;
    const dtCycle = 10;
    const dtShareReward = 2000;

    if (this.isEventEnabled('dragon_treasure') && targetLevel >= dtUnlock) {
      const levelsInDt = targetLevel - dtUnlock + 1;
      dtPoolsWon = Math.floor(levelsInDt / dtCycle);
      dtCoin = dtPoolsWon * dtShareReward;
    }

    // 9. Magic Crafting (15 stages, Unlock Lvl 81)
    let mcCoin = 0;
    let mcHeartMinutes = 0;
    let mcSpeedUpMinutes = 0;
    const mcBoosters = { claw: 0, hand: 0, shuffle: 0, superShooter: 0, addTray: 0 };
    let mcStagesDone = 0;
    const mcUnlock = cfg.magicCrafting?.levelUnlocked ?? 81;

    if (this.isEventEnabled('magic_crafting') && targetLevel >= mcUnlock && cfg.magicCrafting?.data?.stages) {
      let cumulativeLevels = mcUnlock;
      cfg.magicCrafting.data.stages.forEach(stage => {
        cumulativeLevels += (stage.totalType || 4);
        if (targetLevel >= cumulativeLevels) {
          mcStagesDone++;
          (stage.rewardList || []).forEach(item => {
            const nr = normalizeReward(item);
            const c = classifyReward(nr.id, nr.count);
            if (c) {
              if (c.category === 'coin') mcCoin += c.amount;
              else if (c.category === 'heart') mcHeartMinutes += c.amount;
              else if (c.category === 'speedUp') mcSpeedUpMinutes += c.amount;
              else if (c.category === 'booster') mcBoosters[c.boosterKey] += c.amount;
            }
          });
        }
      });
      if (mcStagesDone >= cfg.magicCrafting.data.stages.length && cfg.magicCrafting.data.bigReward) {
        cfg.magicCrafting.data.bigReward.forEach(item => {
          const nr = normalizeReward(item);
          const c = classifyReward(nr.id, nr.count);
          if (c && c.category === 'booster') mcBoosters[c.boosterKey] += c.amount;
        });
      }
    }

    // 10. Cloud Quest (Win Streak, Unlock Lvl 101, 10 checkpoints)
    let cqCoin = 0;
    let cqHeartMinutes = 0;
    let cqSpeedUpMinutes = 0;
    const cqBoosters = { claw: 0, hand: 0, shuffle: 0, superShooter: 0, addTray: 0 };
    let cqCheckpointsDone = 0;
    const cqUnlock = cfg.cloudQuest?.levelUnlocked ?? 101;

    if (this.isEventEnabled('cloud_quest') && targetLevel >= cqUnlock && cfg.cloudQuest?.data?.checkpoints) {
      let cumulativeStreak = 0;
      cfg.cloudQuest.data.checkpoints.forEach(cp => {
        cumulativeStreak += (cp.winStreakCount || 3);
        const estLevel = cqUnlock + cumulativeStreak;
        if (targetLevel >= estLevel) {
          cqCheckpointsDone++;
          (cp.rewards || []).forEach(item => {
            const nr = normalizeReward(item);
            const c = classifyReward(nr.id, nr.count);
            if (c) {
              if (c.category === 'coin') cqCoin += c.amount;
              else if (c.category === 'heart') cqHeartMinutes += c.amount;
              else if (c.category === 'speedUp') cqSpeedUpMinutes += c.amount;
              else if (c.category === 'booster') cqBoosters[c.boosterKey] += c.amount;
            }
          });
        }
      });
    }

    // 11. Grand Hunt (Space Mission, Unlock Lvl 121, 3 stages)
    let ghCoin = 0;
    let ghHeartMinutes = 0;
    let ghSpeedUpMinutes = 0;
    const ghBoosters = { claw: 0, hand: 0, shuffle: 0, superShooter: 0, addTray: 0 };
    let ghStagesDone = 0;
    const ghUnlock = cfg.grandHunt?.levelUnlocked ?? 121;

    if (this.isEventEnabled('grand_hunt') && targetLevel >= ghUnlock && cfg.grandHunt?.data?.stageConfig) {
      let cumulativeStep = ghUnlock;
      cfg.grandHunt.data.stageConfig.forEach(stage => {
        cumulativeStep += (stage.numOfStepToFinish || 10);
        if (targetLevel >= cumulativeStep) {
          ghStagesDone++;
          (stage.rewardList || []).forEach(item => {
            const nr = normalizeReward(item);
            const c = classifyReward(nr.id, nr.count);
            if (c) {
              if (c.category === 'coin') ghCoin += c.amount;
              else if (c.category === 'heart') ghHeartMinutes += c.amount;
              else if (c.category === 'speedUp') ghSpeedUpMinutes += c.amount;
              else if (c.category === 'booster') ghBoosters[c.boosterKey] += c.amount;
            }
          });
        }
      });
    }

    // 12. Mission Control (Unlock Lvl 131, 4 stages + Final Chest)
    let mctrlCoin = 0;
    let mctrlHeartMinutes = 0;
    let mctrlSpeedUpMinutes = 0;
    const mctrlBoosters = { claw: 0, hand: 0, shuffle: 0, superShooter: 0, addTray: 0 };
    let mctrlStagesDone = 0;
    const mctrlUnlock = cfg.missionControl?.levelUnlocked ?? 131;
    const mctrlStepLevels = [135, 142, 150, 160];

    if (this.isEventEnabled('mission_control') && targetLevel >= mctrlUnlock && cfg.missionControl?.data?.stage_chest) {
      cfg.missionControl.data.stage_chest.forEach((stage, idx) => {
        const stageLvl = mctrlStepLevels[idx] || (mctrlUnlock + (idx + 1) * 7);
        if (targetLevel >= stageLvl) {
          mctrlStagesDone++;
          (stage.rewards || []).forEach(item => {
            const nr = normalizeReward(item);
            const c = classifyReward(nr.id, nr.count);
            if (c) {
              if (c.category === 'coin') mctrlCoin += c.amount;
              else if (c.category === 'heart') mctrlHeartMinutes += c.amount;
              else if (c.category === 'speedUp') mctrlSpeedUpMinutes += c.amount;
              else if (c.category === 'booster') mctrlBoosters[c.boosterKey] += c.amount;
            }
          });
        }
      });
      if (targetLevel >= 170 && cfg.missionControl?.data?.final_chest?.rewards) {
        cfg.missionControl.data.final_chest.rewards.forEach(item => {
          const nr = normalizeReward(item);
          const c = classifyReward(nr.id, nr.count);
          if (c) {
            if (c.category === 'coin') mctrlCoin += c.amount;
            else if (c.category === 'heart') mctrlHeartMinutes += c.amount;
            else if (c.category === 'speedUp') mctrlSpeedUpMinutes += c.amount;
            else if (c.category === 'booster') mctrlBoosters[c.boosterKey] += c.amount;
          }
        });
      }
    }

    // Tổng Coin lũy kế
    const totalCoin = levelWinsCoin + keyChallengeCoin + treasureCaveCoin + weeklyCoin + dailyCoinAmount +
                      advCoin + bpCoin + dtCoin + mcCoin + cqCoin + ghCoin + mctrlCoin;

    // Booster Unlock status & Tổng Booster
    const bUnlocks = cfg.boosterUnlocks || {};
    const unlockedBoosters = [];
    const baseGiftBoosters = { claw: 0, hand: 0, shuffle: 0, superShooter: 0, addTray: 1 };
    
    if (targetLevel >= (bUnlocks.addTray ?? 1)) unlockedBoosters.push('AddTray');
    if (targetLevel >= (bUnlocks.claw ?? 7)) { unlockedBoosters.push('Claw'); baseGiftBoosters.claw = 1; }
    if (targetLevel >= (bUnlocks.hand ?? 13)) { unlockedBoosters.push('Hand'); baseGiftBoosters.hand = 1; }
    if (targetLevel >= (bUnlocks.shuffle ?? 15)) { unlockedBoosters.push('Shuffle'); baseGiftBoosters.shuffle = 1; }
    if (targetLevel >= (bUnlocks.superShooter ?? 18)) { unlockedBoosters.push('SuperShooter'); baseGiftBoosters.superShooter = 1; }

    const totalBoosters = {
      claw: baseGiftBoosters.claw + keyChallengeBoosters.claw + weeklyBoosters.claw + advBoosters.claw + bpBoosters.claw + mcBoosters.claw + cqBoosters.claw + ghBoosters.claw + mctrlBoosters.claw,
      hand: baseGiftBoosters.hand + keyChallengeBoosters.hand + weeklyBoosters.hand + advBoosters.hand + bpBoosters.hand + mcBoosters.hand + cqBoosters.hand + ghBoosters.hand + mctrlBoosters.hand,
      shuffle: baseGiftBoosters.shuffle + keyChallengeBoosters.shuffle + weeklyBoosters.shuffle + advBoosters.shuffle + bpBoosters.shuffle + mcBoosters.shuffle + cqBoosters.shuffle + ghBoosters.shuffle + mctrlBoosters.shuffle,
      superShooter: baseGiftBoosters.superShooter + keyChallengeBoosters.superShooter + weeklyBoosters.superShooter + advBoosters.superShooter + bpBoosters.superShooter + mcBoosters.superShooter + cqBoosters.superShooter + ghBoosters.superShooter + mctrlBoosters.superShooter,
      addTray: baseGiftBoosters.addTray + keyChallengeBoosters.addTray + weeklyBoosters.addTray + advBoosters.addTray + bpBoosters.addTray + mcBoosters.addTray + cqBoosters.addTray + ghBoosters.addTray + mctrlBoosters.addTray
    };

    // Tim & SpeedUp
    const totalUnlimitedHeartMinutes = keyChallengeHeartMinutes + weeklyHeartMinutes + advHeartMinutes + bpHeartMinutes + mcHeartMinutes + cqHeartMinutes + ghHeartMinutes + mctrlHeartMinutes;
    const baseSpeedUpMinutes = targetLevel >= (cfg.speedUp?.levelUnlocked ?? 1) ? (cfg.speedUp?.newPlayerTimeMin ?? 20) : 0;
    const totalSpeedUpMinutes = baseSpeedUpMinutes + advSpeedUpMinutes + bpSpeedUpMinutes + mcSpeedUpMinutes + cqSpeedUpMinutes + ghSpeedUpMinutes + mctrlSpeedUpMinutes;

    // Cảnh báo Sink & Khuyến nghị GD
    const sinkWarnings = [];
    const bPrices = cfg.core?.boosterPrices || [600, 600, 600, 600, 900];
    if (diff === "SuperHard") {
      sinkWarnings.push(`🔴 Màn Super Hard: Khuyến nghị chuẩn bị ít nhất 1 Booster Super Shooter hoặc Hand (Giá shop: ${bPrices[3]} Gold)`);
    } else if (diff === "Hard") {
      sinkWarnings.push(`🟠 Màn Hard: Nên có sẵn 1 Booster Hand hoặc Shuffle (Giá shop: ${bPrices[1]} Gold)`);
    }

    if (this.isEventEnabled('treasure_cave') && targetLevel >= tcUnlock) {
      sinkWarnings.push(`💎 Treasure Cave đang active: Cần dự phòng ${cfg.treasureCave?.reviveCost || 900} Gold để hồi sinh nếu đứt chuỗi 7 ván.`);
    }

    let healthRating = "Healthy";
    let healthNote = "Tài nguyên dồi dào, đáp ứng tốt mọi tình huống.";
    if (totalCoin < 600) {
      healthRating = "Tight";
      healthNote = "Cần tiết kiệm, chưa đủ tiền mua 1 booster dự phòng.";
    } else if (totalCoin < 1500 && diff !== "Normal") {
      healthRating = "Balanced";
      healthNote = "Đủ mua 1-2 booster nhưng cần cân nhắc trước màn khó.";
    }

    return {
      level: targetLevel,
      difficulty: diff,
      currentWinCoin,
      cumulative: {
        totalCoin,
        boosters: totalBoosters,
        unlimitedHeartMinutes: totalUnlimitedHeartMinutes,
        speedUpMinutes: totalSpeedUpMinutes
      },
      breakdownBySource: {
        levelWins: {
          coin: levelWinsCoin,
          normalCount: normalWinsCount,
          hardCount: hardWinsCount,
          superHardCount: superHardWinsCount,
          enabled: this.isEventEnabled('level_wins')
        },
        keyChallenge: {
          coin: keyChallengeCoin,
          boosters: keyChallengeBoosters,
          heartMinutes: keyChallengeHeartMinutes,
          milestonesDone: keyChallengeMilestonesAchieved,
          currentKeys,
          nextMilestone: nextKeyMilestone,
          enabled: this.isEventEnabled('key_challenge')
        },
        treasureCave: {
          coin: treasureCaveCoin,
          streaksCompleted: tcStreaksCompleted,
          currentStreak: currentTcStreak,
          maxStreak,
          enabled: this.isEventEnabled('treasure_cave')
        },
        weeklyChallenge: {
          coin: weeklyCoin,
          boosters: weeklyBoosters,
          heartMinutes: weeklyHeartMinutes,
          enabled: this.isEventEnabled('weekly')
        },
        adventureRush: {
          coin: advCoin,
          boosters: advBoosters,
          heartMinutes: advHeartMinutes,
          speedUpMinutes: advSpeedUpMinutes,
          checkpointsDone: advCheckpointsDone,
          enabled: this.isEventEnabled('adventure_rush')
        },
        bearPass: {
          coin: bpCoin,
          boosters: bpBoosters,
          heartMinutes: bpHeartMinutes,
          speedUpMinutes: bpSpeedUpMinutes,
          checkpointsDone: bpCheckpointsDone,
          enabled: this.isEventEnabled('bear_pass')
        },
        dragonTreasure: {
          coin: dtCoin,
          poolsWon: dtPoolsWon,
          enabled: this.isEventEnabled('dragon_treasure')
        },
        magicCrafting: {
          coin: mcCoin,
          boosters: mcBoosters,
          heartMinutes: mcHeartMinutes,
          speedUpMinutes: mcSpeedUpMinutes,
          stagesDone: mcStagesDone,
          enabled: this.isEventEnabled('magic_crafting')
        },
        cloudQuest: {
          coin: cqCoin,
          boosters: cqBoosters,
          heartMinutes: cqHeartMinutes,
          speedUpMinutes: cqSpeedUpMinutes,
          checkpointsDone: cqCheckpointsDone,
          enabled: this.isEventEnabled('cloud_quest')
        },
        grandHunt: {
          coin: ghCoin,
          boosters: ghBoosters,
          heartMinutes: ghHeartMinutes,
          speedUpMinutes: ghSpeedUpMinutes,
          stagesDone: ghStagesDone,
          enabled: this.isEventEnabled('grand_hunt')
        },
        missionControl: {
          coin: mctrlCoin,
          boosters: mctrlBoosters,
          heartMinutes: mctrlHeartMinutes,
          speedUpMinutes: mctrlSpeedUpMinutes,
          stagesDone: mctrlStagesDone,
          enabled: this.isEventEnabled('mission_control')
        },
        dailyFreeGifts: {
          coin: dailyCoinAmount,
          estimatedDays: daysPlayed,
          enabled: this.isEventEnabled('daily_gift')
        }
      },
      unlockedBoosters,
      sinkWarnings,
      healthStatus: {
        rating: healthRating,
        note: healthNote
      }
    };
  }

  /**
   * Sinh dữ liệu các hàng Liveops Event phục vụ vẽ bảng ma trận
   * @param {number} maxLevel 
   * @returns {Array<Object>} Mảng cấu hình các hàng sự kiện
   */
  getEventRows(maxLevel = 100) {
    const cfg = this.config;
    const bUnlocks = cfg.boosterUnlocks || {};
    const rows = [];

    const makeRowCells = (levelCheckFn) => {
      const cells = [];
      for (let l = 1; l <= maxLevel; l++) {
        cells.push(levelCheckFn(l));
      }
      return cells;
    };

    // 1. Thưởng ván thắng (Level Wins)
    if (this.isEventEnabled('level_wins')) {
      rows.push({
        id: 'level_wins',
        label: 'Thưởng ván thắng',
        icon: '🪙',
        color: '#f59e0b',
        cells: makeRowCells((l) => {
          const diff = this.getLevelDifficulty(l);
          const coin = this.getLevelWinCoin(l);
          const rwd = formatMilestoneReward([{ id: 'Coin', count: coin }], `Level ${l} Win`);
          return {
            level: l,
            active: true,
            isMilestone: false,
            text: `+${coin}`,
            reward: rwd,
            badge: diff === 'SuperHard' ? '🔴' : diff === 'Hard' ? '🟠' : '🟢',
            tooltip: `Level ${l} (${diff}): Thắng nhận +${coin} Gold`
          };
        })
      });
    }

    // 2. Mở khóa Booster (System)
    rows.push({
      id: 'booster_unlock',
      label: 'Mở khóa Booster',
      icon: '🧰',
      color: '#8b5cf6',
      cells: makeRowCells((l) => {
        let text = '';
        let tooltip = '';
        let rwd = null;
        if (l === (bUnlocks.addTray ?? 1)) {
          text = 'Add Tray';
          tooltip = 'Mở khóa Tray chứa Shooter phụ (ID 4)';
          rwd = formatMilestoneReward([{ id: 'ExtraT', count: 1 }], 'Mở khóa Add Tray');
        } else if (l === (bUnlocks.claw ?? 7)) {
          text = 'Claw';
          tooltip = 'Mở khóa Booster Claw (Gắp bưu kiện - ID 0)';
          rwd = formatMilestoneReward([{ id: 'Growth', count: 1 }], 'Mở khóa Claw');
        } else if (l === (bUnlocks.hand ?? 13)) {
          text = 'Hand';
          tooltip = 'Mở khóa Booster Hand (Đổi bưu kiện - ID 1)';
          rwd = formatMilestoneReward([{ id: 'Compass', count: 1 }], 'Mở khóa Hand');
        } else if (l === (bUnlocks.shuffle ?? 15)) {
          text = 'Shuffle';
          tooltip = 'Mở khóa Booster Shuffle (Xáo trộn bưu kiện - ID 2)';
          rwd = formatMilestoneReward([{ id: 'Magnet', count: 1 }], 'Mở khóa Shuffle');
        } else if (l === (bUnlocks.superShooter ?? 18)) {
          text = 'Super';
          tooltip = 'Mở khóa Booster Super Shooter (Đóng băng/Bắn dọn màu - ID 3)';
          rwd = formatMilestoneReward([{ id: 'Freeze', count: 1 }], 'Mở khóa Super Shooter');
        }

        return {
          level: l,
          active: !!text,
          isMilestone: !!text,
          text,
          reward: rwd,
          tooltip: tooltip || `Đã mở khóa: ${l >= 18 ? '5/5' : l >= 15 ? '4/5' : l >= 13 ? '3/5' : l >= 7 ? '2/5' : '1/5'} Boosters`
        };
      })
    });

    // 3. Weekly Challenge (Unlock Lvl 11)
    if (this.isEventEnabled('weekly')) {
      const weeklyUnlock = cfg.weeklyChallenge?.levelUnlocked ?? 11;
      const cycleLevels = cfg.weeklyChallenge?.cycleLevels ?? 20;
      rows.push({
        id: 'weekly',
        label: 'Weekly Challenge',
        icon: '🏆',
        color: '#3b82f6',
        cells: makeRowCells((l) => {
          const isUnlocked = l >= weeklyUnlock;
          const isMilestone = isUnlocked && ((l - weeklyUnlock + 1) % cycleLevels === 0);
          let rwd = null;
          if (isMilestone) {
            rwd = formatMilestoneReward([
              { id: 'Coin', count: 300 },
              { id: 'Heart', count: 30 },
              { id: 'Growth', count: 1 },
              { id: 'Compass', count: 1 },
              { id: 'Magnet', count: 1 },
              { id: 'Freeze', count: 1 }
            ], 'Weekly Challenge Rewards');
          }
          return {
            level: l,
            active: isUnlocked,
            isMilestone,
            reward: rwd,
            text: l === weeklyUnlock ? '🔓 Unlock' : (isMilestone ? '🎁 Rương' : ''),
            tooltip: l === weeklyUnlock ? 'Level 11: Mở khóa Weekly Challenge' : (isMilestone ? 'Hoàn thành chặng tuần: Thưởng 300 Gold + 30m Tim + 4 Boosters' : 'Weekly Challenge Active')
          };
        })
      });
    }

    // 4. Adventure Rush (Unlock Lvl 20, 30 checkpoints)
    if (this.isEventEnabled('adventure_rush') && cfg.adventureRush?.data?.Checkpoints) {
      const advUnlock = cfg.adventureRush?.levelUnlocked ?? 20;
      const advRate = cfg.adventureRush?.collectRatePerLevel ?? 15;
      const advCpMap = new Map();
      let cumMission = 0;
      cfg.adventureRush.data.Checkpoints.forEach(cp => {
        cumMission += cp.mission;
        const estLevel = advUnlock + Math.ceil(cumMission / advRate);
        advCpMap.set(estLevel, cp);
      });

      rows.push({
        id: 'adventure_rush',
        label: 'Adventure Rush (30 CPs)',
        icon: '🧭',
        color: '#14b8a6',
        cells: makeRowCells((l) => {
          const isUnlocked = l >= advUnlock;
          const cp = advCpMap.get(l);
          let rwd = null;
          if (cp) {
            rwd = formatMilestoneReward([cp], `Adventure Rush CP ${cp.name}`);
          }
          return {
            level: l,
            active: isUnlocked,
            isMilestone: !!cp,
            reward: rwd,
            text: l === advUnlock ? '🔓 Unlock' : (cp ? `CP${cp.name}` : ''),
            tooltip: l === advUnlock ? 'Level 20: Mở khóa Adventure Rush (Thu thập icon)' : (cp ? `Adventure Rush CP ${cp.name}: Thưởng ${cp.reward} ${cp.type}` : (isUnlocked ? 'Adventure Rush Active' : 'Khóa (Mở ở Lvl 20)'))
          };
        })
      });
    }

    // 5. Bear Pass (Unlock Lvl 36, 31 checkpoints)
    if (this.isEventEnabled('bear_pass') && cfg.bearPass?.data?.checkpoints) {
      const bpUnlock = cfg.bearPass?.levelUnlocked ?? 36;
      const bpCpMap = new Map();
      let cumWins = 0;
      cfg.bearPass.data.checkpoints.forEach((cp, idx) => {
        const m = cp.checkpoint?.missions?.[0] || 'L,1';
        cumWins += parseInt(m.split(',')[1] || '1', 10);
        const estLvl = bpUnlock + cumWins;
        bpCpMap.set(estLvl, { step: idx + 1, free: cp.checkpoint?.freeUnified });
      });

      rows.push({
        id: 'bear_pass',
        label: 'Bear Pass (Season Pass)',
        icon: '🐻',
        color: '#f97316',
        cells: makeRowCells((l) => {
          const isUnlocked = l >= bpUnlock;
          const cp = bpCpMap.get(l);
          let rwd = null;
          if (cp) {
            rwd = formatMilestoneReward(cp.free || [], `Bear Pass Mốc ${cp.step}`);
          }
          return {
            level: l,
            active: isUnlocked,
            isMilestone: !!cp,
            reward: rwd,
            text: l === bpUnlock ? '🔓 Unlock' : (cp ? `M${cp.step}` : ''),
            tooltip: l === bpUnlock ? 'Level 36: Mở khóa Bear Pass (31 Mốc thưởng)' : (cp ? `Bear Pass Mốc ${cp.step}: Thưởng Free Unified Pack` : (isUnlocked ? 'Bear Pass Active' : 'Khóa (Mở ở Lvl 36)'))
          };
        })
      });
    }

    // 6. Key Challenge (Unlock Lvl 40)
    if (this.isEventEnabled('key_challenge')) {
      const kcUnlock = cfg.keyChallenge?.levelUnlocked ?? 40;
      const keysPerWin = (cfg.keyChallenge?.keyEachWin ?? 3) + (cfg.keyChallenge?.keyExtraFirstWin ?? 1);
      rows.push({
        id: 'key_challenge',
        label: 'Key Challenge (Milestones)',
        icon: '🗝️',
        color: '#10b981',
        cells: makeRowCells((l) => {
          const isUnlocked = l >= kcUnlock;
          let text = '';
          let tooltip = '';
          let isMilestone = false;
          let rwd = null;
          if (l === kcUnlock) {
            text = '🔓 Unlock';
            tooltip = 'Level 40: Mở khóa Key Challenge';
          } else if (isUnlocked) {
            const currentTotalKeys = (l - kcUnlock + 1) * keysPerWin;
            const prevTotalKeys = (l - kcUnlock) * keysPerWin;
            const rewards = cfg.keyChallenge?.rewards || [];
            const hit = rewards.filter(r => currentTotalKeys >= r.key && prevTotalKeys < r.key);
            if (hit.length > 0) {
              isMilestone = true;
              const last = hit[hit.length - 1];
              text = `M${last.step}`;
              tooltip = `Key Challenge Milestone ${last.step}: ${last.name}`;
              // Map reward item
              let mappedItem = { id: 'Coin', count: last.amount };
              if (last.type === 'Heart') mappedItem = { id: 'Heart', count: last.amount };
              else if (last.type === 'Booster') {
                const bIds = ['Growth', 'Compass', 'Magnet', 'Freeze'];
                mappedItem = { id: bIds[last.boosterId] || 'Growth', count: last.amount };
              }
              rwd = formatMilestoneReward([mappedItem], `Key Challenge Mốc ${last.step}`);
            }
          }
          return {
            level: l,
            active: isUnlocked,
            isMilestone,
            reward: rwd,
            text,
            tooltip: tooltip || (isUnlocked ? `Key Challenge Active (${(l - kcUnlock + 1) * keysPerWin} Keys)` : `Khóa (Mở ở Lvl ${kcUnlock})`)
          };
        })
      });
    }

    // 7. Dragon Treasure (Unlock Lvl 61, Streak Pool 10k)
    if (this.isEventEnabled('dragon_treasure')) {
      const dtUnlock = cfg.dragonTreasure?.levelUnlocked ?? 61;
      rows.push({
        id: 'dragon_treasure',
        label: 'Dragon Treasure (Pool 10k)',
        icon: '🐲',
        color: '#dc2626',
        cells: makeRowCells((l) => {
          const isUnlocked = l >= dtUnlock;
          const isWinPool = isUnlocked && ((l - dtUnlock + 1) % 10 === 0);
          let rwd = null;
          if (isWinPool) {
            rwd = formatMilestoneReward([{ id: 'Coin', count: 2000 }], 'Dragon Treasure Pool Winner');
          }
          return {
            level: l,
            active: isUnlocked,
            isMilestone: isWinPool,
            reward: rwd,
            text: l === dtUnlock ? '🔓 Unlock' : (isWinPool ? '+2,000G' : ''),
            tooltip: l === dtUnlock ? 'Level 61: Mở khóa Dragon Treasure' : (isWinPool ? 'Thắng chuỗi 10 màn: Chia thưởng Pool 10,000 Gold (~2,000G)' : (isUnlocked ? 'Dragon Treasure Active' : 'Khóa (Mở ở Lvl 61)'))
          };
        })
      });
    }

    // 8. Treasure Cave (Unlock Lvl 67)
    if (this.isEventEnabled('treasure_cave')) {
      const tcUnlock = cfg.treasureCave?.levelUnlocked ?? 67;
      const tcMaxStreak = cfg.treasureCave?.maxStreak ?? 7;
      rows.push({
        id: 'treasure_cave',
        label: 'Treasure Cave (Streak 7)',
        icon: '💎',
        color: '#ec4899',
        cells: makeRowCells((l) => {
          const isUnlocked = l >= tcUnlock;
          let text = '';
          let tooltip = '';
          let isMilestone = false;
          let rwd = null;
          if (l === tcUnlock) {
            text = '🔓 Unlock';
            tooltip = 'Level 67: Mở khóa Treasure Cave';
          } else if (isUnlocked) {
            const streakProgress = (l - tcUnlock + 1) % tcMaxStreak;
            if (streakProgress === 0) {
              isMilestone = true;
              text = '+180G';
              tooltip = 'Hoàn thành chuỗi 7 ván thắng Treasure Cave: Nhận ~180 Gold';
              rwd = formatMilestoneReward([{ id: 'Coin', count: 180 }], 'Treasure Cave Streak 7');
            } else {
              text = `${streakProgress}/7`;
              tooltip = `Treasure Cave: Chuỗi thắng ${streakProgress}/7 ván`;
            }
          }
          return {
            level: l,
            active: isUnlocked,
            isMilestone,
            reward: rwd,
            text,
            tooltip: tooltip || `Khóa (Mở ở Level ${tcUnlock})`
          };
        })
      });
    }

    // 9. Magic Crafting (Unlock Lvl 81, 15 stages)
    if (this.isEventEnabled('magic_crafting') && cfg.magicCrafting?.data?.stages) {
      const mcUnlock = cfg.magicCrafting?.levelUnlocked ?? 81;
      const mcMap = new Map();
      let cumSteps = mcUnlock;
      cfg.magicCrafting.data.stages.forEach(s => {
        cumSteps += (s.totalType || 4);
        mcMap.set(cumSteps, s);
      });

      rows.push({
        id: 'magic_crafting',
        label: 'Magic Crafting (Cauldron)',
        icon: '🧪',
        color: '#8b5cf6',
        cells: makeRowCells((l) => {
          const isUnlocked = l >= mcUnlock;
          const stage = mcMap.get(l);
          let rwd = null;
          if (stage) {
            rwd = formatMilestoneReward(stage.rewardList || [], `Magic Crafting Stage ${stage.stageOrder}`);
          }
          return {
            level: l,
            active: isUnlocked,
            isMilestone: !!stage,
            reward: rwd,
            text: l === mcUnlock ? '🔓 Unlock' : (stage ? `S${stage.stageOrder}` : ''),
            tooltip: l === mcUnlock ? 'Level 81: Mở khóa Magic Crafting' : (stage ? `Magic Crafting Stage ${stage.stageOrder}: Nhận phần thưởng chế tạo` : (isUnlocked ? 'Magic Crafting Active' : 'Khóa (Mở ở Lvl 81)'))
          };
        })
      });
    }

    // 10. Cloud Quest (Unlock Lvl 101, 10 checkpoints)
    if (this.isEventEnabled('cloud_quest') && cfg.cloudQuest?.data?.checkpoints) {
      const cqUnlock = cfg.cloudQuest?.levelUnlocked ?? 101;
      const cqMap = new Map();
      let cumStreak = 0;
      cfg.cloudQuest.data.checkpoints.forEach((cp, idx) => {
        cumStreak += (cp.winStreakCount || 3);
        const estLvl = cqUnlock + cumStreak;
        cqMap.set(estLvl, { step: idx + 1, rewards: cp.rewards });
      });

      rows.push({
        id: 'cloud_quest',
        label: 'Cloud Quest (Streak)',
        icon: '☁️',
        color: '#0284c7',
        cells: makeRowCells((l) => {
          const isUnlocked = l >= cqUnlock;
          const cp = cqMap.get(l);
          let rwd = null;
          if (cp) {
            rwd = formatMilestoneReward(cp.rewards || [], `Cloud Quest Mốc ${cp.step}`);
          }
          return {
            level: l,
            active: isUnlocked,
            isMilestone: !!cp,
            reward: rwd,
            text: l === cqUnlock ? '🔓 Unlock' : (cp ? `CQ${cp.step}` : ''),
            tooltip: l === cqUnlock ? 'Level 101: Mở khóa Cloud Quest (Chuỗi thắng nhận rương mây)' : (cp ? `Cloud Quest Mốc ${cp.step}: Nhận phần thưởng chuỗi thắng` : (isUnlocked ? 'Cloud Quest Active' : 'Khóa (Mở ở Lvl 101)'))
          };
        })
      });
    }

    // 11. Grand Hunt (Unlock Lvl 121, 3 stages)
    if (this.isEventEnabled('grand_hunt') && cfg.grandHunt?.data?.stageConfig) {
      const ghUnlock = cfg.grandHunt?.levelUnlocked ?? 121;
      const ghMap = new Map();
      let cumSteps = ghUnlock;
      cfg.grandHunt.data.stageConfig.forEach((s, idx) => {
        cumSteps += (s.numOfStepToFinish || 10);
        ghMap.set(cumSteps, { stage: idx + 1, rewards: s.rewardList });
      });

      rows.push({
        id: 'grand_hunt',
        label: 'Grand Hunt (Space Mission)',
        icon: '🛸',
        color: '#e11d48',
        cells: makeRowCells((l) => {
          const isUnlocked = l >= ghUnlock;
          const s = ghMap.get(l);
          let rwd = null;
          if (s) {
            rwd = formatMilestoneReward(s.rewards || [], `Grand Hunt Chặng ${s.stage}`);
          }
          return {
            level: l,
            active: isUnlocked,
            isMilestone: !!s,
            reward: rwd,
            text: l === ghUnlock ? '🔓 Unlock' : (s ? `S${s.stage}` : ''),
            tooltip: l === ghUnlock ? 'Level 121: Mở khóa Grand Hunt' : (s ? `Grand Hunt Chặng ${s.stage}: Nhận quà đua tốc độ Space Mission` : (isUnlocked ? 'Grand Hunt Active' : 'Khóa (Mở ở Lvl 121)'))
          };
        })
      });
    }

    // 12. Mission Control (Unlock Lvl 131, 4 stages + Final Chest)
    if (this.isEventEnabled('mission_control') && cfg.missionControl?.data?.stage_chest) {
      const mctrlUnlock = cfg.missionControl?.levelUnlocked ?? 131;
      const mctrlMap = new Map();
      const mctrlStepLevels = [135, 142, 150, 160];
      cfg.missionControl.data.stage_chest.forEach((stage, idx) => {
        const stageLvl = mctrlStepLevels[idx] || (mctrlUnlock + (idx + 1) * 7);
        mctrlMap.set(stageLvl, { stage: stage.stage, name: `Stage ${stage.stage} Chest`, rewards: stage.rewards });
      });
      if (cfg.missionControl.data.final_chest?.rewards) {
        mctrlMap.set(170, { stage: 'Final', name: 'Final Chest', rewards: cfg.missionControl.data.final_chest.rewards });
      }

      rows.push({
        id: 'mission_control',
        label: 'Mission Control',
        icon: '🛰️',
        color: '#4f46e5',
        cells: makeRowCells((l) => {
          const isUnlocked = l >= mctrlUnlock;
          const chest = mctrlMap.get(l);
          let rwd = null;
          if (chest) {
            rwd = formatMilestoneReward(chest.rewards || [], chest.name);
          }
          return {
            level: l,
            active: isUnlocked,
            isMilestone: !!chest,
            reward: rwd,
            text: l === mctrlUnlock ? '🔓 Unlock' : (chest ? `${chest.stage}` : ''),
            tooltip: l === mctrlUnlock ? 'Level 131: Mở khóa Mission Control' : (chest ? `Mission Control: ${chest.name}` : (isUnlocked ? 'Mission Control Active' : 'Khóa (Mở ở Lvl 131)'))
          };
        })
      });
    }

    // 13. Daily Free Coin
    if (this.isEventEnabled('daily_gift')) {
      const estLevelsPerDay = cfg.dailyFreeCoin?.estimatedLevelsPerDay || 15;
      rows.push({
        id: 'daily_gift',
        label: 'Quà ngày (Daily 100G)',
        icon: '📅',
        color: '#06b6d4',
        cells: makeRowCells((l) => {
          const isDayTick = l % estLevelsPerDay === 0;
          let rwd = null;
          if (isDayTick) {
            rwd = formatMilestoneReward([{ id: 'Coin', count: 100 }], 'Quà đăng nhập ngày');
          }
          return {
            level: l,
            active: true,
            isMilestone: isDayTick,
            reward: rwd,
            text: isDayTick ? '+100G' : '',
            tooltip: `Quà đăng nhập ngày: +100 Free Coin / ngày (Ước tính ngày thứ ${Math.max(1, Math.floor(l / 15))})`
          };
        })
      });
    }

    return rows;
  }
}
