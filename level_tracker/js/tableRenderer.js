/**
 * tableRenderer.js
 * Chịu trách nhiệm render bảng danh sách Level, format các cột, tô đỏ hàng lỗi,
 * mini-breakdown charts, badges shooter types, complexity score,
 * toggle ẩn/hiện cột, và xuất dữ liệu CSV / JSON.
 */

import { getColor } from './palette.js';

export const TABLE_COLUMNS = [
  { 
    key: 'action', label: 'Thao tác', defaultVisible: true, sortable: false,
    tooltip: 'Xem Pixel Art (🎨 Xem) hoặc Chơi thử trực tiếp (🎮 Chơi)'
  },
  { 
    key: 'level', label: 'Level', defaultVisible: true, sortable: true,
    tooltip: 'Số thứ tự Level trong game (lấy từ tên file JSON)'
  },
  { 
    key: 'difficulty', label: 'Độ khó', defaultVisible: true, sortable: true,
    tooltip: 'Độ khó của Level từ config CS_LocalLevelConfigData.json (Bình thường, 🔥 Khó, 💀 Siêu Khó)'
  },
  { 
    key: 'id', label: 'ID Level', defaultVisible: true, sortable: true,
    tooltip: 'Unique ID của level trong Unity (field "id" trong JSON)'
  },
  { 
    key: 'complexity_score', label: 'Complexity', defaultVisible: true, sortable: true,
    tooltip: 'Điểm phức tạp tổng hợp = unique_types × (fill% / 10) × (1.5 nếu có mechanic đặc biệt). Càng cao = càng phức tạp.'
  },
  { 
    key: 'girdSizeX', label: 'Grid (X×Y)', defaultVisible: true, sortable: true,
    tooltip: 'Kích thước bounding box thực tế của các block (loại trừ ô trống viền ngoài). X = số cột, Y = số hàng.'
  },
  { 
    key: 'total_cells', label: 'Total Cells', defaultVisible: true, sortable: true,
    tooltip: 'Tổng số ô trong bounding box = Grid X × Grid Y. Dùng để tính Fill %.'
  },
  { 
    key: 'active_blocks', label: 'Active Blocks', defaultVisible: true, sortable: true,
    tooltip: 'Tổng số block cần bắn để win. Đã tính trọng số: BlockBig đếm theo param[0] hits, BlockShooter đếm theo số đạn phóng ra, BlockWall/BlockBomb/BlockKey không được đếm (không cần đạn màu).'
  },
  { 
    key: 'fill_ratio_pct', label: 'Fill %', defaultVisible: true, sortable: true,
    tooltip: 'Tỉ lệ lấp đầy = Active Blocks / Total Cells × 100%. Cho biết bản đồ dày hay thưa.'
  },
  { 
    key: 'unique_types_used', label: 'Types', defaultVisible: true, sortable: true,
    tooltip: 'Số loại màu (type ID 0-35) được dùng trong level. Càng nhiều màu = càng đa dạng và phức tạp.'
  },
  { 
    key: 'blockType_breakdown', label: 'Block Mechanics', defaultVisible: true, sortable: false,
    tooltip: 'Phân phối các loại Block Mechanic: 0=Normal, 1-4=BigBlock (đa hit), 5=KeyBlock, 6=MysteryBlock, 7=ShooterStack, 8=WallBlock, 9=BombBlock. Mini bar chart.'
  },
  { 
    key: 'shooter_types', label: 'Shooter Mechanics', defaultVisible: true, sortable: false,
    tooltip: 'Các loại Xe/Súng đặc biệt trong level: Connected, Hidden, Frozen, Bomb, LongKey, Curtains, Pipe, KeyTruck, Tunnel.'
  },
  { 
    key: 'num_shooters', label: 'Shooters', defaultVisible: true, sortable: true,
    tooltip: 'Số cột shooter (mỗi cột = 1 đoàn xe). Mỗi cột có tối đa 3 xe (slots).'
  },
  { 
    key: 'total_slots', label: 'Total Slots', defaultVisible: true, sortable: true,
    tooltip: 'Tổng số slot xe = num_shooters × 3 (tối đa). Bao gồm cả slot rỗng (shooterType=3).'
  },
  { 
    key: 'active_slots', label: 'Active Slots', defaultVisible: true, sortable: true,
    tooltip: 'Số slot xe thực sự có đạn (shooterType khác 3, shot > 0).'
  },
  { 
    key: 'empty_slots', label: 'Empty Slots', defaultVisible: true, sortable: true,
    tooltip: 'Số slot trống (shooterType=3, không bắn). Thường dùng để padding hoặc chờ mở khóa.'
  },
  { 
    key: 'shots_by_type', label: 'Shots by Type', defaultVisible: true, sortable: false,
    tooltip: 'Phân phối tổng số đạn theo từng màu (type ID). Dùng để kiểm tra Invariant: shots phải bằng đúng active blocks của cùng màu.'
  },
  { 
    key: 'invariant_valid', label: 'Invariant ✓', defaultVisible: true, sortable: true,
    tooltip: 'Kiểm tra tính cân bằng: tổng đạn của mỗi màu từ tất cả súng phải bằng ĐÚNG tổng block cùng màu trên map. ✅ = hợp lệ, ❌ = mất cân bằng (thiếu/thừa đạn).'
  },
  { 
    key: 'invalid_types', label: 'Invalid Types', defaultVisible: true, sortable: false,
    tooltip: 'Các type ID nằm ngoài palette hợp lệ [0-35]. Nếu có → level có thể bị lỗi thiết kế.'
  },
];

