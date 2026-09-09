/**
 * jsonParser.js
 * Chịu trách nhiệm parse file JSON raw của từng level, trích xuất & tính toán toàn bộ properties và chỉ số phái sinh.
 */

import { isValidPaletteType } from './palette.js';
import { getLevelDifficulty, getDifficultyMeta } from './levelConfig.js';

/**
 * Trích xuất số level từ tên file bằng regex.
 * Ví dụ: "1.json" -> 1, "level_23.json" -> 23, "map-004.json" -> 4.
 * Nếu không có số, trả về nguyên tên file và cờ cảnh báo.
 * @param {string} fileName 
 * @returns {{ levelNumber: number|string, hasWarning: boolean, rawName: string }}
 */
export function extractLevelIdentifier(fileName) {
  const cleanName = fileName.replace(/\.json$/i, '');
  const match = cleanName.match(/\d+/);
  if (match) {
    return {
      levelNumber: parseInt(match[0], 10),
      hasWarning: false,
      rawName: fileName,
    };
  }
  return {
    levelNumber: cleanName,
    hasWarning: true,
    rawName: fileName,
  };
}

/**
 * Parse chuỗi JSON hoặc object raw và tính toán toàn bộ chỉ số của Level.
 * @param {string|object} content - Nội dung JSON raw
 * @param {string} fileName - Tên file gốc
 * @returns {object} - Object chứa toàn bộ properties đã tính hoặc error object
 */
