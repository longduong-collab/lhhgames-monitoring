/**
 * designIntent.js
 * Design Intent Framework for Pixel Ball Level Tracker & Generator:
 * 1. 7 Atomic Intents based on game mechanics (Mystery, Pair Pressure, Frozen Gate, Hidden Surge, Bomb Clock, Dispatch Gate, Flood Release)
 * 2. 10 Compound Intent Profiles for Level Designers
 * 3. BFS Layer Depth Analysis for Pixel Art colors
 * 4. Multi-dimensional Intent Scoring (0 - 5)
 * 5. Level Generator: Re-generates shooters according to chosen Intent while strictly preserving blockData & Color Invariants.
 */

import { isValidPaletteType } from './palette.js';

// ==========================================
// 1. ATOMIC INTENTS DEFINITIONS
// ==========================================
export const ATOMIC_INTENTS = {
  MYSTERY: {
    id: 'MYSTERY',
    name: 'Mystery Truck',
    shortName: 'Ẩn danh',
    icon: '🔮',
    mechanicType: 1, // ShooterMechanicUnknow
    description: 'Xe bị ẩn màu (hiển thị ?), chỉ lộ diện khi đến hàng đầu. Tạo bất ngờ và buộc người chơi phải ứng biến.',
    defaultParams: { ratio: 0.3, preferDeep: true },
  },
  PAIR_PRESSURE: {
    id: 'PAIR_PRESSURE',
    name: 'Pair Pressure (Linked)',
    shortName: 'Ghép đôi',
    icon: '🔗',
    mechanicType: 2, // ShooterMechanicLinked
    description: 'Hai xe nối dây với nhau và di chuyển cùng lúc vào khay, ăn 2/4 slot cùng lúc.',
    defaultParams: { pairs: 1, style: 'adjacent' }, // 'adjacent' | 'non_adjacent'
  },
  FROZEN_GATE: {
    id: 'FROZEN_GATE',
    name: 'Frozen Gate (Ice)',
    shortName: 'Đóng băng',
    icon: '❄️',
    mechanicType: 3, // ShooterMechanicIce
    description: 'Xe xuất hiện ở hàng đầu nhưng bị đóng băng, yêu cầu N xe khác phải rời khay mới tan băng.',
    defaultParams: { count: 1, hardness: 3 }, // hardness: 2-5
  },
  HIDDEN_SURGE: {
    id: 'HIDDEN_SURGE',
    name: 'Hidden Surge (Curtains)',
    shortName: 'Rèm che',
    icon: '🎭',
    mechanicType: 4, // ShooterMechanicCurtains
    description: 'Xe hoàn toàn vô hình và lan sang 3 ô kề. Sau N xe rời khay, rèm mở và xe bất ngờ xuất hiện.',
    defaultParams: { count: 1, delay: 4 },
  },
  BOMB_CLOCK: {
    id: 'BOMB_CLOCK',
    name: 'Bomb Clock (Countdown)',
    shortName: 'Bom hẹn giờ',
    icon: '💣',
    shooterType: 7, // ShooterBomb
    description: 'Mỗi lần xe bất kỳ di chuyển vào khay, số đếm giảm 1. Hết lượt đếm bom nổ dẫn đến thua ngay lập tức.',
    defaultParams: { count: 1, fuse: 5 },
  },
  DISPATCH_GATE: {
    id: 'DISPATCH_GATE',
    name: 'Dispatch Gate (Pipe)',
    shortName: 'Ống nhả',
    icon: '🧪',
    shooterType: 4, // ShooterPipe
    description: 'Ống nhả lần lượt từng xe vào ô kề khi ô đó trống. Nhả xe tuần tự theo nhịp độ.',
    defaultParams: { queueLength: 3, direction: 0 },
  },
  FLOOD_RELEASE: {
    id: 'FLOOD_RELEASE',
    name: 'Flood Release (Tunnel)',
    shortName: 'Hầm tràn',
    icon: '🚇',
    shooterType: 6, // ShooterTunnel
    description: 'Hầm tích lũy, khi thông đường sẽ phóng ồ ạt toàn bộ xe vào mọi ô trống cùng lúc.',
    defaultParams: { queueLength: 4 },
  },
};

