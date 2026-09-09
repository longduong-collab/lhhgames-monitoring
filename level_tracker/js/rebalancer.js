/**
 * rebalancer.js
 * Module thực thi kiểm tra vi phạm và tái cân bằng bãi đỗ xe (Dock Layout & Capacity Rules)
 * Cho game Bus-Jam / Color-Shooter.
 */

export const CONFIG = {
  CAPACITY_RULES: [
    { minLevel: 1, maxLevel: 50, maxShot: 45 },
    { minLevel: 51, maxLevel: 999, maxShot: 150 },
  ],
  MAX_COLS: 4,
  MAX_ROWS: 4,
  MAX_VISIBLE_ROWS: 3, // 3 hàng hiển thị x 4 cột = 12 xe tối đa
  MAX_VISIBLE_SLOTS: 12,
};

/**
 * Lấy giới hạn capacity cho level tương ứng
 * @param {number|string} levelNum 
 * @returns {number|null}
 */
export function getCapForLevel(levelNum) {
  const num = parseInt(levelNum, 10);
  if (isNaN(num)) return null;

  for (const rule of CONFIG.CAPACITY_RULES) {
    if (num >= rule.minLevel && num <= rule.maxLevel) {
      return rule.maxShot;
    }
  }
  return null;
}

/**
 * Kiểm tra xem 1 level có vi phạm rule capacity hoặc rule layout hay không
 * @param {object} rawJson 
 * @param {number|string} levelNum 
 * @returns {{
 *   isViolated: boolean,
 *   capLimit: number|null,
 *   exceedingCount: number,
 *   isLayoutViolated: boolean,
 *   cols: number,
 *   rows: number,
 *   reasons: string[]
 * }}
 */
export function checkDockRule(rawJson, levelNum) {
  const capLimit = getCapForLevel(levelNum);
  const shooters = Array.isArray(rawJson?.shooters) ? rawJson.shooters : [];
  const cols = shooters.length;
  let rows = 0;

  for (const col of shooters) {
    const listLen = Array.isArray(col?.list) ? col.list.length : 0;
    if (listLen > rows) rows = listLen;
  }

  const reasons = [];
  let exceedingCount = 0;

  // 1. Kiểm tra capacity nếu có rule quy định
  if (capLimit !== null) {
    for (let c = 0; c < shooters.length; c++) {
      const colList = shooters[c]?.list || [];
      for (let r = 0; r < colList.length; r++) {
        const slot = colList[r];
        if (!slot) continue;
        const st = slot.shooterType;
        const shot = Number(slot.shot) || 0;
        const param = Array.isArray(slot.param) ? slot.param : [];

        if (st === 0 && shot > capLimit) {
          exceedingCount++;
        } else if ((st === 4 || st === 6) && param.length >= 3) {
          for (let k = 0; k <= param.length - 3; k += 3) {
            const subShot = Number(param[k + 1]) || 0;
            if (subShot > capLimit) {
              exceedingCount++;
            }
          }
        }
      }
    }
  }

  if (exceedingCount > 0) {
    reasons.push(`${exceedingCount} xe vượt cap ${capLimit}`);
  }

  // 2. Kiểm tra layout UI (chỉ áp dụng nếu level nằm trong dải quy định)
  let isLayoutViolated = false;
  if (capLimit !== null) {
    if (cols > CONFIG.MAX_COLS || rows > CONFIG.MAX_ROWS) {
      isLayoutViolated = true;
      reasons.push(`Layout ${cols}×${rows} vượt khung 4×4`);
    }
  }

  return {
    isViolated: exceedingCount > 0 || isLayoutViolated,
    capLimit,
    exceedingCount,
    isLayoutViolated,
    cols,
    rows,
    reasons,
  };
}

/**
 * Tái cân bằng bãi đỗ xe cho 1 level:
 * 1. Duỗi phẳng row-major (rã cả Pipe/Tunnel cũ)
 * 2. Tách xe vượt cap (giữ mechanic ở xe đầu tiên)
 * 3. Heuristic: Ưu tiên giữ xe có mechanic trong cụm hiển thị 3×4
 * 4. Lấp cụm 3×4 (12 slot hiển thị)
 * 5. Phần dư đẩy vào hàng Pipe thứ 4 (chia round-robin theo 4 cột)
 * 
 * @param {object} rawJson 
 * @param {number|string} levelNum 
 * @returns {{ fixedJson: object, wasFixed: boolean, reasons: string[] }}
 */
