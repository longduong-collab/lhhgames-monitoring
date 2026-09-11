/**
 * levelConfig.js
 * Chứa cấu hình độ khó Level theo quy chuẩn phân bổ mới:
 * - Trước level 150: Đuôi 5 là Hard (5, 15, 25...), đuôi 0 là Super Hard (10, 20, 30...)
 * - Sau level 150: Đuôi 4 và 7 là Hard (154, 157, 164, 167...), đuôi 0 là Super Hard (160, 170...)
 */

export function generateStandardDifficultyMap(maxLevel = 600) {
  const superHardSet = new Set();
  const hardSet = new Set();

  for (let l = 1; l <= maxLevel; l++) {
    if (l <= 150) {
      if (l % 10 === 0) superHardSet.add(l);
      else if (l % 10 === 5) hardSet.add(l);
    } else {
      if (l % 10 === 0) superHardSet.add(l);
      else if (l % 10 === 4 || l % 10 === 7) hardSet.add(l);
    }
  }

  return {
    LevelHards: Array.from(hardSet).sort((a, b) => a - b),
    LevelSuperHards: Array.from(superHardSet).sort((a, b) => a - b)
  };
}

const generatedDiff = generateStandardDifficultyMap(600);

export const LOCAL_LEVEL_CONFIG = {
  name: 'Default',
  totalLevel: 600,
  MechanicUnlockedLevel: [8, 14, 76, 163, 21, 63, 51, 124, 108, 31, 201, 141, 92, -1],
  BoosterUnlockedLevel: [7, 12, 16, 19, 0],
  LevelHards: generatedDiff.LevelHards,
  LevelSuperHards: generatedDiff.LevelSuperHards
};

const levelHardsSet = new Set(LOCAL_LEVEL_CONFIG.LevelHards);
const levelSuperHardsSet = new Set(LOCAL_LEVEL_CONFIG.LevelSuperHards);

/**
 * Tính toán độ khó cho bất kỳ Level nào (áp dụng thống nhất cho toàn bộ app).
 * @param {number|string} levelNum 
 * @returns {'normal' | 'hard' | 'super_hard'}
 */
export function getLevelDifficulty(levelNum) {
  const lv = parseInt(levelNum, 10);
  if (isNaN(lv) || lv <= 0) return 'normal';

  if (levelSuperHardsSet.has(lv)) return 'super_hard';
  if (levelHardsSet.has(lv)) return 'hard';

  // Fallback nếu vượt quá 600:
  if (lv > 600) {
    if (lv % 10 === 0) return 'super_hard';
    if (lv % 10 === 4 || lv % 10 === 7) return 'hard';
  }

  return 'normal';
}

/**
 * Alias lấy độ khó theo Ma Trận Đề Xuất Mới (đồng bộ chuẩn hóa)
 */
export function getProposedLevelDifficulty(levelNum) {
  return getLevelDifficulty(levelNum);
}

/**
 * Lấy metadata hiển thị của độ khó.
 * @param {'normal' | 'hard' | 'super_hard'} difficulty 
 * @returns {{ key: string, label: string, emoji: string, badgeText: string, cssClass: string }}
 */
export function getDifficultyMeta(difficulty) {
  switch (difficulty) {
    case 'hard':
      return {
        key: 'hard',
        label: 'Khó',
        emoji: '🔥',
        badgeText: '🔥 Khó',
        cssClass: 'hard',
      };
    case 'super_hard':
      return {
        key: 'super_hard',
        label: 'Siêu Khó',
        emoji: '💀',
        badgeText: '💀 Siêu Khó',
        cssClass: 'super-hard',
      };
    default:
      return {
        key: 'normal',
        label: 'Bình thường',
        emoji: '',
        badgeText: 'Bình thường',
        cssClass: 'normal',
      };
  }
}