// ==========================================
// 2. 10 COMPOUND INTENT PROFILES
// ==========================================
export const COMPOUND_PROFILES = [
  {
    id: 'P0_TUTORIAL',
    name: '🌱 Tutorial / Thư giãn',
    tagline: 'Mở dần từ ngoài vào trong, không rào cản',
    difficultyStars: '★☆☆☆☆',
    badgeClass: 'badge-tutorial',
    description: 'Toàn bộ xe thường, không cơ chế chặn. Màu xe phân bổ tương ứng lớp ngoài của tranh, người chơi giải tỏa nhẹ nhàng.',
    atomics: {},
  },
  {
    id: 'P1_BLIND_HUNT',
    name: '🔮 Blind Hunt',
    tagline: 'Ẩn giấu một phần thông tin',
    difficultyStars: '★★☆☆☆',
    badgeClass: 'badge-easy',
    description: 'Khoảng 25-35% xe có cơ chế Unknown (?). Xe chỉ lộ màu khi đến hàng đầu, buộc người chơi phải phản xạ linh hoạt.',
    atomics: {
      MYSTERY: { ratio: 0.3, preferDeep: true },
    },
  },
  {
    id: 'P2_TWIN_TROUBLE',
    name: '🔗 Twin Trouble',
    tagline: 'Slot áp lực gấp đôi với xe ghép',
    difficultyStars: '★★☆☆☆',
    badgeClass: 'badge-easy',
    description: '1-2 cặp xe Linked. Mỗi lần bấm tiêu tốn 2 slot trên khay cùng lúc, đòi hỏi phải dọn khay trước khi gọi cặp này.',
    atomics: {
      PAIR_PRESSURE: { pairs: 1, style: 'adjacent' },
    },
  },
  {
    id: 'P3_ICE_BARRIER',
    name: '❄️ Ice Barrier',
    tagline: 'Nhìn thấy mục tiêu nhưng chưa thể lấy',
    difficultyStars: '★★★☆☆',
    badgeClass: 'badge-medium',
    description: '1-2 xe bị đóng băng (Ice count 3). Người chơi buộc phải dọn 3 xe khác để giải phóng slot then chốt này.',
    atomics: {
      FROZEN_GATE: { count: 1, hardness: 3 },
    },
  },
  {
    id: 'P4_SHADOW_DANCE',
    name: '🎭 Shadow Dance',
    tagline: 'Bóng ma ẩn nấp, đột ngột hiện hình',
    difficultyStars: '★★★☆☆',
    badgeClass: 'badge-medium',
    description: '1 xe có rèm Curtains che phủ cùng 3 ô xung quanh. Sau 4 lượt giải phóng xe, rèm mở và lộ diện cả cụm xe.',
    atomics: {
      HIDDEN_SURGE: { count: 1, delay: 4 },
    },
  },
  {
    id: 'P5_TIME_CRUNCH',
    name: '💣 Time Crunch',
    tagline: 'Mỗi lượt đi là một tiếng tích tắc',
    difficultyStars: '★★★★☆',
    badgeClass: 'badge-hard',
    description: 'Có 1 quả bom hẹn giờ 4-5 bước di chuyển. Người chơi phải ưu tiên dọn đường tới quả bom trước khi nó phát nổ.',
    atomics: {
      BOMB_CLOCK: { count: 1, fuse: 5 },
      MYSTERY: { ratio: 0.2, preferDeep: false },
    },
  },
  {
    id: 'P6_FROZEN_PAIR',
    name: '🔗❄️ Frozen Pair',
    tagline: 'Khóa đôi kết hợp nghẽn băng',
    difficultyStars: '★★★★☆',
    badgeClass: 'badge-hard',
    description: 'Cặp xe Linked ở hai cột tách biệt kết hợp cùng 1 xe Ice. Khay 4 slot sẽ liên tục đứng trước nguy cơ quá tải.',
    atomics: {
      PAIR_PRESSURE: { pairs: 1, style: 'non_adjacent' },
      FROZEN_GATE: { count: 1, hardness: 3 },
    },
  },
  {
    id: 'P7_SURGE_SURPRISE',
    name: '🌊🎭 Surge Surprise',
    tagline: 'Hầm ngầm giải phóng hàng loạt',
    difficultyStars: '★★★★☆',
    badgeClass: 'badge-hard',
    description: 'Ống hầm Tunnel chứa nhiều xe màu chìm. Khi mở đường thành công, toàn bộ xe ùa ra lấp kín mặt sân.',
    atomics: {
      FLOOD_RELEASE: { queueLength: 4 },
      HIDDEN_SURGE: { count: 1, delay: 3 },
    },
  },
  {
    id: 'P8_FULL_PRESSURE',
    name: '👑 Full Pressure',
    tagline: 'Thử thách đỉnh cao kết hợp 3 cơ chế',
    difficultyStars: '★★★★★',
    badgeClass: 'badge-super-hard',
    description: 'Sự kết hợp giữa Linked + Ice + Curtains. Khay chờ bị bóp nghẹt, mỗi cú click đều phải tính trước 3 bước.',
    atomics: {
      PAIR_PRESSURE: { pairs: 2, style: 'adjacent' },
      FROZEN_GATE: { count: 1, hardness: 4 },
      MYSTERY: { ratio: 0.25, preferDeep: true },
    },
  },
  {
    id: 'P9_TRICKLE_BOMB',
    name: '🧪💣 Trickle Bomb',
    tagline: 'Nhịp độ dồn dập dưới áp lực đếm ngược',
    difficultyStars: '★★★★★',
    badgeClass: 'badge-super-hard',
    description: 'Ống nhả Pipe liên tục đẩy xe mới ra sân trong khi Bomb đếm ngược từng bước. Căng thẳng nhịp độ cao.',
    atomics: {
      DISPATCH_GATE: { queueLength: 3, direction: 0 },
      BOMB_CLOCK: { count: 1, fuse: 6 },
    },
  },
];