export function rebalanceLevel(rawJson, levelNum) {
  const check = checkDockRule(rawJson, levelNum);
  if (!check.isViolated) {
    return {
      fixedJson: rawJson,
      wasFixed: false,
      reasons: [],
    };
  }

  const capLimit = check.capLimit || 45;
  const origShooters = Array.isArray(rawJson?.shooters) ? rawJson.shooters : [];

  // 1. Duỗi phẳng toàn bộ ô theo row-major order (hàng trước, cột sau)
  const maxRows = Math.max(0, ...origShooters.map(c => (c.list ? c.list.length : 0)));
  const flattenedCars = [];

  for (let r = 0; r < maxRows; r++) {
    for (let c = 0; c < origShooters.length; c++) {
      const colList = origShooters[c]?.list || [];
      if (r < colList.length) {
        const slot = colList[r];
        if (!slot) continue;
        const st = slot.shooterType;
        const shot = Number(slot.shot) || 0;
        const type = slot.type !== undefined ? slot.type : -1;
        const param = Array.isArray(slot.param) ? slot.param : [];
        const mechs = Array.isArray(slot.mechanics) ? slot.mechanics : [];

        if (st === 3) {
          // Bỏ qua ô trống để sắp xếp lại gọn gàng
          continue;
        } else if (st === 4 || st === 6) {
          // Rã xe trong Pipe/Tunnel cũ
          for (let k = 0; k <= param.length - 3; k += 3) {
            flattenedCars.append ? flattenedCars.push({
              type: param[k],
              shot: param[k + 1],
              shooterType: param[k + 2] !== undefined ? param[k + 2] : 0,
              mechanics: [],
            }) : flattenedCars.push({
              type: param[k],
              shot: param[k + 1],
              shooterType: param[k + 2] !== undefined ? param[k + 2] : 0,
              mechanics: [],
            });
          }
        } else {
          // Xe thông thường hoặc xe đặc biệt khác
          flattenedCars.push({
            type,
            shot,
            shooterType: st,
            mechanics: JSON.parse(JSON.stringify(mechs)),
          });
        }
      }
    }
  }

  // 2. Tách xe vượt cap: xe > cap được tách thành nhiều xe cùng màu <= cap
  let splitCars = [];
  for (const car of flattenedCars) {
    if (car.shooterType === 0 && car.shot > capLimit) {
      let rem = car.shot;
      let isFirst = true;
      while (rem > 0) {
        const s = Math.min(rem, capLimit);
        splitCars.push({
          type: car.type,
          shot: s,
          shooterType: 0,
          mechanics: isFirst ? JSON.parse(JSON.stringify(car.mechanics)) : [],
          __id: isFirst ? car.__id : undefined,
        });
        rem -= s;
        isFirst = false;
      }
    } else {
      splitCars.push(car);
    }
  }

  // 3. Heuristic: Ưu tiên giữ xe có mechanic nằm trong cụm hiển thị 3×4 (12 ô đầu)
  const visibleLimit = CONFIG.MAX_VISIBLE_SLOTS; // 12
  for (let i = visibleLimit; i < splitCars.length; i++) {
    if (splitCars[i].mechanics && splitCars[i].mechanics.length > 0) {
      // Tìm xe trong 12 ô đầu KHÔNG mang mechanic để hoán đổi
      for (let j = 0; j < visibleLimit; j++) {
        if (!splitCars[j].mechanics || splitCars[j].mechanics.length === 0) {
          const temp = splitCars[i];
          splitCars[i] = splitCars[j];
          splitCars[j] = temp;
          break;
        }
      }
    }
  }

  // Đảm bảo tuyệt đối: xe ở hàng đợi Pipe (index >= 12) không mang mechanic
  for (let i = visibleLimit; i < splitCars.length; i++) {
    splitCars[i].mechanics = [];
  }

  // 4. Khởi tạo cấu trúc 4 cột
  const newShooters = [
    { list: [] },
    { list: [] },
    { list: [] },
    { list: [] },
  ];

  // Điền 3 hàng đầu tiên (3 hàng x 4 cột = 12 xe hiển thị)
  for (let r = 0; r < CONFIG.MAX_VISIBLE_ROWS; r++) {
    for (let c = 0; c < CONFIG.MAX_COLS; c++) {
      const idx = r * CONFIG.MAX_COLS + c;
      if (idx < splitCars.length) {
        const car = splitCars[idx];
        newShooters[c].list.push({
          type: car.type,
          shot: car.shot,
          shooterType: car.shooterType,
          param: [],
          mechanics: car.mechanics || [],
        });
      } else {
        // Lấp ô trống nếu thiếu
        newShooters[c].list.push({
          type: 0,
          shot: 0,
          shooterType: 3,
          param: [],
          mechanics: [],
        });
      }
    }
  }

  // 5. Hàng thứ 4 (hàng Pipe dự trữ): chia phần dư từ xe thứ 13 trở đi round-robin vào 4 cột
  const pipeParams = [[], [], [], []];
  for (let idx = visibleLimit; idx < splitCars.length; idx++) {
    const pipeCol = (idx - visibleLimit) % CONFIG.MAX_COLS;
    const car = splitCars[idx];
    pipeParams[pipeCol].push(car.type, car.shot, car.shooterType || 0);
  }

  for (let c = 0; c < CONFIG.MAX_COLS; c++) {
    newShooters[c].list.push({
      type: 0, // rotation 0: nhả thẳng về phía trước (row 2)
      shot: 0,
      shooterType: 4, // Pipe
      param: pipeParams[c],
      mechanics: [],
    });
  }

  const fixedJson = JSON.parse(JSON.stringify(rawJson));
  fixedJson.shooters = newShooters;

  return {
    fixedJson,
    wasFixed: true,
    reasons: check.reasons,
  };
}

/**
 * Tải file JSON xuống máy người dùng
 * @param {object} jsonContent 
 * @param {string} fileName 
 */
export function exportLevelJson(jsonContent, fileName = 'level.json') {
  const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Xuất hàng loạt tất cả file đã sửa (trigger tuần tự)
 * @param {Array<object>} fixedLevels 
 */
export async function exportAllFixedLevels(fixedLevels) {
  for (let i = 0; i < fixedLevels.length; i++) {
    const item = fixedLevels[i];
    const fileName = item.fileName || `${item.level}.json`;
    exportLevelJson(item.rawJson, fileName);
    // Delay nhỏ giữa các file để tránh trình duyệt chặn popup download
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}