export function parseLevelData(content, fileName = 'unknown.json') {
  const fileInfo = extractLevelIdentifier(fileName);
  let rawData = null;

  try {
    if (typeof content === 'string') {
      rawData = JSON.parse(content);
    } else {
      rawData = content;
    }
  } catch (err) {
    return {
      isError: true,
      fileName,
      level: fileInfo.levelNumber,
      errorMessage: `Lỗi cú pháp JSON: ${err.message}`,
    };
  }

  // Kiểm tra các trường bắt buộc
  if (!rawData || typeof rawData !== 'object') {
    return {
      isError: true,
      fileName,
      level: fileInfo.levelNumber,
      errorMessage: 'Dữ liệu JSON không hợp lệ (không phải Object).',
    };
  }

  const missingFields = [];
  if (rawData.girdSizeX === undefined || rawData.girdSizeX === null) missingFields.push('girdSizeX');
  if (rawData.girdSizeY === undefined || rawData.girdSizeY === null) missingFields.push('girdSizeY');
  if (!rawData.blockData || !Array.isArray(rawData.blockData)) missingFields.push('blockData');

  if (missingFields.length > 0) {
    return {
      isError: true,
      fileName,
      level: fileInfo.levelNumber,
      errorMessage: `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`,
    };
  }

  // 1. Phân tích blockData theo các loại mechanic (Block, BlockBig, BlockShooter, BlockBomb, BlockWall, BlockKey, ...)
  let active_blocks = 0;
  const blocks_by_type = {};
  const invalidTypesSet = new Set();
  const uniqueTypesSet = new Set();
  const blockMechanicCounts = {}; // { [blockType]: { count, cellsCount, firstRow, firstCol } }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  const blockData = rawData.blockData || [];

  // Pre-pass: Xác định các ô ghost của BlockBig (1: 2x2, 2: 2x3, 3: 3x2, 4: 3x3)
  const bigBlockSizes = {
    1: { w: 2, h: 2 },
    2: { w: 2, h: 3 },
    3: { w: 3, h: 2 },
    4: { w: 3, h: 3 },
  };
  const bigBlockGhostCells = new Set();

  for (let x = 0; x < blockData.length; x++) {
    const col = blockData[x];
    if (col && Array.isArray(col.d)) {
      for (let y = 0; y < col.d.length; y++) {
        const cell = col.d[y];
        if (!cell) continue;
        const bType = cell.blockType !== undefined ? cell.blockType : 0;
        if (bigBlockSizes[bType]) {
          const { w, h } = bigBlockSizes[bType];
          for (let dx = 0; dx < w; dx++) {
            for (let dy = 0; dy < h; dy++) {
              if (dx === 0 && dy === 0) continue;
              bigBlockGhostCells.add(`${x + dx},${y + dy}`);
            }
          }
        }
      }
    }
  }

  for (let x = 0; x < blockData.length; x++) {
    const col = blockData[x];
    if (col && Array.isArray(col.d)) {
      for (let y = 0; y < col.d.length; y++) {
        const cell = col.d[y];
        if (!cell) continue;

        const cellType = cell.type;
        const blockType = cell.blockType !== undefined ? cell.blockType : 0;
        const param = Array.isArray(cell.param) ? cell.param : [];

        if (cellType === undefined || cellType === null) continue;

        // Bỏ qua ô rỗng (-1) nhưng tính toán bounds cho các ô có màu
        if (cellType !== -1) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          
          if (!isValidPaletteType(cellType)) {
            invalidTypesSet.add(cellType);
          }

          // Ghi nhận mechanic count
          if (!blockMechanicCounts[blockType]) {
            blockMechanicCounts[blockType] = { count: 0, cellsCount: 0, firstRow: y, firstCol: x };
          }
          blockMechanicCounts[blockType].cellsCount++;
          if (y < blockMechanicCounts[blockType].firstRow) {
            blockMechanicCounts[blockType].firstRow = y;
            blockMechanicCounts[blockType].firstCol = x;
          }
        } else {
          continue;
        }

        // Bỏ qua ghost cells của BlockBig khỏi blocks_by_type & active_blocks (đã được tính ở ô anchor)
        if (bigBlockGhostCells.has(`${x},${y}`)) {
          continue;
        }

        // Xử lý theo từng loại Block Mechanic:
        // - BlockWall (8), BlockBomb (9), BlockKey (5): Là chướng ngại vật / cơ chế phụ, count = 0 (không cần bắn bằng súng màu)
        if (blockType === 8 || blockType === 9 || blockType === 5) {
          blockMechanicCounts[blockType].count++;
          continue;
        }

        // - BlockShooter (7): Súng bắn thêm block từ param [count0, type1, count1, type2, count2, ...]
        if (blockType === 7) {
          let bShooterCount = 0;
          const firstCount = param.length > 0 ? param[0] : 1;
          if (firstCount > 0) {
            active_blocks += firstCount;
            bShooterCount += firstCount;
            uniqueTypesSet.add(cellType);
            blocks_by_type[cellType] = (blocks_by_type[cellType] || 0) + firstCount;
          }

          for (let i = 2; i < param.length; i += 2) {
            const extraType = param[i - 1];
            const extraCount = param[i];
            if (extraCount > 0) {
              if (!isValidPaletteType(extraType)) invalidTypesSet.add(extraType);
              active_blocks += extraCount;
              bShooterCount += extraCount;
              uniqueTypesSet.add(extraType);
              blocks_by_type[extraType] = (blocks_by_type[extraType] || 0) + extraCount;
            }
          }
          blockMechanicCounts[blockType].count += bShooterCount;
          continue;
        }

        // - BlockUnknown / Mystery (6), BlockBig (1, 2, 3, 4) hoặc Block bình thường (0) có param đếm số hit
        let cellCount = 1;
        if (param.length > 0 && param[0] > 0) {
          cellCount = param[0];
        }

        active_blocks += cellCount;
        uniqueTypesSet.add(cellType);
        blocks_by_type[cellType] = (blocks_by_type[cellType] || 0) + cellCount;
        blockMechanicCounts[blockType].count += cellCount;
      }
    }
  }

  const girdSizeX = maxX >= minX ? (maxX - minX + 1) : 0;
  const girdSizeY = maxY >= minY ? (maxY - minY + 1) : 0;
  const total_cells = girdSizeX * girdSizeY;

  const fill_ratio_pct = total_cells > 0 ? Number(((active_blocks / total_cells) * 100).toFixed(1)) : 0;
  const unique_types_used = uniqueTypesSet.size;

  // 2. Phân tích shooters (bao gồm Shooter 0, ShooterPipe 4, ShooterTunnel 6, ...)
  const shooters = Array.isArray(rawData.shooters) ? rawData.shooters : [];
  const num_shooters = shooters.length;
  let total_slots = 0;
  let active_slots = 0;
  let empty_slots = 0;
  const total_shots_by_type = {};
  const shooterMechanicCounts = {}; // { [shooterType]: { count, totalShots } }

  for (const shooter of shooters) {
    if (shooter && Array.isArray(shooter.list)) {
      for (const slot of shooter.list) {
        total_slots++;
        const sType = slot.shooterType !== undefined ? slot.shooterType : 0;
        const type = slot.type;
        const shotCount = Number(slot.shot) || 0;
        const param = Array.isArray(slot.param) ? slot.param : [];

        // 1. Detect Shooter Container Types
        if (sType === 4 || sType === 6) {
          const typeKey = sType === 4 ? 'pipe' : 'tunnel';
          if (!shooterMechanicCounts[typeKey]) {
            shooterMechanicCounts[typeKey] = { count: 0, totalShots: 0 };
          }
          shooterMechanicCounts[typeKey].count++;

          let nestedShots = 0;
          for (let k = 0; k <= param.length - 3; k += 3) {
            const subType = param[k];
            const subShot = param[k + 1];
            const subShooterType = param[k + 2];

            if (subShooterType === 0 && subShot > 0) {
              if (!isValidPaletteType(subType)) invalidTypesSet.add(subType);
              total_shots_by_type[subType] = (total_shots_by_type[subType] || 0) + subShot;
              nestedShots += subShot;
            }
          }
          shooterMechanicCounts[typeKey].totalShots += nestedShots;
          if (nestedShots > 0) {
            active_slots++;
          } else {
            empty_slots++;
          }
          continue;
        }

        if (sType === 1) {
          if (!shooterMechanicCounts['key_truck']) {
            shooterMechanicCounts['key_truck'] = { count: 0, totalShots: 0 };
          }
          shooterMechanicCounts['key_truck'].count++;
          if (shotCount > 0) shooterMechanicCounts['key_truck'].totalShots += shotCount;
        }

        if (sType === 5) {
          if (!shooterMechanicCounts['long_key']) {
            shooterMechanicCounts['long_key'] = { count: 0, totalShots: 0 };
          }
          shooterMechanicCounts['long_key'].count++;
          if (shotCount > 0) shooterMechanicCounts['long_key'].totalShots += shotCount;
        }

        if (sType === 7) {
          if (!shooterMechanicCounts['bomb_truck']) {
            shooterMechanicCounts['bomb_truck'] = { count: 0, totalShots: 0 };
          }
          shooterMechanicCounts['bomb_truck'].count++;
          if (shotCount > 0) shooterMechanicCounts['bomb_truck'].totalShots += shotCount;
        }

        // 2. Count Shots for standard shooters
        if (type !== undefined && type !== -1 && !isValidPaletteType(type)) {
          invalidTypesSet.add(type);
        }
        if (type !== undefined && type !== -1 && shotCount > 0) {
          total_shots_by_type[type] = (total_shots_by_type[type] || 0) + shotCount;
          active_slots++;
        } else {
          empty_slots++;
        }

        // 3. Detect Shooter Attachment Mechanics from slot.mechanics array:
        // ShooterMechanicType enum:
        // 1 = Unknow (Hidden Truck)
        // 2 = Linked (Connected Trucks)
        // 3 = Ice (Frozen Truck)
        // 4 = Curtains (Curtains)
        // 5 = LeftRight (Leaf and Flower)
        if (Array.isArray(slot.mechanics)) {
          for (const m of slot.mechanics) {
            if (!m || typeof m.type !== 'number') continue;
            let mecKey = null;
            if (m.type === 1) mecKey = 'hidden';
            else if (m.type === 2) mecKey = 'connected';
            else if (m.type === 3) mecKey = 'frozen';
            else if (m.type === 4) mecKey = 'curtains';
            else if (m.type === 5) mecKey = 'left_right';

            if (mecKey) {
              if (!shooterMechanicCounts[mecKey]) {
                shooterMechanicCounts[mecKey] = { count: 0, totalShots: 0 };
              }
              shooterMechanicCounts[mecKey].count++;
              shooterMechanicCounts[mecKey].totalShots += shotCount;
            }
          }
        }
      }
    }
  }

  // 3. Kiểm tra tính toàn vẹn (Invariant check: total_shots_by_type khớp CHÍNH XÁC blocks_by_type)
  const allEncounteredTypes = new Set([
    ...Object.keys(blocks_by_type).map(Number),
    ...Object.keys(total_shots_by_type).map(Number),
  ]);

  let invariant_valid = true;
  const invariantMismatches = [];

  for (const t of allEncounteredTypes) {
    const bCount = blocks_by_type[t] || 0;
    const sCount = total_shots_by_type[t] || 0;
    if (bCount !== sCount) {
      invariant_valid = false;
      invariantMismatches.push({
        type: t,
        blocks: bCount,
        shots: sCount,
        diff: sCount - bCount,
      });
    }
  }

  const invalid_types_found = Array.from(invalidTypesSet).sort((a, b) => a - b);

  // 4. Feature flags & Complexity Score
  const has_blockType_0 = Boolean(blockMechanicCounts[0]);
  const has_blockType_1 = Boolean(blockMechanicCounts[1] || blockMechanicCounts[2] || blockMechanicCounts[3] || blockMechanicCounts[4]);
  const has_blockType_5 = Boolean(blockMechanicCounts[5]); // Key Block
  const has_blockType_6 = Boolean(blockMechanicCounts[6]); // Mystery Block
  const has_blockType_7 = Boolean(blockMechanicCounts[7]); // Shooter Stack Block
  const has_blockType_8 = Boolean(blockMechanicCounts[8]); // Wall Block
  const has_blockType_9 = Boolean(blockMechanicCounts[9]); // Bomb Block

  const has_connected_trucks = Boolean(shooterMechanicCounts.connected);
  const has_hidden_truck = Boolean(shooterMechanicCounts.hidden);
  const has_frozen_truck = Boolean(shooterMechanicCounts.frozen);
  const has_bomb_shooter = Boolean(shooterMechanicCounts.bomb_truck);
  const has_long_key_shooter = Boolean(shooterMechanicCounts.long_key);
  const has_curtains = Boolean(shooterMechanicCounts.curtains);
  const has_pipe_shooter = Boolean(shooterMechanicCounts.pipe);
  const has_key_shooter = Boolean(shooterMechanicCounts.key_truck);
  const has_tunnel_shooter = Boolean(shooterMechanicCounts.tunnel);

  const has_special_shooters = Boolean(
    has_connected_trucks || has_hidden_truck || has_frozen_truck ||
    has_bomb_shooter || has_long_key_shooter || has_curtains ||
    has_pipe_shooter || has_key_shooter || has_tunnel_shooter
  );

  const has_special_mechanics = Boolean(
    has_blockType_1 || has_blockType_5 || has_blockType_6 ||
    has_blockType_7 || has_blockType_8 || has_blockType_9 || has_special_shooters
  );

  // Composite Complexity Score
  const complexity_score = Number(
    (unique_types_used * (fill_ratio_pct / 10) * (has_special_mechanics ? 1.5 : 1.0)).toFixed(1)
  );

  const difficulty = getLevelDifficulty(fileInfo.levelNumber);
  const difficultyMeta = getDifficultyMeta(difficulty);

  return {
    isError: false,
    fileName,
    level: fileInfo.levelNumber,
    hasLevelWarning: fileInfo.hasWarning,
    difficulty,
    difficultyMeta,
    id: rawData.id !== undefined ? String(rawData.id) : '',
    girdSizeX,
    girdSizeY,
    total_cells,
    active_blocks,
    fill_ratio_pct,
    unique_types_used,
    blocks_by_type,
    num_shooters,
    total_slots,
    active_slots,
    empty_slots,
    total_shots_by_type,
    invariant_valid,
    invariantMismatches,
    invalid_types_found,
    // Mechanics Summary
    blockMechanicCounts,
    shooterMechanicCounts,
    has_blockType_0,
    has_blockType_1,
    has_blockType_5,
    has_blockType_6,
    has_blockType_7,
    has_blockType_8,
    has_blockType_9,
    has_connected_trucks,
    has_hidden_truck,
    has_frozen_truck,
    has_bomb_shooter,
    has_long_key_shooter,
    has_curtains,
    has_pipe_shooter,
    has_key_shooter,
    has_tunnel_shooter,
    has_special_shooters,
    has_special_mechanics,
    complexity_score,
    rawJson: rawData,
  };
}