// ==========================================
// 3. PIXEL ART BFS LAYER DEPTH ANALYSIS
// ==========================================
/**
 * Phân tích độ sâu lớp (Layer Depth) của từng màu trong Pixel Art bằng BFS từ viền ngoài.
 * - Lớp 1 (Exposed): Tiếp xúc trực tiếp với viền ngoài
 * - Lớp 2, 3...: Bị các lớp trước che phủ bên trong
 * @param {Array} blockData - rawJson.blockData
 * @param {number} width - girdSizeX
 * @param {number} height - girdSizeY
 * @returns {{ colorDepths: Object, colorCounts: Object, shallowColors: number[], deepColors: number[] }}
 */
export function analyzePixelArtLayerDepth(blockData, width, height) {
  if (!blockData || !Array.isArray(blockData) || blockData.length === 0) {
    return { colorDepths: {}, colorCounts: {}, shallowColors: [], deepColors: [] };
  }

  const W = width || blockData.length;
  const H = height || (blockData[0]?.d ? blockData[0].d.length : 10);

  // 1. Tạo ma trận loại ô & tính toán block counts chính xác có tính đến block mechanics
  const grid = Array.from({ length: W }, () => Array(H).fill(-1));
  const colorCounts = {};

  // Xác định ghost cells của BlockBig
  const bigBlockSizes = { 1: { w: 2, h: 2 }, 2: { w: 2, h: 3 }, 3: { w: 3, h: 2 }, 4: { w: 3, h: 3 } };
  const bigGhostCells = new Set();

  for (let x = 0; x < W; x++) {
    const col = blockData[x]?.d || [];
    for (let y = 0; y < H; y++) {
      const cell = col[y];
      const bType = cell?.blockType || 0;
      if (bigBlockSizes[bType]) {
        const { w, h } = bigBlockSizes[bType];
        for (let dx = 0; dx < w; dx++) {
          for (let dy = 0; dy < h; dy++) {
            if (dx === 0 && dy === 0) continue;
            bigGhostCells.add(`${x + dx},${y + dy}`);
          }
        }
      }
    }
  }

  for (let x = 0; x < W; x++) {
    const col = blockData[x]?.d || [];
    for (let y = 0; y < H; y++) {
      const cell = col[y];
      const type = cell && cell.type !== undefined ? cell.type : -1;
      grid[x][y] = type;
      if (type === -1) continue;

      // Bỏ qua ghost cells của BlockBig
      if (bigGhostCells.has(`${x},${y}`)) continue;

      const blockType = cell.blockType || 0;
      const param = Array.isArray(cell.param) ? cell.param : [];

      // Wall, Bomb, Key không cần bắn bằng đạn màu
      if (blockType === 8 || blockType === 9 || blockType === 5) continue;

      // BlockShooter (7)
      if (blockType === 7) {
        const firstCount = param.length > 0 ? param[0] : 1;
        if (firstCount > 0) {
          colorCounts[type] = (colorCounts[type] || 0) + firstCount;
        }
        for (let i = 2; i < param.length; i += 2) {
          const extraType = param[i - 1];
          const extraCount = param[i];
          if (extraCount > 0) {
            colorCounts[extraType] = (colorCounts[extraType] || 0) + extraCount;
          }
        }
        continue;
      }

      // Block bình thường hoặc BlockBig/Mystery
      let cellCount = 1;
      if (param.length > 0 && param[0] > 0) cellCount = param[0];
      colorCounts[type] = (colorCounts[type] || 0) + cellCount;
    }
  }

  // 2. BFS từ viền ngoài (Outermost border)
  const dist = Array.from({ length: W }, () => Array(H).fill(Infinity));
  const queue = [];

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      if (x === 0 || x === W - 1 || y === 0 || y === H - 1) {
        if (grid[x][y] === -1) {
          dist[x][y] = 0;
          queue.push({ x, y, d: 0 });
        } else {
          // Block nằm ngay viền ngoài cùng -> Depth = 1
          dist[x][y] = 1;
          queue.push({ x, y, d: 1 });
        }
      }
    }
  }

  const dx = [0, 0, 1, -1];
  const dy = [1, -1, 0, 0];

  let head = 0;
  while (head < queue.length) {
    const { x, y, d } = queue[head++];

    for (let i = 0; i < 4; i++) {
      const nx = x + dx[i];
      const ny = y + dy[i];

      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        const isBlock = grid[nx][ny] !== -1;
        const nextDist = isBlock ? (grid[x][y] === -1 ? 1 : d + 1) : 0;

        if (nextDist < dist[nx][ny]) {
          dist[nx][ny] = nextDist;
          queue.push({ x: nx, y: ny, d: nextDist });
        }
      }
    }
  }

  // 3. Tính độ sâu trung bình theo từng màu
  const colorSumDist = {};
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      const type = grid[x][y];
      if (type !== -1 && dist[x][y] < Infinity) {
        colorSumDist[type] = (colorSumDist[type] || 0) + dist[x][y];
      }
    }
  }

  const colorDepths = {};
  const shallowColors = [];
  const deepColors = [];

  Object.keys(colorCounts).forEach((typeStr) => {
    const type = Number(typeStr);
    const count = colorCounts[type] || 1;
    const avg = Number(((colorSumDist[type] || 0) / count).toFixed(2));
    colorDepths[type] = avg;

    if (avg <= 1.8) {
      shallowColors.push(type);
    } else {
      deepColors.push(type);
    }
  });

  return { colorDepths, colorCounts, shallowColors, deepColors };
}

