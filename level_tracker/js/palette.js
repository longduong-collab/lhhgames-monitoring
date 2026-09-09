/**
 * palette.js
 * Định nghĩa duy nhất danh sách 36 mã màu (ID 0 - 35) cho hệ thống Game.
 * Cập nhật chính xác theo bảng mã màu do người dùng chỉ định.
 */

export const PALETTE = {
  0: '#F1383A',
  1: '#FF8331',
  2: '#FFC917',
  3: '#30CFFF',
  4: '#2D64E6',
  5: '#41EC19',
  6: '#278D49',
  7: '#FF65CD',
  8: '#A73CFF',
  9: '#FFFFFF',
  10: '#3F3F3F',
  11: '#79573D',
  12: '#FABFFC',
  13: '#1E7C1B',
  14: '#FFD58F',
  15: '#CE863F',
  16: '#2DE6D0',
  17: '#CA246B',
  18: '#B9F4FA',
  19: '#A7E21D',
  20: '#665DD2',
  21: '#959597',
  22: '#9A2538',
  23: '#FA4B6F',
  24: '#FF8F79',
  25: '#26ACA5',
  26: '#274268',
  27: '#305D50',
  28: '#CAA317',
  29: '#CDABCD',
  30: '#A1FFA1',
  31: '#B0A89B',
  32: '#979CB4',
  33: '#FFD2B4',
  34: '#BE7B85',
  35: '#657842',
};

// Màu đại diện cho ô trống / nền (type = -1)
export const BACKGROUND_COLOR = '#151824';
export const EMPTY_CELL_COLOR = 'rgba(255, 255, 255, 0.04)';
export const EMPTY_CELL_BORDER = 'rgba(255, 255, 255, 0.08)';

/**
 * Kiểm tra xem ID màu có hợp lệ trong palette chuẩn (0-35) hay không.
 * @param {number} type - Mã loại màu
 * @returns {boolean}
 */
export function isValidPaletteType(type) {
  return Number.isInteger(type) && type >= 0 && type <= 35;
}

/**
 * Lấy mã hex tương ứng với type.
 * @param {number} type - Mã loại màu
 * @returns {string|null} - Trả về mã Hex hoặc null nếu là type = -1 (ô trống)
 */
export function getColor(type) {
  if (type === -1) {
    return null;
  }
  if (PALETTE[type] !== undefined) {
    return PALETTE[type];
  }
  // Loại ngoài biên (-1 hoặc 0-35)
  return '#FF0055'; // Màu cảnh báo đỏ chói cho type không hợp lệ
}
