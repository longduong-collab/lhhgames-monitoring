/**
 * levelConfig.js
 * Chứa cấu hình độ khó Level trích xuất từ Assets/Resources/CS_LocalLevelConfigData.json
 * và logic tính toán độ khó (Normal / Hard / Super Hard).
 */

export const LOCAL_LEVEL_CONFIG = {
  name: 'Default',
  totalLevel: 360,
  MechanicUnlockedLevel: [23, 10, 30, 120, 8, 50, 41, 101, 80, 60, 150, 90, 70, -1],
  BoosterUnlockedLevel: [7, 13, 15, 18, 0],
  LevelHards: [
    5, 11, 16, 25, 35, 40, 44, 48, 52, 59, 64, 69, 81, 85, 95, 105, 115, 118, 123, 127, 136, 140,
    152, 155, 165, 175, 180, 190, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315,
    325, 335, 345, 355, 365, 375, 385, 395, 405, 415, 425, 435, 445, 455, 465, 475, 485, 495, 505,
    515, 525, 535, 545, 555, 565, 575, 585, 595, 605, 615, 625
  ],
  LevelSuperHards: [
    20, 31, 55, 75, 89, 100, 110, 130, 145, 160, 170, 185, 200, 210, 220, 230, 240, 250, 260, 270,
    280, 290, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450, 460,
    470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 630
  ]
};

const levelHardsSet = new Set(LOCAL_LEVEL_CONFIG.LevelHards);
const levelSuperHardsSet = new Set(LOCAL_LEVEL_CONFIG.LevelSuperHards);

/**
 * Tính toán độ khó dựa vào số Level (chuẩn theo logic RunTimeData.cs trong Unity).
 * @param {number|string} levelNum 
 * @returns {'normal' | 'hard' | 'super_hard'}
 */
export function getLevelDifficulty(levelNum) {
  const lv = parseInt(levelNum, 10);
  if (isNaN(lv) || lv <= 0) return 'normal';

  if (lv <= LOCAL_LEVEL_CONFIG.totalLevel) {
    if (levelHardsSet.has(lv)) return 'hard';
    if (levelSuperHardsSet.has(lv)) return 'super_hard';
    return 'normal';
  } else {
    // Logic fallback cho các level vượt quá totalLevel (RunTimeData._gameDifficultyByLv)
    if (lv % 10 === 0) return 'super_hard';
    if (lv % 10 === 3 || lv % 10 === 6) return 'hard';
    return 'normal';
  }
}

/**
 * Tính toán độ khó theo Ma Trận Đề Xuất Mới (Proposed Level Design):
 * - Level đuôi 0 (10, 20, 30...) = 'super_hard' (💀 Siêu Khó - Decade Climax)
 * - Level đuôi 5 (5, 15, 25, 35...) = 'hard' (🔥 Khó - Mid-Decade Spike / Test)
 * - Các level khác = 'normal'
 * @param {number|string} levelNum 
 * @returns {'normal' | 'hard' | 'super_hard'}
 */
export function getProposedLevelDifficulty(levelNum) {
  const lv = parseInt(levelNum, 10);
  if (isNaN(lv) || lv <= 0) return 'normal';
  if (lv % 10 === 0) return 'super_hard';
  if (lv % 10 === 5) return 'hard';
  return 'normal';
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