// ==========================================
// 4. INTENT SCORING ENGINE (7 AXES)
// ==========================================
/**
 * Đánh giá điểm Intent của một level dựa trên rawJson (Thang điểm 0 - 5 trên 7 trục)
 * @param {object} parsedLevel - Level object từ jsonParser.js
 * @returns {object} { scores: { mystery, pairPressure, frozenGate, hiddenSurge, bombClock, dispatchGate, floodRelease }, overallPressure: number }
 */
export function calculateIntentScores(parsedLevel) {
  const raw = parsedLevel?.rawJson || parsedLevel || {};
  const shooters = raw.shooters || [];

  let totalTrucks = 0;
  let unknownCount = 0;
  let linkedCount = 0;
  let nonAdjacentLinked = 0;
  let frozenCount = 0;
  let frozenSumHardness = 0;
  let curtainsCount = 0;
  let curtainsSumDelay = 0;
  let bombCount = 0;
  let bombMinFuse = 99;
  let pipeCount = 0;
  let pipeTotalSubs = 0;
  let tunnelCount = 0;
  let tunnelTotalSubs = 0;

  for (let ci = 0; ci < shooters.length; ci++) {
    const colList = shooters[ci]?.list || [];
    for (let ri = 0; ri < colList.length; ri++) {
      const slot = colList[ri];
      if (!slot) continue;
      const sType = slot.shooterType || 0;
      const shot = Number(slot.shot) || 0;
      const mechs = slot.mechanics || [];
      const param = slot.param || [];

      if (sType === 0 && shot > 0) totalTrucks++;

      // Mechanics on slot
      for (const m of mechs) {
        if (!m) continue;
        if (m.type === 1) unknownCount++;
        if (m.type === 2) {
          linkedCount++;
          const targetCol = m.param?.[0];
          const targetRow = m.param?.[1];
          if (targetCol !== undefined && targetRow !== undefined) {
            const distCol = Math.abs(targetCol - ci);
            const distRow = Math.abs(targetRow - ri);
            if (distCol + distRow > 1) nonAdjacentLinked++;
          }
        }
        if (m.type === 3) {
          frozenCount++;
          frozenSumHardness += (m.param?.[0] || 3);
        }
        if (m.type === 4) {
          curtainsCount++;
          curtainsSumDelay += (m.param?.[0] || 4);
        }
      }

      // Container / Special Shooter Types
      if (sType === 7) {
        bombCount++;
        if (shot > 0 && shot < bombMinFuse) bombMinFuse = shot;
      }
      if (sType === 4) {
        pipeCount++;
        pipeTotalSubs += Math.floor((param.length) / 3);
      }
      if (sType === 6) {
        tunnelCount++;
        tunnelTotalSubs += Math.floor((param.length) / 3);
      }
    }
  }

  // Normalize scores 0.0 - 5.0
  const mysteryScore = Math.min(5, Number(((unknownCount / Math.max(1, totalTrucks)) * 10).toFixed(1)));
  const pairScore = Math.min(5, Number((linkedCount * 1.5 + nonAdjacentLinked * 1.0).toFixed(1)));
  const frozenScore = Math.min(5, Number((frozenCount * 2.0 + (frozenSumHardness / Math.max(1, frozenCount)) * 0.5).toFixed(1)));
  const curtainsScore = Math.min(5, Number((curtainsCount * 2.5 + (curtainsSumDelay / Math.max(1, curtainsCount)) * 0.4).toFixed(1)));
  const bombScore = bombCount > 0 ? Math.min(5, Number((3.0 + Math.max(0, 7 - bombMinFuse) * 0.5).toFixed(1))) : 0;
  const pipeScore = pipeCount > 0 ? Math.min(5, Number((2.0 + pipeTotalSubs * 0.5).toFixed(1))) : 0;
  const tunnelScore = tunnelCount > 0 ? Math.min(5, Number((2.5 + tunnelTotalSubs * 0.6).toFixed(1))) : 0;

  const overallPressure = Number(
    ((mysteryScore * 0.15 + pairScore * 0.25 + frozenScore * 0.25 + curtainsScore * 0.2 + bombScore * 0.3 + pipeScore * 0.1 + tunnelScore * 0.2) * 1.2).toFixed(1)
  );

  return {
    scores: {
      mystery: mysteryScore,
      pairPressure: pairScore,
      frozenGate: frozenScore,
      hiddenSurge: curtainsScore,
      bombClock: bombScore,
      dispatchGate: pipeScore,
      floodRelease: tunnelScore,
    },
    overallPressure: Math.min(5, overallPressure),
  };
}

