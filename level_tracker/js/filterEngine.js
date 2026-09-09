/**
 * filterEngine.js
 * Chịu trách nhiệm lọc (Filter) đa điều kiện và sắp xếp (Sort) danh sách Level đã import.
 */

// Định nghĩa metadata của các property để xây dựng dynamic dropdown và toán tử phù hợp
export const PROPERTY_DEFINITIONS = [
  { key: 'level', label: 'Level (Số)', type: 'number' },
  { key: 'id', label: 'ID Level', type: 'string' },
  { key: 'level_range', label: 'Level Range (Min - Max)', type: 'range' },
  { key: 'complexity_score', label: 'Complexity Score', type: 'number' },
  { key: 'girdSizeX', label: 'girdSizeX (Cột)', type: 'number' },
  { key: 'girdSizeY', label: 'girdSizeY (Hàng)', type: 'number' },
  { key: 'total_cells', label: 'Total Cells (Ô)', type: 'number' },
  { key: 'active_blocks', label: 'Active Blocks', type: 'number' },
  { key: 'fill_ratio_pct', label: 'Fill Ratio (%)', type: 'number' },
  { key: 'unique_types_used', label: 'Unique Types', type: 'number' },
  { key: 'num_shooters', label: 'Num Shooters', type: 'number' },
  { key: 'total_slots', label: 'Total Slots', type: 'number' },
  { key: 'active_slots', label: 'Active Slots', type: 'number' },
  { key: 'empty_slots', label: 'Empty Slots', type: 'number' },
  { key: 'invariant_valid', label: 'Invariant Valid (Khớp Shots)', type: 'boolean' },
  { key: 'has_invalid_types', label: 'Có Type Không Hợp Lệ', type: 'boolean' },
  { key: 'has_blockType_7', label: 'Có BlockShooter (7)', type: 'boolean' },
  { key: 'has_blockType_9', label: 'Có BlockBomb (9)', type: 'boolean' },
  { key: 'has_blockType_5', label: 'Có BlockKey (5)', type: 'boolean' },
  { key: 'has_blockType_6', label: 'Có BlockUnknown (6)', type: 'boolean' },
  { key: 'has_blockType_1', label: 'Có BlockBig (1-4)', type: 'boolean' },
  { key: 'has_blockType_8', label: 'Có BlockWall (8)', type: 'boolean' },
  { key: 'has_pipe_shooter', label: 'Có ShooterPipe (4)', type: 'boolean' },
  { key: 'has_tunnel_shooter', label: 'Có ShooterTunnel (6)', type: 'boolean' },
  { key: 'has_special_mechanics', label: 'Có Mechanic Đặc Biệt', type: 'boolean' },
  { key: 'fileName', label: 'Tên File', type: 'string' },
];

export const OPERATORS = {
  number: [
    { value: 'eq', label: '= (Bằng)' },
    { value: 'neq', label: '≠ (Khác)' },
    { value: 'gt', label: '> (Lớn hơn)' },
    { value: 'gte', label: '≥ (Lớn hơn hoặc bằng)' },
    { value: 'lt', label: '< (Nhỏ hơn)' },
    { value: 'lte', label: '≤ (Nhỏ hơn hoặc bằng)' },
  ],
  range: [
    { value: 'between', label: 'Trong khoảng (VD: 1-100)' },
  ],
  string: [
    { value: 'contains', label: 'Chứa ký tự' },
    { value: 'eq', label: '= (Chính xác)' },
    { value: 'starts_with', label: 'Bắt đầu bằng' },
    { value: 'ends_with', label: 'Kết thúc bằng' },
  ],
  boolean: [
    { value: 'true', label: 'Đúng (True / Có)' },
    { value: 'false', label: 'Sai (False / Không)' },
  ],
};

/**
 * Lấy định nghĩa của một property key
 */
export function getPropertyDefinition(key) {
  return PROPERTY_DEFINITIONS.find((def) => def.key === key) || { key, label: key, type: 'string' };
}

/**
 * Kiểm tra 1 item level có thỏa mãn 1 điều kiện filter hay không.
 * @param {object} level - Dữ liệu level đã parse
 * @param {object} condition - { property, operator, value }
 * @returns {boolean}
 */
export function matchCondition(level, condition) {
  const { property, operator, value } = condition;
  const propDef = getPropertyDefinition(property);

  if (property === 'level_range') {
    const lvl = Number(level.level);
    if (isNaN(lvl)) return false;
    const parts = String(value).split(/[-:,_]/).map((p) => Number(p.trim())).filter((n) => !isNaN(n));
    if (parts.length === 1) return lvl >= parts[0];
    if (parts.length >= 2) return lvl >= parts[0] && lvl <= parts[1];
    return true;
  }

  let targetValue;
  if (property === 'has_invalid_types') {
    targetValue = Array.isArray(level.invalid_types_found) && level.invalid_types_found.length > 0;
  } else {
    targetValue = level[property];
  }

  if (targetValue === undefined || targetValue === null) {
    return false;
  }

  if (propDef.type === 'number') {
    const numTarget = Number(targetValue);
    const numFilter = Number(value);
    if (isNaN(numTarget) || isNaN(numFilter)) return false;

    switch (operator) {
      case 'eq': return numTarget === numFilter;
      case 'neq': return numTarget !== numFilter;
      case 'gt': return numTarget > numFilter;
      case 'gte': return numTarget >= numFilter;
      case 'lt': return numTarget < numFilter;
      case 'lte': return numTarget <= numFilter;
      default: return true;
    }
  }

  if (propDef.type === 'boolean') {
    const boolTarget = Boolean(targetValue);
    const boolFilter = operator === 'true' || value === 'true' || value === true;
    return boolTarget === boolFilter;
  }

  if (propDef.type === 'string') {
    const strTarget = String(targetValue).toLowerCase();
    const strFilter = String(value || '').toLowerCase().trim();

    switch (operator) {
      case 'contains': return strTarget.includes(strFilter);
      case 'eq': return strTarget === strFilter;
      case 'starts_with': return strTarget.startsWith(strFilter);
      case 'ends_with': return strTarget.endsWith(strFilter);
      default: return true;
    }
  }

  return true;
}

