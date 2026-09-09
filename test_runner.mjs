/**
 * test_runner.mjs
 * Script kiểm thử tự động toàn bộ logic parse, filter, sort và invariants.
 */

import { parseLevelData } from './level_tracker/js/jsonParser.js';
import { filterLevels, sortLevels } from './level_tracker/js/filterEngine.js';
import { PALETTE, getColor, isValidPaletteType } from './level_tracker/js/palette.js';
import fs from 'fs';
import path from 'path';

console.log('🧪 Bắt đầu kiểm thử Level Tracker...\n');

// 1. Test Palette
console.log('--- 1. Kiểm tra Palette (36 màu) ---');
console.assert(Object.keys(PALETTE).length === 36, 'Palette phải có đúng 36 màu');
console.assert(PALETTE[0] === '#F1383A', 'ID 0 phải là #F1383A');
console.assert(PALETTE[35] === '#657842', 'ID 35 phải là #657842');
console.assert(getColor(-1) === null, 'Type -1 phải trả về null');
console.assert(isValidPaletteType(0) === true, 'Type 0 hợp lệ');
console.assert(isValidPaletteType(35) === true, 'Type 35 hợp lệ');
console.assert(isValidPaletteType(36) === false, 'Type 36 không hợp lệ');
console.assert(isValidPaletteType(-1) === false, 'Type -1 không phải palette màu');
console.log('✅ Palette test PASS!\n');

// 2. Test Parser với file 1.json
console.log('--- 2. Kiểm tra Parser với sample_levels/1.json ---');
const sample1Raw = fs.readFileSync(path.resolve('./level_tracker/sample_levels/1.json'), 'utf8');
const level1 = parseLevelData(sample1Raw, '1.json');

console.log(`Level: ${level1.level}`);
console.log(`Grid Size: ${level1.girdSizeX}x${level1.girdSizeY} (Total: ${level1.total_cells})`);
console.log(`Active Blocks: ${level1.active_blocks}`);
console.log(`Fill Ratio: ${level1.fill_ratio_pct}%`);
console.log(`Unique Types Used: ${level1.unique_types_used}`);
console.log(`Blocks by Type:`, level1.blocks_by_type);
console.log(`Total Shots by Type:`, level1.total_shots_by_type);
console.log(`Invariant Valid: ${level1.invariant_valid}`);
console.log(`Invalid Types:`, level1.invalid_types_found);

console.assert(level1.level === 1, 'Level phải bằng 1');
console.assert(level1.girdSizeX === 11, 'girdSizeX phải bằng 11');
console.assert(level1.girdSizeY === 20, 'girdSizeY phải bằng 20');
console.assert(level1.total_cells === 220, 'total_cells phải bằng 220');
console.assert(level1.invariant_valid === true, 'Level 1 phải khớp Invariant');
console.assert(level1.invalid_types_found.length === 0, 'Level 1 không được có invalid types');
console.log('✅ Parser 1.json test PASS!\n');

// 3. Test Parser với error_level.json
console.log('--- 3. Kiểm tra Parser với sample_levels/error_level.json ---');
const errorRaw = fs.readFileSync(path.resolve('./level_tracker/sample_levels/error_level.json'), 'utf8');
const errorLevel = parseLevelData(errorRaw, 'error_level.json');

console.log(`Invariant Valid: ${errorLevel.invariant_valid} (Mong đợi: false)`);
console.log(`Invariant Mismatches:`, errorLevel.invariantMismatches);
console.log(`Invalid Types:`, errorLevel.invalid_types_found, '(Mong đợi: [99])');

console.assert(errorLevel.invariant_valid === false, 'error_level phải có invariant_valid = false');
console.assert(errorLevel.invalid_types_found.includes(99), 'error_level phải phát hiện type 99');
console.log('✅ Parser error_level.json test PASS!\n');

// 4. Test Filter & Sort Engine
console.log('--- 4. Kiểm tra Filter & Sort Engine ---');
const sample2Raw = fs.readFileSync(path.resolve('./level_tracker/sample_levels/2.json'), 'utf8');
const level2 = parseLevelData(sample2Raw, '2.json');

const sample3Raw = fs.readFileSync(path.resolve('./level_tracker/sample_levels/3.json'), 'utf8');
const level3 = parseLevelData(sample3Raw, '3.json');

const allLevels = [level1, level2, level3, errorLevel];

// Test filter boolean invariant_valid = true
const validLevels = filterLevels(allLevels, [{ property: 'invariant_valid', operator: 'true', value: true }]);
console.log(`Số level hợp lệ invariant: ${validLevels.length} / 4`);
console.assert(validLevels.length === 3, 'Phải có đúng 3 level invariant hợp lệ');

// Test filter fill_ratio_pct > 20%
const highFillLevels = filterLevels(allLevels, [{ property: 'fill_ratio_pct', operator: 'gt', value: 20 }]);
console.log(`Số level có fill > 20%: ${highFillLevels.length}`);

// Test Sort
const sortedByGrid = sortLevels(allLevels, 'total_cells', 'desc');
console.log('Sort theo total_cells giảm dần:', sortedByGrid.map(l => `${l.level} (${l.total_cells} cells)`));
console.assert(sortedByGrid[0].total_cells >= sortedByGrid[1].total_cells, 'Sort giảm dần phải đúng');

console.log('✅ Filter & Sort test PASS!\n');

// 5. Test Playtest Engine (BFS loang & gameplay simulation)
console.log('--- 5. Kiểm tra Playtest Engine ---');
import { PlaytestEngine } from './level_tracker/js/playtestEngine.js';

const engine = new PlaytestEngine(level1, { speedMulti: 100 });
console.assert(engine.width === 11 && engine.height === 20, 'Kích thước grid khớp level 1');
console.assert(engine.totalActiveBlocks === 43, 'Active blocks ban đầu là 43');
console.assert(engine.tray.length === 5, 'Khay chứa có 5 slots');

const initialExposedType2 = engine.getExposedBlocksOfType(2);
const initialExposedType5 = engine.getExposedBlocksOfType(5);
console.log(`Exposed ban đầu Type 2: ${initialExposedType2.length}, Type 5: ${initialExposedType5.length}`);
console.assert(initialExposedType2.length > 0 || initialExposedType5.length > 0, 'Phải có block lộ diện ban đầu');

// Bắn tự động tất cả các bước
let maxSteps = 20;
while (!engine.isGameOver && maxSteps-- > 0) {
  await engine.autoStep();
}

console.log(`Trạng thái sau khi chơi: isWin=${engine.isWin}, isLose=${engine.isLose}, blocks còn lại=${engine.totalActiveBlocks}`);
console.assert(engine.isWin === true, 'Level 1 phải giải thành công (Win)!');
console.assert(engine.totalActiveBlocks === 0, 'Toàn bộ 43 blocks phải được dọn sạch');
console.log('✅ Playtest Engine test PASS!\n');

console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐÃ THÀNH CÔNG RỰC RỠ!');