/**
 * Tính điểm mô phỏng các trục áp lực từ một Compound Profile Intent
 * @param {object} profile - Profile object từ COMPOUND_PROFILES
 * @returns {object} { scores: { mystery, pairPressure, frozenGate, hiddenSurge, bombClock, dispatchGate, floodRelease }, overallPressure: number }
 */
export function calculateScoresFromProfile(profile) {
  if (!profile) {
    return {
      scores: { mystery: 0, pairPressure: 0, frozenGate: 0, hiddenSurge: 0, bombClock: 0, dispatchGate: 0, floodRelease: 0 },
      overallPressure: 0,
    };
  }
  const atomics = profile.atomics || {};
  const mysteryScore = atomics.MYSTERY ? Math.min(5, Number(((atomics.MYSTERY.ratio || 0.3) * 10).toFixed(1))) : 0;
  const pairScore = atomics.PAIR_PRESSURE ? Math.min(5, Number(((atomics.PAIR_PRESSURE.pairs || 1) * 2 + (atomics.PAIR_PRESSURE.style === 'split' ? 1.5 : 0)).toFixed(1))) : 0;
  const frozenScore = atomics.FROZEN_GATE ? Math.min(5, Number(((atomics.FROZEN_GATE.count || 1) * 2 + (atomics.FROZEN_GATE.hardness || 3) * 0.5).toFixed(1))) : 0;
  const curtainsScore = atomics.HIDDEN_SURGE ? Math.min(5, Number(((atomics.HIDDEN_SURGE.count || 1) * 2.5 + (atomics.HIDDEN_SURGE.delay || 4) * 0.4).toFixed(1))) : 0;
  const bombScore = atomics.BOMB_CLOCK ? Math.min(5, Number((3.0 + Math.max(0, 7 - (atomics.BOMB_CLOCK.fuse || 5)) * 0.5).toFixed(1))) : 0;
  const pipeScore = atomics.DISPATCH_GATE ? Math.min(5, Number((2.0 + (atomics.DISPATCH_GATE.queueLength || 3) * 0.5).toFixed(1))) : 0;
  const tunnelScore = atomics.FLOOD_RELEASE ? Math.min(5, Number((2.5 + (atomics.FLOOD_RELEASE.queueLength || 4) * 0.6).toFixed(1))) : 0;

  const overall = Number(
    ((mysteryScore * 0.15 + pairScore * 0.25 + frozenScore * 0.25 + curtainsScore * 0.2 + bombScore * 0.3 + pipeScore * 0.1 + tunnelScore * 0.2) * 1.2).toFixed(1)
  );

  return {
    scores: {
      mystery: mysteryScore,
      pairPressure: pairScore,
      frozenGate: frozenScore,
      hiddenSurge: curtainsScore,
      bombClock: bombScore,
      dispatchGate: pipeScore,
      floodRelease: tunnelScore,
    },
    overallPressure: Math.min(5, overall),
  };
}

