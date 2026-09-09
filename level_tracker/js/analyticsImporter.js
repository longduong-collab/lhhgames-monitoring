/**
 * analyticsImporter.js
 * Chịu trách nhiệm đọc, validate và chuẩn hoá dữ liệu Analytics từ file JSON.
 * Hỗ trợ linh hoạt mọi format: flat array, wrapper object { rows: [...] }, { data: [...] }
 */

export class AnalyticsImporter {
  constructor(elements = {}, callbacks = {}) {
    this.dropZoneEl = elements.dropZoneEl;
    this.fileInputEl = elements.fileInputEl;
    this.callbacks = callbacks; // { onPreview: (rows, meta, confirmCb), onDataImported: (rows, mode) }

    this.initEvents();
  }

  initEvents() {
    if (!this.dropZoneEl || !this.fileInputEl) return;

    this.dropZoneEl.addEventListener('click', () => {
      this.fileInputEl.click();
    });

    this.dropZoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZoneEl.classList.add('drag-over');
    });

    this.dropZoneEl.addEventListener('dragleave', () => {
      this.dropZoneEl.classList.remove('drag-over');
    });

    this.dropZoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZoneEl.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        this.processFile(files[0]);
      }
    });

    this.fileInputEl.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        this.processFile(files[0]);
      }
      this.fileInputEl.value = '';
    });
  }

  processFile(file) {
    if (!file.name.endsWith('.json')) {
      alert('Vui lòng chọn file định dạng .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target.result);
        const { normalizedRows, detectedCols, originalStructure } = this.parseAnalyticsJson(raw);

        if (normalizedRows.length === 0) {
          alert('Không tìm thấy danh sách dòng dữ liệu analytics hợp lệ trong file JSON!');
          return;
        }

        // Show preview before importing
        if (this.callbacks.onPreview) {
          this.callbacks.onPreview(
            normalizedRows,
            { fileName: file.name, totalRows: normalizedRows.length, detectedCols, originalStructure },
            (importMode) => {
              if (this.callbacks.onDataImported) {
                this.callbacks.onDataImported(normalizedRows, importMode);
              }
            }
          );
        } else if (this.callbacks.onDataImported) {
          this.callbacks.onDataImported(normalizedRows, 'replace');
        }
      } catch (err) {
        console.error('Lỗi khi đọc file Analytics JSON:', err);
        alert(`Lỗi cú pháp file JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  }

  /**
   * Phân tích và chuẩn hoá JSON đầu vào
   */
  parseAnalyticsJson(rawJson) {
    let rawArray = [];
    let originalStructure = 'array';

    if (Array.isArray(rawJson)) {
      rawArray = rawJson;
      originalStructure = 'flat_array';
    } else if (rawJson && typeof rawJson === 'object') {
      if (Array.isArray(rawJson.rows)) {
        rawArray = rawJson.rows;
        originalStructure = 'object_rows';
      } else if (Array.isArray(rawJson.data)) {
        rawArray = rawJson.data;
        originalStructure = 'object_data';
      } else if (Array.isArray(rawJson.levels)) {
        rawArray = rawJson.levels;
        originalStructure = 'object_levels';
      } else {
        // Thử tìm bất kỳ field nào là array
        for (const k of Object.keys(rawJson)) {
          if (Array.isArray(rawJson[k]) && rawJson[k].length > 0 && typeof rawJson[k][0] === 'object') {
            rawArray = rawJson[k];
            originalStructure = `object_${k}`;
            break;
          }
        }
      }
    }

    const detectedColsSet = new Set();
    const normalizedRows = [];

    rawArray.forEach((item, index) => {
      if (!item || typeof item !== 'object') return;

      // Extract level number or group range
      const rawLevel = item.level_id ?? item.level ?? item.levelNumber ?? item.level_index ?? item.map_id;
      let levelNum = null;
      let levelLabel = null;
      let isGroup = false;
      let minLevel = null;
      let maxLevel = null;

      if (typeof rawLevel === 'number') {
        levelNum = rawLevel;
        levelLabel = `Level ${rawLevel}`;
      } else if (typeof rawLevel === 'string') {
        // Match group formats: "level_group_10_19", "group_10_19", "level_10_19", "10-19", "10_19"
        const groupMatch = rawLevel.match(/(?:level_group_|group_|level_)?(\d+)[-_](\d+)/i);
        if (groupMatch) {
          minLevel = parseInt(groupMatch[1], 10);
          maxLevel = parseInt(groupMatch[2], 10);
          levelNum = minLevel;
          levelLabel = rawLevel;
          isGroup = true;
        } else {
          // Single number inside string: "level_12", "lvl 12", "12"
          const numMatch = rawLevel.match(/(\d+)/);
          if (numMatch) {
            levelNum = parseInt(numMatch[1], 10);
            levelLabel = `Level ${levelNum}`;
          }
        }
      }

      if (levelNum === null || isNaN(levelNum)) {
        levelNum = index + 1;
        levelLabel = `Row ${levelNum}`;
      }

      // Normalize common metric fields
      let attempts = Number(
        item.totalUsersInLevel ?? item.startUsers ?? item.attempts ?? item.starts ?? item.play_count ?? item.users ?? 0
      );
      if (item.startUsers && item.attempts && item.attempts < 10 && item.startUsers > item.attempts) {
        attempts = Number(item.startUsers);
      }

      // Fail rate (0.0 to 1.0)
      let fail_rate = null;
      if (item.churn1RateByLevel !== undefined) fail_rate = Number(item.churn1RateByLevel);
      else if (item.fail_rate !== undefined) fail_rate = Number(item.fail_rate);
      else if (item.loseRate !== undefined) fail_rate = Number(item.loseRate);
      else if (item.loseUserRate !== undefined) fail_rate = Number(item.loseUserRate);
      else if (item.churnRate !== undefined && item.winRate === undefined) fail_rate = Number(item.churnRate);
      else if (item.winRate !== undefined) fail_rate = Number((1 - Number(item.winRate)).toFixed(4));
      
      // Completions & Fails
      let completions = Number(item.completions ?? item.complete_count ?? item.winUsers ?? 0);
      let fail_count = Number(
        item.churn1Users ?? item.fail_count ?? item.lose_count ?? item.churnCounts?.total ?? 0
      );

      if (attempts > 0) {
        if (fail_rate === null && fail_count > 0) {
          fail_rate = Number((fail_count / attempts).toFixed(4));
        } else if (fail_rate === null && completions > 0) {
          fail_rate = Number(((attempts - completions) / attempts).toFixed(4));
        }

        if (completions === 0 && fail_count > 0) {
          completions = Math.max(0, attempts - fail_count);
        } else if (completions === 0 && fail_rate !== null) {
          completions = Math.round(attempts * (1 - Math.min(1, fail_rate)));
        }

        if (fail_count === 0 && completions > 0) {
          fail_count = Math.max(0, attempts - completions);
        }
      }

      if (fail_rate !== null && fail_rate > 1 && fail_rate <= 100) {
        fail_rate = Number((fail_rate / 100).toFixed(4)); // Normalize %
      }

      // Ad rate / Ad shows
      let ad_rate = null;
      if (item.ad_rate !== undefined) ad_rate = Number(item.ad_rate);
      else if (item.adRowCount !== undefined) ad_rate = Number(item.adRowCount);
      else if (item.ad_shows !== undefined) ad_rate = Number(item.ad_shows);
      if (ad_rate !== null && ad_rate > 1 && ad_rate <= 100 && !item.adRowCount) ad_rate = Number((ad_rate / 100).toFixed(4));

      // Win rate
      let win_rate = null;
      if (item.winRate !== undefined) win_rate = Number(item.winRate);
      else if (item.win_rate !== undefined) win_rate = Number(item.win_rate);
      else if (fail_rate !== null) win_rate = Number((1 - fail_rate).toFixed(4));

      // Play duration
      const session_duration_avg = Number(item.session_duration_avg ?? item.avgPlayTimeSeconds ?? item.avg_time ?? 0);
      const revenue = Number(item.revenue ?? item.revenue_per_level ?? item.iapRevenue ?? 0);
      
      // Churn rate (prefer churn7 or churn1 or churnRate)
      let churn_rate = Number(
        item.churn7RateByLevel ?? item.churn14RateByLevel ?? item.churn3RateByLevel ?? item.churn1RateByLevel ?? item.churnRate ?? item.churn_rate ?? 0
      );
      if (churn_rate > 1 && churn_rate <= 100) churn_rate = Number((churn_rate / 100).toFixed(4));

      const normalized = {
        level: levelNum,
        levelLabel: levelLabel || `Level ${levelNum}`,
        isGroup,
        minLevel,
        maxLevel,
        startUsers: Number(item.startUsers ?? attempts),
        attempts: Number(item.attempts ?? attempts),
        loseRate: Number(item.loseRate ?? (fail_rate !== null ? fail_rate : 0)),
        churnRate: Number(item.churnRate ?? (churn_rate !== null ? churn_rate : 0)),
        winRate: Number(item.winRate ?? (win_rate !== null ? win_rate : 0)),
        reachRate: Number(item.reachRate ?? 0),
        avgPlayTimeSeconds: Number(item.avgPlayTimeSeconds ?? session_duration_avg),
        churnRateBreakdown: item.churnRateBreakdown || null,
        churnCounts: item.churnCounts || null,
        // Legacy / normalized aliases
        completions,
        fail_count,
        fail_rate: fail_rate !== null ? fail_rate : 0,
        win_rate: win_rate !== null ? win_rate : 0,
        ad_rate: ad_rate !== null ? ad_rate : 0,
        session_duration_avg,
        revenue,
        churn_rate,
        raw: item,
      };

      // Collect all keys for dynamic table
      Object.keys(item).forEach((k) => {
        if (typeof item[k] !== 'object' || item[k] === null) {
          detectedColsSet.add(k);
        }
      });

      normalizedRows.push(normalized);
    });

    // Sort ascending by level
    normalizedRows.sort((a, b) => a.level - b.level);

    return {
      normalizedRows,
      detectedCols: Array.from(detectedColsSet),
      originalStructure,
    };
  }
}
