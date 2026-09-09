/**
 * csvExporter.js
 * Xuất ma trận Proposed LD Blueprint (gồm cả các override và comment của user) ra file CSV.
 * Hỗ trợ BOM UTF-8 (\uFEFF) để Excel hiển thị đúng Tiếng Việt.
 */

import { getProposedLevelDifficultyInfo, PROPOSED_MECHANIC_BLUEPRINT, PROPOSED_BOOSTER_BLUEPRINT } from './mechanicMapRenderer.js';

/**
 * Escapes a field for CSV format.
 * Wraps with quotes if it contains commas, newlines or quotes.
 */
function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Xuất ma trận đề xuất ra CSV
 * @param {Map<number, Array<Object>>} levelPhaseMap - Computed phase map cho từng level
 * @param {Map<string, Object>} editsMap - User edits / overrides map
 * @param {number} minLevel - Level bắt đầu
 * @param {number} maxLevel - Level kết thúc
 */
export function exportProposedBlueprintCSV(levelPhaseMap, editsMap = new Map(), minLevel = 1, maxLevel = 200) {
  const headers = [
    'Level',
    'DifficultyType',
    'MechanicId',
    'MechanicName',
    'Tier',
    'Phase',
    'IsUserOverride',
    'OverrideType',
    'UserComment',
    'TeachLevel',
    'TestLevel',
    'CombineStartLevel',
    'BehaviorChange',
    'PacingNote'
  ];

  const rows = [];
  rows.push(headers.map(escapeCSV).join(','));

  // Duyệt từng level từ minLevel tới maxLevel
  for (let lvl = minLevel; lvl <= maxLevel; lvl++) {
    const diffInfo = getProposedLevelDifficultyInfo(lvl);
    const diffType = diffInfo ? diffInfo.type : 'NORMAL';
    const activeList = levelPhaseMap.get(lvl) || [];

    // 1. Gameplay Mechanics
    PROPOSED_MECHANIC_BLUEPRINT.forEach((mech) => {
      const compositeKey = `${lvl}_${mech.id}`;
      const userEdit = editsMap.get(compositeKey);
      const computedEntry = activeList.find((a) => a.mech.id === mech.id);

      let phase = '';
      let isOverride = false;
      let overrideType = '';
      let comment = '';

      if (userEdit) {
        isOverride = true;
        overrideType = userEdit.overrideType || '';
        comment = userEdit.comment || '';

        if (userEdit.overrideType === 'removed') {
          phase = 'REMOVED';
        } else if (userEdit.overrideType === 'added' || userEdit.overrideType === 'phase_changed') {
          phase = userEdit.overridePhase || (computedEntry ? computedEntry.phase : 'combine');
        } else if (computedEntry) {
          phase = computedEntry.phase;
        }
      } else if (computedEntry) {
        phase = computedEntry.phase;
      }

      // Chỉ xuất hàng nếu có phase (hoặc có edit/comment)
      if (phase || comment || isOverride) {
        rows.push([
          lvl,
          diffType,
          mech.id,
          mech.name,
          mech.tier,
          phase,
          isOverride ? 'TRUE' : 'FALSE',
          overrideType,
          comment,
          mech.teachLevel,
          mech.testLevel,
          mech.combineStartLevel,
          mech.behaviorChange,
          mech.pacingNote
        ].map(escapeCSV).join(','));
      }
    });

    // 2. Booster Tutorials
    PROPOSED_BOOSTER_BLUEPRINT.forEach((booster) => {
      const compositeKey = `${lvl}_${booster.id}`;
      const userEdit = editsMap.get(compositeKey);
      let phase = '';
      let isOverride = false;
      let overrideType = '';
      let comment = '';

      if (lvl === booster.teachLevel) {
        phase = 'booster_teach';
      } else if (booster.recommendedUseLevels && booster.recommendedUseLevels.includes(lvl)) {
        phase = 'booster_recommended_use';
      }

      if (userEdit) {
        isOverride = true;
        overrideType = userEdit.overrideType || '';
        comment = userEdit.comment || '';
        if (userEdit.overrideType === 'removed') phase = 'REMOVED';
        else if (userEdit.overridePhase) phase = userEdit.overridePhase;
      }

      if (phase || comment || isOverride) {
        rows.push([
          lvl,
          diffType,
          booster.id,
          booster.name,
          'BOOSTER',
          phase,
          isOverride ? 'TRUE' : 'FALSE',
          overrideType,
          comment,
          booster.teachLevel,
          '-',
          '-',
          booster.behaviorChange,
          booster.intent
        ].map(escapeCSV).join(','));
      }
    });

    // 3. Level Note / Comment chung cho Level
    const levelCommentEdit = editsMap.get(`${lvl}_#level_comment`);
    if (levelCommentEdit && levelCommentEdit.comment) {
      rows.push([
        lvl,
        diffType,
        '#level_comment',
        'LEVEL_NOTE',
        'NOTE',
        '-',
        'TRUE',
        'level_comment',
        levelCommentEdit.comment,
        '-',
        '-',
        '-',
        '-',
        'Ghi chú chung cho Level'
      ].map(escapeCSV).join(','));
    }
  }

  const csvContent = '\uFEFF' + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  link.setAttribute('href', url);
  link.setAttribute('download', `proposed_mechanic_blueprint_L${minLevel}-L${maxLevel}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