// ==========================================
// 5. INTENT GENERATOR ENGINE
// ==========================================
/**
 * Sinh lại cấu trúc shooters cho level dựa theo Profile Intent đã chọn.
 * BẢO ĐẢM TUYỆT ĐỐI:
 * 1. blockData được giữ nguyên 100% (Pixel art không đổi)
 * 2. Invariant cân bằng màu: Tổng shot của mỗi màu từ tất cả xe (kể cả trong Pipe/Tunnel) = đúng số block của màu đó!
 * 3. Tọa độ Linked được sinh chuẩn xác hai chiều [col, row]
 * 4. Curtains, Ice, Unknown, Bomb được gán đúng tham số gameplay Unity
 *
 * @param {object} rawJson - Dữ liệu JSON gốc của Level
 * @param {string} profileId - ID của Profile (P0_TUTORIAL, P1_BLIND_HUNT, ...)
 * @param {object} customParams - Tham số ghi đè tùy chỉnh nếu có
 * @returns {object} JSON mới đã được biến đổi shooters theo đúng ý đồ
 */
export function generateLevelByIntent(rawJson, profileId, customParams = {}) {
  if (!rawJson) return null;

  const newJson = JSON.parse(JSON.stringify(rawJson));
  const profile = COMPOUND_PROFILES.find((p) => p.id === profileId) || COMPOUND_PROFILES[0];
  const atomicsConfig = { ...(profile.atomics || {}), ...customParams };

  // 1. Phân tích màu & độ sâu Pixel Art
  const W = Number(newJson.girdSizeX) || (newJson.blockData ? newJson.blockData.length : 10);
  const H = Number(newJson.girdSizeY) || (newJson.blockData?.[0]?.d ? newJson.blockData[0].d.length : 10);
  const { colorDepths, colorCounts, shallowColors, deepColors } = analyzePixelArtLayerDepth(newJson.blockData, W, H);

  // Sắp xếp các màu theo thứ tự độ sâu từ ngoài vào trong
  const sortedColors = Object.keys(colorCounts)
    .map(Number)
    .sort((a, b) => (colorDepths[a] || 0) - (colorDepths[b] || 0));

  if (sortedColors.length === 0) {
    return newJson; // Không có block màu nào
  }

  // 2. Chuẩn bị phân bổ shooters
  // Định hình số cột (mặc định giữ nguyên số cột của level cũ hoặc tạo 4-6 cột)
  const numCols = Math.max(4, Math.min(7, (newJson.shooters && newJson.shooters.length) || 5));
  const maxSlotsPerCol = 5; // Thông thường mỗi cột có 3-5 xe xếp dọc

  // Tạo khung cột rỗng
  const newCols = Array.from({ length: numCols }, () => ({ list: [] }));

  // Xử lý container shooters (Pipe / Tunnel) nếu có trong intent
  const hasPipe = Boolean(atomicsConfig.DISPATCH_GATE);
  const hasTunnel = Boolean(atomicsConfig.FLOOD_RELEASE);
  const hasBomb = Boolean(atomicsConfig.BOMB_CLOCK);

  // Số block dành cho Pipe / Tunnel (lấy bớt từ các màu chìm để đóng vào param)
  const reservedColorShots = {};
  const pipeParams = [];
  const tunnelParams = [];

  if (hasPipe) {
    const pConf = atomicsConfig.DISPATCH_GATE;
    const qLen = pConf.queueLength || 3;
    // Chọn màu ở giữa danh sách độ sâu để đưa vào Pipe
    const pipeColors = sortedColors.slice(Math.floor(sortedColors.length / 2));
    let added = 0;
    for (const c of pipeColors) {
      if (added >= qLen) break;
      const totalB = colorCounts[c] || 0;
      if (totalB >= 15) {
        const subShot = Math.min(totalB, Math.max(12, Math.floor(totalB * 0.4)));
        reservedColorShots[c] = (reservedColorShots[c] || 0) + subShot;
        pipeParams.push(c, subShot, 0); // [type, shot, shooterType]
        added++;
      }
    }
  }

  if (hasTunnel) {
    const tConf = atomicsConfig.FLOOD_RELEASE;
    const qLen = tConf.queueLength || 4;
    // Chọn các màu chìm nhất (deep colors) cho Tunnel
    const tunnelColors = sortedColors.slice(-3);
    let added = 0;
    for (const c of tunnelColors) {
      if (added >= qLen) break;
      const totalB = (colorCounts[c] || 0) - (reservedColorShots[c] || 0);
      if (totalB >= 15) {
        const subShot = Math.min(totalB, Math.max(10, Math.floor(totalB * 0.5)));
        reservedColorShots[c] = (reservedColorShots[c] || 0) + subShot;
        tunnelParams.push(c, subShot, 0);
        added++;
      }
    }
  }

  // 3. Tạo danh sách các xe cơ bản (Standalone trucks)
  const truckQueue = [];

  sortedColors.forEach((color) => {
    const totalBlocks = colorCounts[color] || 0;
    const remainingBlocks = totalBlocks - (reservedColorShots[color] || 0);
    if (remainingBlocks <= 0) return;

    // Chia thành các xe với dung lượng shot hợp lý (30 - 75 shot/xe)
    const maxShotPerTruck = remainingBlocks > 100 ? 70 : 45;
    const numTrucks = Math.max(1, Math.ceil(remainingBlocks / maxShotPerTruck));
    const baseShot = Math.floor(remainingBlocks / numTrucks);
    let rem = remainingBlocks % numTrucks;

    for (let k = 0; k < numTrucks; k++) {
      const shot = baseShot + (rem > 0 ? 1 : 0);
      if (rem > 0) rem--;

      truckQueue.push({
        type: color,
        shot,
        shooterType: 0,
        param: [],
        mechanics: [],
        colorDepth: colorDepths[color] || 1,
      });
    }
  });

  // 4. Đặt các xe vào Grid (Cột và Hàng)
  // Sắp xếp các xe nông (shallow) ở hàng đầu (row 0), xe chìm ở hàng sâu hơn
  truckQueue.sort((a, b) => a.colorDepth - b.colorDepth);

  // Nếu có Bomb, đặt vào Cột 0, Hàng 0
  if (hasBomb) {
    const bConf = atomicsConfig.BOMB_CLOCK;
    const fuse = bConf.fuse || 5;
    newCols[0].list.push({
      type: -1,
      shot: fuse, // Bomb dùng field shot làm move fuse count
      shooterType: 7,
      param: [],
      mechanics: [],
    });
  }

  // Nếu có Pipe và có param, đặt Pipe vào cột kế cuối, Hàng 0
  if (hasPipe && pipeParams.length > 0) {
    const pipeCol = Math.min(numCols - 1, 2);
    newCols[pipeCol].list.push({
      type: atomicsConfig.DISPATCH_GATE?.direction || 0, // type của Pipe là hướng xoay
      shot: 0,
      shooterType: 4,
      param: pipeParams,
      mechanics: [],
    });
  }

  // Nếu có Tunnel và có param, đặt Tunnel vào cột cuối, Hàng 0
  if (hasTunnel && tunnelParams.length > 0) {
    const tunnelCol = numCols - 1;
    newCols[tunnelCol].list.push({
      type: 0,
      shot: 0,
      shooterType: 6,
      param: tunnelParams,
      mechanics: [],
    });
  }

  // Phân bổ đều các xe thường vào các cột
  let colIndex = 0;
  for (const truck of truckQueue) {
    // Tìm cột chưa đầy nhất
    let bestCol = colIndex % numCols;
    for (let tries = 0; tries < numCols; tries++) {
      const candidate = (colIndex + tries) % numCols;
      if (newCols[candidate].list.length < maxSlotsPerCol) {
        bestCol = candidate;
        break;
      }
    }
    newCols[bestCol].list.push(truck);
    colIndex++;
  }

  // 5. Gán Attachment Mechanics (Linked, Ice, Curtains, Unknown)
  // A. Mystery (Unknown)
  if (atomicsConfig.MYSTERY) {
    const ratio = atomicsConfig.MYSTERY.ratio || 0.3;
    const targetCount = Math.max(1, Math.round(truckQueue.length * ratio));
    let applied = 0;

    // Ưu tiên các xe ở hàng sau (row >= 1) và màu chìm
    for (let c = 0; c < numCols; c++) {
      for (let r = 1; r < newCols[c].list.length; r++) {
        const slot = newCols[c].list[r];
        if (slot && slot.shooterType === 0 && slot.mechanics.length === 0) {
          slot.mechanics.push({ type: 1, param: [] });
          applied++;
          if (applied >= targetCount) break;
        }
      }
      if (applied >= targetCount) break;
    }
  }

  // B. Pair Pressure (Linked)
  if (atomicsConfig.PAIR_PRESSURE) {
    const pConf = atomicsConfig.PAIR_PRESSURE;
    const pairsCount = pConf.pairs || 1;
    const isNonAdj = pConf.style === 'non_adjacent';

    let pairsCreated = 0;
    for (let c = 0; c < numCols - 1; c++) {
      if (pairsCreated >= pairsCount) break;

      const partnerCol = isNonAdj ? Math.min(numCols - 1, c + 2) : c + 1;
      // Tìm 2 slot xe thường tương ứng
      for (let r = 0; r < Math.min(newCols[c].list.length, newCols[partnerCol].list.length); r++) {
        const slotA = newCols[c].list[r];
        const slotB = newCols[partnerCol].list[r];

        if (slotA && slotB && slotA.shooterType === 0 && slotB.shooterType === 0 &&
            !slotA.mechanics.some(m => m.type === 2) && !slotB.mechanics.some(m => m.type === 2)) {
          
          // Gán tọa độ trỏ nhau chuẩn xác
          slotA.mechanics.push({ type: 2, param: [partnerCol, r] });
          slotB.mechanics.push({ type: 2, param: [c, r] });
          pairsCreated++;
          break;
        }
      }
    }
  }

  // C. Frozen Gate (Ice)
  if (atomicsConfig.FROZEN_GATE) {
    const fConf = atomicsConfig.FROZEN_GATE;
    const count = fConf.count || 1;
    const hardness = fConf.hardness || 3;
    let applied = 0;

    // Đặt vào hàng đầu hoặc hàng nhì (row 0 hoặc 1) để tạo rào chắn
    for (let c = 0; c < numCols; c++) {
      for (let r = 0; r < Math.min(2, newCols[c].list.length); r++) {
        const slot = newCols[c].list[r];
        if (slot && slot.shooterType === 0 && !slot.mechanics.some(m => m.type === 3)) {
          slot.mechanics.push({ type: 3, param: [hardness] });
          applied++;
          if (applied >= count) break;
        }
      }
      if (applied >= count) break;
    }
  }

  // D. Hidden Surge (Curtains)
  if (atomicsConfig.HIDDEN_SURGE) {
    const cConf = atomicsConfig.HIDDEN_SURGE;
    const count = cConf.count || 1;
    const delay = cConf.delay || 4;
    let applied = 0;

    // Đặt ở vị trí có thể lan sang 3 ô kề (col <= numCols - 2, row <= 1)
    for (let c = 0; c < numCols - 1; c++) {
      for (let r = 0; r < Math.min(2, newCols[c].list.length - 1); r++) {
        const slot = newCols[c].list[r];
        if (slot && slot.shooterType === 0 && !slot.mechanics.some(m => m.type === 4)) {
          slot.mechanics.push({ type: 4, param: [delay] });
          applied++;
          if (applied >= count) break;
        }
      }
      if (applied >= count) break;
    }
  }

  // Gán mảng shooters mới
  newJson.shooters = newCols;
  return newJson;
}