export class TableRenderer {
  /**
   * @param {HTMLElement} tableContainer - Container chứa bảng
   * @param {object} callbacks - { onRenderLevel, onOpenDetails, onSort, onPlaytestLevel }
   */
  constructor(tableContainer, callbacks = {}) {
    this.container = tableContainer;
    this.callbacks = callbacks;
    this.currentSortKey = 'level';
    this.currentSortDirection = 'asc';
    this.selectedLevelIndex = null;
    this.hiddenColumns = new Set(this.loadHiddenColumns());
  }

  setSelectedLevelIndex(index) {
    this.selectedLevelIndex = index;
    const rows = this.container.querySelectorAll('tr[data-row-level-index]');
    rows.forEach((r) => {
      const idx = parseInt(r.getAttribute('data-row-level-index'), 10);
      if (idx === index) {
        r.classList.add('row-selected');
      } else {
        r.classList.remove('row-selected');
      }
    });
  }

  loadHiddenColumns() {
    try {
      const raw = localStorage.getItem('pixel_ball_hidden_cols_v1');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  saveHiddenColumns() {
    try {
      localStorage.setItem('pixel_ball_hidden_cols_v1', JSON.stringify(Array.from(this.hiddenColumns)));
    } catch (e) {
      console.error(e);
    }
  }

  toggleColumn(columnKey) {
    if (this.hiddenColumns.has(columnKey)) {
      this.hiddenColumns.delete(columnKey);
    } else {
      this.hiddenColumns.add(columnKey);
    }
    this.saveHiddenColumns();
  }

  /**
   * Format compact string cho object type count: { 0: 10, 1: 5 } -> "0:10, 1:5"
   */
  formatTypeObjectCompact(obj) {
    if (!obj || typeof obj !== 'object') return '-';
    const entries = Object.entries(obj);
    if (entries.length === 0) return '0 types';
    
    const summary = entries
      .slice(0, 3)
      .map(([type, count]) => `${type}:${count}`)
      .join(', ');

    const remaining = entries.length - 3;
    if (remaining > 0) {
      return `${summary} (+${remaining})`;
    }
    return summary;
  }

  /**
   * Render mini inline horizontal bar chart of blockTypes in a cell
   */
  renderBlockTypeBreakdown(level) {
    const counts = level.blockMechanicCounts;
    if (!counts) return '-';

    const colors = {
      0: '#3b82f6', // Normal (Blue)
      1: '#8b5cf6', // Big (Purple)
      3: '#a855f7', // Big3 (Purple light)
      5: '#f59e0b', // Key (Yellow)
      6: '#06b6d4', // Mystery (Cyan)
      7: '#ec4899', // Shooter (Pink)
      8: '#64748b', // Wall (Slate)
      9: '#ef4444', // Bomb (Red)
    };

    const names = {
      0: 'Normal', 1: 'Big', 3: 'Big3', 5: 'Key', 6: 'Mystery', 7: 'Shooter', 8: 'Wall', 9: 'Bomb'
    };

    let total = 0;
    const items = [];
    Object.keys(counts).forEach((k) => {
      const c = counts[k].count;
      if (c > 0) {
        total += c;
        items.push({ type: k, count: c, name: names[k] || `Type ${k}`, color: colors[k] || '#94a3b8' });
      }
    });

    if (items.length === 0 || total === 0) return '<span class="text-muted">0</span>';

    const bars = items.map((item) => {
      const pct = ((item.count / total) * 100).toFixed(0);
      return `<div class="mini-bar-seg" style="width: ${pct}%; background-color: ${item.color};" title="${item.name}: ${item.count} (${pct}%)"></div>`;
    }).join('');

    const badges = items.map((item) => {
      return `<span class="mini-type-badge" style="border-left-color: ${item.color}">${item.name[0]}:${item.count}</span>`;
    }).join(' ');

    return `
      <div class="mini-bar-cell">
        <div class="mini-bar-track">${bars}</div>
        <div class="mini-bar-labels">${badges}</div>
      </div>
    `;
  }

  /**
   * Render shooter types badges
   */
  renderShooterBadges(level) {
    const counts = level.shooterMechanicCounts;
    if (!counts) return '-';

    const badges = [];
    if (counts[0]?.count > 0) badges.push(`<span class="badge-shooter normal" title="Normal: ${counts[0].count}">🚗 ${counts[0].count}</span>`);
    if (counts[4]?.count > 0) badges.push(`<span class="badge-shooter pipe" title="Pipe: ${counts[4].count}">🧪 ${counts[4].count}</span>`);
    if (counts[6]?.count > 0) badges.push(`<span class="badge-shooter tunnel" title="Tunnel: ${counts[6].count}">🚇 ${counts[6].count}</span>`);
    if (counts[7]?.count > 0) badges.push(`<span class="badge-shooter special" title="Special: ${counts[7].count}">⭐ ${counts[7].count}</span>`);
    if (counts[1]?.count > 0) badges.push(`<span class="badge-shooter key" title="Key: ${counts[1].count}">🗝️ ${counts[1].count}</span>`);
    if (counts[5]?.count > 0) badges.push(`<span class="badge-shooter mystery" title="Mystery: ${counts[5].count}">❔ ${counts[5].count}</span>`);

    return badges.length > 0 ? badges.join(' ') : '<span class="text-muted">-</span>';
  }

  /**
   * Render toàn bộ bảng dữ liệu
   */
  renderTable(levels, sortKey = this.currentSortKey, sortDirection = this.currentSortDirection) {
    this.currentSortKey = sortKey;
    this.currentSortDirection = sortDirection;

    if (!levels || levels.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <h3>Chưa có dữ liệu Level nào</h3>
          <p>Hãy kéo thả hoặc chọn file JSON level ở khung bên trên, hoặc nạp file mẫu.</p>
        </div>
      `;
      return;
    }

    const sortIcon = (colKey) => {
      if (this.currentSortKey !== colKey) return '<span class="sort-icon inactive">⇅</span>';
      return `<span class="sort-icon active">${this.currentSortDirection === 'asc' ? '▲' : '▼'}</span>`;
    };

    const isVis = (key) => !this.hiddenColumns.has(key);

    let html = `
      <!-- Toolbar with Column Visibility Toggle & Export -->
      <div class="table-actions-toolbar">
        <div class="toolbar-left">
          <span class="toolbar-counter">Hiển thị <strong>${levels.length}</strong> levels</span>
        </div>
        <div class="toolbar-right">
          <!-- Column Visibility Dropdown -->
          <div class="col-toggle-dropdown">
            <button id="btnColToggle" class="btn btn-sm btn-secondary">
              👁️ Cột hiển thị (${TABLE_COLUMNS.length - this.hiddenColumns.size}/${TABLE_COLUMNS.length})
            </button>
            <div id="colToggleMenu" class="col-toggle-menu" style="display: none;">
              ${TABLE_COLUMNS.map((col) => `
                <label class="col-checkbox-label">
                  <input type="checkbox" data-col-key="${col.key}" ${isVis(col.key) ? 'checked' : ''}>
                  <span>${col.label}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Export Buttons -->
          <button id="btnExportCsv" class="btn btn-sm btn-secondary" title="Xuất CSV cho danh sách hiện tại">
            📥 Xuất CSV
          </button>
          <button id="btnExportJson" class="btn btn-sm btn-secondary" title="Xuất JSON cho danh sách hiện tại">
            📦 Xuất JSON
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="level-table">
          <thead>
            <tr>
              ${TABLE_COLUMNS.map((col) => {
                if (!isVis(col.key)) return '';
                const sortClass = col.sortable ? `sortable col-${col.key}` : `col-${col.key}`;
                const sortAttr = col.sortable ? `data-sort="${col.key}"` : '';
                const sortSpan = col.sortable ? ` ${sortIcon(col.key)}` : '';
                const titleAttr = col.tooltip ? `title="${this.escapeHtml(col.tooltip)}"` : '';
                const infoIcon = col.tooltip ? `<span class="col-info-icon" title="${this.escapeHtml(col.tooltip)}">ℹ</span>` : '';
                return `<th class="${sortClass}" ${sortAttr} ${titleAttr}>${col.label}${sortSpan}${infoIcon}</th>`;
              }).join('\n              ')}
            </tr>
          </thead>
          <tbody>
    `;

    levels.forEach((level, index) => {
      if (level.isError) {
        const totalVisCols = TABLE_COLUMNS.filter((c) => isVis(c.key)).length;
        html += `
          <tr class="row-error-file">
            <td colspan="${totalVisCols}">
              <div class="error-file-badge">
                <span class="error-badge-tag">LỖI FILE</span>
                <strong>${this.escapeHtml(level.fileName)}:</strong> ${this.escapeHtml(level.errorMessage)}
              </div>
            </td>
          </tr>
        `;
        return;
      }

      const hasInvalidTypes = Array.isArray(level.invalid_types_found) && level.invalid_types_found.length > 0;
      const isInvariantError = !level.invariant_valid;
      const isProblematic = isInvariantError || hasInvalidTypes;

      const rowClass = [
        isProblematic ? 'row-alert-error' : (index % 2 === 1 ? 'row-even' : ''),
        this.selectedLevelIndex === index ? 'row-selected' : '',
      ].filter(Boolean).join(' ');

      const compactShots = this.formatTypeObjectCompact(level.total_shots_by_type);

      html += `
        <tr class="${rowClass}" data-row-level-index="${index}">
          ${isVis('action') ? `
            <td class="col-action">
              <div class="action-btn-group">
                <button class="btn-action-intent" data-action="intent" data-index="${index}" title="Xem Ý Đồ & Bãi đỗ xe">
                  <span class="icon">🎯</span> Ý đồ
                </button>
                <button class="btn-action-view" data-action="view-art" data-index="${index}" title="Xem hình ảnh Pixel Art">
                  <span class="icon">🎨</span> Xem
                </button>
                <button class="btn-action-play" data-action="playtest" data-index="${index}" title="Chơi thử Playtest Simulator">
                  <span class="icon">🎮</span> Chơi
                </button>
              </div>
            </td>
          ` : ''}

          ${isVis('level') ? `
            <td class="col-level font-mono">
              <strong>${level.level}</strong>
              ${level.difficulty === 'hard' ? '<span class="badge-difficulty hard inline-badge" title="Level Khó">🔥 Khó</span>' : ''}
              ${level.difficulty === 'super_hard' ? '<span class="badge-difficulty super-hard inline-badge" title="Level Siêu Khó">💀 Siêu Khó</span>' : ''}
              ${level.hasLevelWarning ? '<span class="warn-badge" title="Tên file không chứa số rõ ràng">⚠️</span>' : ''}
            </td>
          ` : ''}

          ${isVis('difficulty') ? `
            <td class="col-difficulty text-center font-mono">
              <span class="badge-difficulty ${level.difficultyMeta?.cssClass || 'normal'}">
                ${level.difficultyMeta?.badgeText || 'Bình thường'}
              </span>
            </td>
          ` : ''}

          ${isVis('id') ? `
            <td class="col-id font-mono" title="${this.escapeHtml(level.id)}">
              <span class="id-truncate">${this.escapeHtml(level.id || '-')}</span>
            </td>
          ` : ''}

          ${isVis('complexity_score') ? `
            <td class="font-mono text-center">
              <span class="badge-complexity ${level.complexity_score > 30 ? 'high' : (level.complexity_score > 15 ? 'mid' : 'low')}">
                ${level.complexity_score ?? '-'}
              </span>
            </td>
          ` : ''}

          ${isVis('girdSizeX') ? `<td class="font-mono">${level.girdSizeX} × ${level.girdSizeY}</td>` : ''}
          ${isVis('total_cells') ? `<td class="font-mono">${level.total_cells}</td>` : ''}
          ${isVis('active_blocks') ? `<td class="font-mono">${level.active_blocks}</td>` : ''}

          ${isVis('fill_ratio_pct') ? `
            <td>
              <div class="fill-bar-container" title="${level.fill_ratio_pct}%">
                <div class="fill-bar-progress" style="width: ${Math.min(level.fill_ratio_pct, 100)}%;"></div>
                <span class="fill-bar-text">${level.fill_ratio_pct}%</span>
              </div>
            </td>
          ` : ''}

          ${isVis('unique_types_used') ? `
            <td class="font-mono text-center">
              <span class="badge-type-count">${level.unique_types_used}</span>
            </td>
          ` : ''}

          ${isVis('blockType_breakdown') ? `
            <td>${this.renderBlockTypeBreakdown(level)}</td>
          ` : ''}

          ${isVis('shooter_types') ? `
            <td>${this.renderShooterBadges(level)}</td>
          ` : ''}

          ${isVis('num_shooters') ? `<td class="font-mono text-center">${level.num_shooters}</td>` : ''}
          ${isVis('total_slots') ? `<td class="font-mono text-center">${level.total_slots}</td>` : ''}
          ${isVis('active_slots') ? `<td class="font-mono text-center text-success">${level.active_slots}</td>` : ''}
          ${isVis('empty_slots') ? `<td class="font-mono text-center text-muted">${level.empty_slots}</td>` : ''}

          ${isVis('shots_by_type') ? `
            <td>
              <div class="cell-expandable" data-action="inspect-types" data-index="${index}" title="Bấm để xem chi tiết danh sách Shots">
                <span class="compact-text">${compactShots}</span>
                <span class="badge-inspect">🔍</span>
              </div>
            </td>
          ` : ''}

          ${isVis('invariant_valid') ? `
            <td class="text-center">
              ${
                level.invariant_valid
                  ? '<span class="badge-status badge-valid" title="Tổng số shots khớp 100% với blocks">✓ Khớp</span>'
                  : `<span class="badge-status badge-invalid" data-action="inspect-types" data-index="${index}" title="Lệch số lượng shots so với blocks! Bấm để xem">✗ Lệch (${level.invariantMismatches.length})</span>`
              }
            </td>
          ` : ''}

          ${isVis('invalid_types') ? `
            <td class="text-center">
              ${
                hasInvalidTypes
                  ? `<span class="badge-status badge-invalid" title="Chứa type không hợp lệ: ${level.invalid_types_found.join(', ')}">⚠️ ID ${level.invalid_types_found.join(', ')}</span>`
                  : '<span class="badge-clean">OK</span>'
              }
            </td>
          ` : ''}
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEvents(levels);
  }

  attachEvents(levels) {
    // 1. Sort headers
    const sortHeaders = this.container.querySelectorAll('th.sortable');
    sortHeaders.forEach((th) => {
      th.addEventListener('click', () => {
        const sortKey = th.getAttribute('data-sort');
        let direction = 'asc';
        if (this.currentSortKey === sortKey && this.currentSortDirection === 'asc') {
          direction = 'desc';
        }
        if (this.callbacks.onSort) {
          this.callbacks.onSort(sortKey, direction);
        }
      });
    });

    // 2. Action buttons (Intent, View Art, Playtest)
    const intentButtons = this.container.querySelectorAll('[data-action="intent"]');
    intentButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        this.selectedLevelIndex = index;
        if (this.callbacks.onSelectLevel && levels[index]) {
          this.callbacks.onSelectLevel(levels[index], index, levels);
        }
      });
    });

    const viewButtons = this.container.querySelectorAll('[data-action="view-art"]');
    viewButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        if (this.callbacks.onRenderLevel && levels[index]) {
          this.callbacks.onRenderLevel(levels[index], index, levels);
        }
      });
    });

    const playButtons = this.container.querySelectorAll('[data-action="playtest"]');
    playButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        if (this.callbacks.onPlaytestLevel && levels[index]) {
          this.callbacks.onPlaytestLevel(levels[index]);
        }
      });
    });

    // 2b. Row-level clicks (Select & open side panel)
    const tableRows = this.container.querySelectorAll('tr[data-row-level-index]');
    tableRows.forEach((row) => {
      row.addEventListener('click', (e) => {
        const index = parseInt(row.getAttribute('data-row-level-index'), 10);
        this.selectedLevelIndex = index;
        tableRows.forEach((r) => r.classList.remove('row-selected'));
        row.classList.add('row-selected');
        if (this.callbacks.onSelectLevel && levels[index]) {
          this.callbacks.onSelectLevel(levels[index], index, levels);
        }
      });
    });

    // 3. Inspect details (Blocks vs Shots diff)
    const inspectElements = this.container.querySelectorAll('[data-action="inspect-types"]');
    inspectElements.forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(el.getAttribute('data-index'), 10);
        if (this.callbacks.onOpenDetails && levels[index]) {
          this.callbacks.onOpenDetails(levels[index]);
        }
      });
    });

    // 4. Column Visibility Dropdown Toggle
    const btnColToggle = this.container.querySelector('#btnColToggle');
    const colToggleMenu = this.container.querySelector('#colToggleMenu');
    if (btnColToggle && colToggleMenu) {
      btnColToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        colToggleMenu.style.display = colToggleMenu.style.display === 'none' ? 'block' : 'none';
      });

      document.addEventListener('click', () => {
        colToggleMenu.style.display = 'none';
      });

      colToggleMenu.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      const colCheckboxes = colToggleMenu.querySelectorAll('input[type="checkbox"]');
      colCheckboxes.forEach((chk) => {
        chk.addEventListener('change', () => {
          const colKey = chk.getAttribute('data-col-key');
          this.toggleColumn(colKey);
          this.renderTable(levels);
        });
      });
    }

    // 5. Export buttons
    const btnCsv = this.container.querySelector('#btnExportCsv');
    if (btnCsv) {
      btnCsv.addEventListener('click', () => this.exportCSV(levels));
    }

    const btnJson = this.container.querySelector('#btnExportJson');
    if (btnJson) {
      btnJson.addEventListener('click', () => this.exportJSON(levels));
    }
  }

  exportCSV(levels) {
    if (!levels || levels.length === 0) return;
    const headers = ['Level', 'ID', 'Complexity', 'GridX', 'GridY', 'TotalCells', 'ActiveBlocks', 'FillRatioPct', 'UniqueTypes', 'Shooters', 'TotalSlots', 'ActiveSlots', 'EmptySlots', 'InvariantValid'];
    const rows = levels.filter((l) => !l.isError).map((l) => [
      l.level,
      `"${(l.id || '').replace(/"/g, '""')}"`,
      l.complexity_score,
      l.girdSizeX,
      l.girdSizeY,
      l.total_cells,
      l.active_blocks,
      l.fill_ratio_pct,
      l.unique_types_used,
      l.num_shooters,
      l.total_slots,
      l.active_slots,
      l.empty_slots,
      l.invariant_valid ? 1 : 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel_ball_levels_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportJSON(levels) {
    if (!levels || levels.length === 0) return;
    const cleanLevels = levels.filter((l) => !l.isError).map((l) => ({
      level: l.level,
      id: l.id,
      complexity_score: l.complexity_score,
      girdSizeX: l.girdSizeX,
      girdSizeY: l.girdSizeY,
      total_cells: l.total_cells,
      active_blocks: l.active_blocks,
      fill_ratio_pct: l.fill_ratio_pct,
      unique_types_used: l.unique_types_used,
      num_shooters: l.num_shooters,
      total_slots: l.total_slots,
      active_slots: l.active_slots,
      empty_slots: l.empty_slots,
      invariant_valid: l.invariant_valid,
      blocks_by_type: l.blocks_by_type,
      total_shots_by_type: l.total_shots_by_type,
    }));

    const blob = new Blob([JSON.stringify(cleanLevels, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel_ball_levels_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