/**
 * Lọc danh sách Level qua danh sách điều kiện AND.
 * @param {Array<object>} levels - Danh sách level
 * @param {Array<object>} conditions - Danh sách điều kiện filter
 * @returns {Array<object>} - Danh sách level sau khi lọc
 */
export function filterLevels(levels, conditions = []) {
  if (!conditions || conditions.length === 0) {
    return [...levels];
  }
  return levels.filter((level) => {
    // Nếu level là dòng lỗi cú pháp JSON và không có property, chỉ lọc theo fileName nếu có
    if (level.isError) {
      return conditions.every((c) => c.property === 'fileName' ? matchCondition(level, c) : false);
    }
    return conditions.every((c) => matchCondition(level, c));
  });
}

/**
 * Sắp xếp danh sách Level theo một cột.
 * @param {Array<object>} levels - Danh sách level
 * @param {string} sortKey - Tên cột cần sort
 * @param {'asc'|'desc'} sortDirection - Hướng sort
 * @returns {Array<object>} - Danh sách level đã sort
 */
export function sortLevels(levels, sortKey, sortDirection = 'asc') {
  if (!sortKey) return [...levels];

  const sorted = [...levels].sort((a, b) => {
    // Đẩy dòng lỗi xuống cuối hoặc đầu tùy theo ngữ cảnh
    if (a.isError && !b.isError) return 1;
    if (!a.isError && b.isError) return -1;
    if (a.isError && b.isError) return 0;

    let valA = a[sortKey];
    let valB = b[sortKey];

    if (sortKey === 'has_invalid_types') {
      valA = a.invalid_types_found?.length > 0;
      valB = b.invalid_types_found?.length > 0;
    }

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    // So sánh số
    const numA = Number(valA);
    const numB = Number(valB);
    if (!isNaN(numA) && !isNaN(numB) && typeof valA !== 'boolean' && typeof valB !== 'boolean') {
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    }

    // So sánh boolean
    if (typeof valA === 'boolean' || typeof valB === 'boolean') {
      const bA = valA ? 1 : 0;
      const bB = valB ? 1 : 0;
      return sortDirection === 'asc' ? bA - bB : bB - bA;
    }

    // So sánh chuỗi
    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();
    const cmp = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  return sorted;
}

// Preset Management
const PRESETS_STORAGE_KEY = 'pixel_ball_filter_presets_v1';

export const DEFAULT_PRESETS = [
  {
    name: '⚠️ Level Lỗi Invariant',
    conditions: [
      { id: 'p_inv', property: 'invariant_valid', operator: 'false', value: false, label: 'Invariant Valid = Sai' },
    ],
  },
  {
    name: '🔫 Có BlockShooter',
    conditions: [
      { id: 'p_bsh', property: 'has_blockType_7', operator: 'true', value: true, label: 'Có BlockShooter (7)' },
    ],
  },
  {
    name: '🚀 Có Shooter Đặc Biệt (Pipe/Tunnel)',
    conditions: [
      { id: 'p_pipe', property: 'has_pipe_shooter', operator: 'true', value: true, label: 'Có ShooterPipe (4)' },
    ],
  },
  {
    name: '🔥 Độ phức tạp cao (Complexity > 30)',
    conditions: [
      { id: 'p_cplx', property: 'complexity_score', operator: 'gt', value: 30, label: 'Complexity Score > 30' },
    ],
  },
];

export function getFilterPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return DEFAULT_PRESETS;
    const custom = JSON.parse(raw);
    return Array.isArray(custom) ? [...DEFAULT_PRESETS, ...custom] : DEFAULT_PRESETS;
  } catch (e) {
    return DEFAULT_PRESETS;
  }
}

export function saveFilterPreset(name, conditions) {
  if (!name || !conditions || conditions.length === 0) return false;
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    let custom = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(custom)) custom = [];
    // Ghi đè nếu trùng tên
    custom = custom.filter((p) => p.name !== name);
    custom.push({ name, conditions });
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(custom));
    return true;
  } catch (e) {
    console.error('Lỗi khi lưu preset:', e);
    return false;
  }
}

export function deleteFilterPreset(name) {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return;
    let custom = JSON.parse(raw);
    if (Array.isArray(custom)) {
      custom = custom.filter((p) => p.name !== name);
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(custom));
    }
  } catch (e) {
    console.error('Lỗi khi xoá preset:', e);
  }
}
