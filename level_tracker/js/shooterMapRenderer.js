/**
 * shooterMapRenderer.js
 * Visualizer & Direct In-Place Editor for Shooter Map (Bãi đỗ xe / Khay xe):
 * - Hiển thị các cột xe theo layout bãi đỗ thực tế trong Unity.
 * - Hiển thị màu chuẩn theo palette.js, số shot, và các badge mechanic (❄️, 🔗, 🎭, 💣, 🧪, 🚇, ❔).
 * - Visualize hiệu ứng lan truyền rèm (Curtains Silent Propagation) sang 3 ô kề (i, j+1), (i+1, j), (i+1, j+1).
 * - Đường nối / chỉ báo cặp Linked hai chiều.
 * - Cho phép chỉnh sửa trực tiếp từng slot (Color, Shot, Mechanic, Reorder, Add, Delete) không cần hover.
 */

import { getColor, isValidPaletteType } from './palette.js';

export class ShooterMapRenderer {
  /**
   * @param {HTMLElement} container - DOM element chứa shooter map
   * @param {object} callbacks - { onShooterDataChanged: (updatedShooters) => void }
   */
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.shooters = [];
    this.selectedSlot = null; // { col, row }
    this.activeCurtainsHover = null; // { col, row }
  }

  /**
   * Nạp và render dữ liệu shooters
   * @param {Array} shooters - Mảng shooters từ level JSON
   */
  render(shooters) {
    this.shooters = JSON.parse(JSON.stringify(shooters || []));
    if (!this.container) return;

    if (this.shooters.length === 0) {
      this.container.innerHTML = `
        <div class="smap-empty">
          <span class="empty-icon">🚚</span>
          <p>Chưa có dữ liệu Shooter Map cho level này</p>
        </div>
      `;
      return;
    }

    // Build Linked pair dictionary to assign matching pair colors
    const linkedPairsMap = new Map();
    let pairCounter = 1;

    for (let c = 0; c < this.shooters.length; c++) {
      const col = this.shooters[c]?.list || [];
      for (let r = 0; r < col.length; r++) {
        const slot = col[r];
        if (!slot || !slot.mechanics) continue;
        const linkedMech = slot.mechanics.find((m) => m.type === 2);
        if (linkedMech && Array.isArray(linkedMech.param) && linkedMech.param.length >= 2) {
          const tc = linkedMech.param[0];
          const tr = linkedMech.param[1];
          const key1 = `${c},${r}`;
          const key2 = `${tc},${tr}`;
          if (!linkedPairsMap.has(key1) && !linkedPairsMap.has(key2)) {
            const pairId = pairCounter++;
            linkedPairsMap.set(key1, pairId);
            linkedPairsMap.set(key2, pairId);
          }
        }
      }
    }

    // Calculate Curtains affected cells if hovering/focusing a Curtains slot
    const curtainsAffected = new Set();
    if (this.activeCurtainsHover) {
      const { col, row } = this.activeCurtainsHover;
      // 3 ô kề: (col, row+1), (col+1, row), (col+1, row+1)
      curtainsAffected.add(`${col},${row + 1}`);
      curtainsAffected.add(`${col + 1},${row}`);
      curtainsAffected.add(`${col + 1},${row + 1}`);
    }

    let html = `
      <div class="smap-wrapper">
        <div class="smap-toolbar">
          <span class="smap-title">🚚 Bãi Đậu Xe (${this.shooters.length} Cột)</span>
          <div class="smap-legend">
            <span class="legend-item"><span class="badge-icon">❄️</span> Băng</span>
            <span class="legend-item"><span class="badge-icon">🔗</span> Ghép</span>
            <span class="legend-item"><span class="badge-icon">🎭</span> Rèm</span>
            <span class="legend-item"><span class="badge-icon">💣</span> Bom</span>
            <span class="legend-item"><span class="badge-icon">🧪</span> Ống</span>
            <span class="legend-item"><span class="badge-icon">🚇</span> Hầm</span>
            <span class="legend-item"><span class="badge-icon">❔</span> Ẩn</span>
          </div>
        </div>

        <div class="smap-grid" style="grid-template-columns: repeat(${this.shooters.length}, minmax(78px, 1fr));">
    `;

    for (let c = 0; c < this.shooters.length; c++) {
      const colList = this.shooters[c]?.list || [];
      html += `
        <div class="smap-col" data-col="${c}">
          <div class="smap-col-header">
            <span>Cột ${c + 1}</span>
            <button class="btn-smap-add-slot" data-action="add-slot" data-col="${c}" title="Thêm xe vào cột này">➕</button>
          </div>
          <div class="smap-slots-stack">
      `;

      if (colList.length === 0) {
        html += `<div class="smap-col-empty">Trống</div>`;
      } else {
        for (let r = 0; r < colList.length; r++) {
          const slot = colList[r];
          const isSelected = this.selectedSlot && this.selectedSlot.col === c && this.selectedSlot.row === r;
          const key = `${c},${r}`;
          const isCurtainsTarget = curtainsAffected.has(key);

          html += this.renderSlotCard(slot, c, r, isSelected, linkedPairsMap.get(key), isCurtainsTarget);
        }
      }

      html += `
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    // Nếu đang chọn 1 slot, hiển thị form chỉnh sửa trực tiếp bên dưới
    if (this.selectedSlot) {
      html += this.renderDirectSlotEditor(this.selectedSlot.col, this.selectedSlot.row);
    }

    this.container.innerHTML = html;
    this.bindEvents();
  }

  /**
   * Render card của 1 xe
   */
  renderSlotCard(slot, col, row, isSelected, linkedPairId, isCurtainsTarget) {
    if (!slot) return '';

    const sType = slot.shooterType || 0;
    const shot = slot.shot || 0;
    const type = slot.type;
    const mechs = slot.mechanics || [];
    const param = slot.param || [];

    // Color background
    const hexColor = (type >= 0 && isValidPaletteType(type)) ? getColor(type) : '#475569';
    const isSpecialType = sType !== 0;

    // Badges
    const badges = [];
    let isCurtainsSource = false;

    for (const m of mechs) {
      if (!m) continue;
      if (m.type === 1) badges.push('<span class="slot-badge mystery" title="Mystery (Ẩn danh)">❔</span>');
      if (m.type === 2) {
        badges.push(`<span class="slot-badge linked" title="Linked Pair #${linkedPairId || ''}">🔗#${linkedPairId || ''}</span>`);
      }
      if (m.type === 3) {
        const h = m.param?.[0] || 3;
        badges.push(`<span class="slot-badge frozen" title="Frozen (Đóng băng ${h} xe)">❄️${h}</span>`);
      }
      if (m.type === 4) {
        isCurtainsSource = true;
        const d = m.param?.[0] || 4;
        badges.push(`<span class="slot-badge curtains" title="Curtains (Rèm che ${d} xe + lan 3 ô kề)">🎭${d}</span>`);
      }
    }

    // Special Shooter Type Labels
    let typeLabel = '';
    let specialSubInfo = '';

    if (sType === 7) {
      typeLabel = '💣 BOM';
      specialSubInfo = `<div class="sub-info text-danger">Nổ sau: <strong>${shot}</strong> nước</div>`;
    } else if (sType === 4) {
      const subCount = Math.floor(param.length / 3);
      typeLabel = '🧪 ỐNG NHẢ';
      specialSubInfo = `<div class="sub-info">Chứa: <strong>${subCount}</strong> xe</div>`;
    } else if (sType === 6) {
      const subCount = Math.floor(param.length / 3);
      typeLabel = '🚇 HẦM TRÀN';
      specialSubInfo = `<div class="sub-info">Chứa: <strong>${subCount}</strong> xe</div>`;
    } else if (sType === 3) {
      typeLabel = '🧱 CHẶN';
      specialSubInfo = `<div class="sub-info text-muted">Vật cản</div>`;
    }

    const cardClasses = [
      'smap-slot-card',
      'truck-card',
      isSelected ? 'selected' : '',
      isCurtainsSource ? 'has-curtains' : '',
      isCurtainsTarget ? 'curtains-shadow-target' : '',
      isSpecialType ? 'special-shooter' : '',
    ].filter(Boolean).join(' ');

    return `
      <div class="${cardClasses}" 
           data-col="${col}" 
           data-row="${row}" 
           data-curtains="${isCurtainsSource ? '1' : '0'}"
           style="--truck-color: ${hexColor};"
           title="Click để chỉnh sửa xe tại [Cột ${col + 1}, Hàng ${row + 1}]">
        
        <!-- Authentic Game Truck Shape -->
        <div class="truck-shape">
          <div class="truck-cab">
            <div class="truck-headlight-l"></div>
            <div class="truck-windshield"></div>
            <div class="truck-headlight-r"></div>
          </div>
          <div class="truck-body" style="background-color: ${hexColor};">
            <div class="truck-roof-badge">
              <span class="truck-shots-text font-mono">${isSpecialType ? (sType === 7 ? `💣${shot}` : (sType === 4 ? `🧪${Math.floor(param.length/3)}` : (sType === 6 ? `🚇${Math.floor(param.length/3)}` : '🧱'))) : shot}</span>
            </div>
          </div>
          <div class="truck-wheel wheel-fl"></div>
          <div class="truck-wheel wheel-fr"></div>
          <div class="truck-wheel wheel-bl"></div>
          <div class="truck-wheel wheel-br"></div>
        </div>

        <div class="slot-main-info">
          <div class="slot-row-tag">Hàng ${row + 1}</div>
          ${isSpecialType ? `
            <div class="slot-special-type">${typeLabel}</div>
            ${specialSubInfo}
          ` : `
            <div class="slot-type-info">
              <span class="color-dot" style="background-color: ${hexColor};"></span>
              <span class="type-num">Màu ${type}</span>
            </div>
          `}
          ${badges.length > 0 ? `<div class="slot-badges-list">${badges.join('')}</div>` : ''}
          ${isCurtainsTarget ? `<div class="curtains-shadow-badge" title="Ô này bị ảnh hưởng bởi lan truyền rèm che">🌫️ Bị che</div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Panel chỉnh sửa trực tiếp slot xe được chọn (Inline Editor)
   */
  renderDirectSlotEditor(col, row) {
    const slot = this.shooters[col]?.list?.[row];
    if (!slot) return '';

    const sType = slot.shooterType || 0;
    const shot = slot.shot || 0;
    const type = slot.type;
    const mechs = slot.mechanics || [];

    const hasMystery = mechs.some(m => m.type === 1);
    const linkedMech = mechs.find(m => m.type === 2);
    const frozenMech = mechs.find(m => m.type === 3);
    const curtainsMech = mechs.find(m => m.type === 4);

    return `
      <div class="smap-direct-editor">
        <div class="editor-header">
          <span class="editor-title">✏️ Chỉnh sửa Slot [Cột ${col + 1}, Hàng ${row + 1}]</span>
          <div class="editor-actions">
            <button class="btn-smap-tool" data-action="move-up" data-col="${col}" data-row="${row}" ${row === 0 ? 'disabled' : ''} title="Đẩy lên trước">▲ Lên</button>
            <button class="btn-smap-tool" data-action="move-down" data-col="${col}" data-row="${row}" ${row >= (this.shooters[col].list.length - 1) ? 'disabled' : ''} title="Đẩy xuống sau">▼ Xuống</button>
            <button class="btn-smap-tool btn-danger-text" data-action="delete-slot" data-col="${col}" data-row="${row}" title="Xóa slot này">🗑️ Xóa</button>
            <button class="btn-smap-close" data-action="close-editor">✖ Đóng</button>
          </div>
        </div>

        <div class="editor-form-grid">
          <!-- 1. Loại xe -->
          <div class="form-group">
            <label>Loại Súng / Xe:</label>
            <select id="editShooterType" class="form-control-sm">
              <option value="0" ${sType === 0 ? 'selected' : ''}>🚗 Xe Thường (Shooter 0)</option>
              <option value="7" ${sType === 7 ? 'selected' : ''}>💣 Bom Đếm Ngược (Bomb 7)</option>
              <option value="4" ${sType === 4 ? 'selected' : ''}>🧪 Ống Nhả (Pipe 4)</option>
              <option value="6" ${sType === 6 ? 'selected' : ''}>🚇 Hầm Tràn (Tunnel 6)</option>
              <option value="3" ${sType === 3 ? 'selected' : ''}>🧱 Tường Chặn (Wall 3)</option>
            </select>
          </div>

          <!-- 2. Màu xe (Palette Type) -->
          <div class="form-group" id="groupEditType" style="${sType !== 0 ? 'display:none;' : ''}">
            <label>Màu xe (Type ID 0-35):</label>
            <input type="number" id="editTypeVal" class="form-control-sm" min="0" max="35" value="${type}">
          </div>

          <!-- 3. Số đạn / Số bước đếm -->
          <div class="form-group">
            <label>${sType === 7 ? 'Số bước nổ (Fuse):' : 'Số đạn (Shots):'}</label>
            <input type="number" id="editShotVal" class="form-control-sm" min="0" max="500" value="${shot}">
          </div>
        </div>

        <!-- 4. Mechanics đính kèm -->
        <div class="editor-mechanics-section" style="${sType !== 0 ? 'display:none;' : ''}">
          <div class="section-title">⚙️ Cơ Chế Đính Kèm (Mechanics):</div>
          <div class="mechanic-toggles-row">
            <!-- Mystery -->
            <label class="mech-toggle-chip ${hasMystery ? 'active' : ''}">
              <input type="checkbox" id="toggleMystery" ${hasMystery ? 'checked' : ''}>
              <span>🔮 Ẩn danh (Unknown)</span>
            </label>

            <!-- Frozen -->
            <label class="mech-toggle-chip ${frozenMech ? 'active' : ''}">
              <input type="checkbox" id="toggleFrozen" ${frozenMech ? 'checked' : ''}>
              <span>❄️ Đóng băng (Ice)</span>
            </label>
            <input type="number" id="valFrozenHardness" class="form-control-xs" min="1" max="10" 
                   value="${frozenMech ? (frozenMech.param?.[0] || 3) : 3}" 
                   style="${frozenMech ? '' : 'display:none;'}" title="Số xe cần giải phóng để tan băng">

            <!-- Curtains -->
            <label class="mech-toggle-chip ${curtainsMech ? 'active' : ''}">
              <input type="checkbox" id="toggleCurtains" ${curtainsMech ? 'checked' : ''}>
              <span>🎭 Rèm che (Curtains)</span>
            </label>
            <input type="number" id="valCurtainsDelay" class="form-control-xs" min="1" max="10" 
                   value="${curtainsMech ? (curtainsMech.param?.[0] || 4) : 4}" 
                   style="${curtainsMech ? '' : 'display:none;'}" title="Số xe cần giải phóng để mở rèm">
          </div>
        </div>

        <div class="editor-footer">
          <button id="btnSaveSlotEdit" class="btn btn-sm btn-primary">💾 Lưu Thay Đổi Slot</button>
        </div>
      </div>
    `;
  }

  /**
   * Gắn các event tương tác
   */
  bindEvents() {
    // 1. Click slot card để mở/chuyển direct editor
    this.container.querySelectorAll('.smap-slot-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const col = Number(card.getAttribute('data-col'));
        const row = Number(card.getAttribute('data-row'));

        if (this.selectedSlot && this.selectedSlot.col === col && this.selectedSlot.row === row) {
          this.selectedSlot = null; // Toggle off
        } else {
          this.selectedSlot = { col, row };
        }
        this.render(this.shooters);
      });

      // 2. Hover effect cho Curtains: Highlight 3 ô kề lan truyền
      card.addEventListener('mouseenter', () => {
        const isCurtains = card.getAttribute('data-curtains') === '1';
        if (isCurtains) {
          const col = Number(card.getAttribute('data-col'));
          const row = Number(card.getAttribute('data-row'));
          this.activeCurtainsHover = { col, row };
          this.highlightCurtainsShadow(col, row, true);
        }
      });

      card.addEventListener('mouseleave', () => {
        if (this.activeCurtainsHover) {
          this.highlightCurtainsShadow(this.activeCurtainsHover.col, this.activeCurtainsHover.row, false);
          this.activeCurtainsHover = null;
        }
      });
    });

    // 3. Nút thêm slot vào cột
    this.container.querySelectorAll('[data-action="add-slot"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const col = Number(btn.getAttribute('data-col'));
        if (this.shooters[col]) {
          this.shooters[col].list.push({
            type: 0,
            shot: 30,
            shooterType: 0,
            param: [],
            mechanics: [],
          });
          this.selectedSlot = { col, row: this.shooters[col].list.length - 1 };
          this.notifyChange();
          this.render(this.shooters);
        }
      });
    });

    // 4. Action buttons trong Direct Editor
    const closeBtn = this.container.querySelector('[data-action="close-editor"]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.selectedSlot = null;
        this.render(this.shooters);
      });
    }

    const moveUpBtn = this.container.querySelector('[data-action="move-up"]');
    if (moveUpBtn) {
      moveUpBtn.addEventListener('click', () => {
        const col = Number(moveUpBtn.getAttribute('data-col'));
        const row = Number(moveUpBtn.getAttribute('data-row'));
        if (row > 0 && this.shooters[col]?.list) {
          const list = this.shooters[col].list;
          const temp = list[row];
          list[row] = list[row - 1];
          list[row - 1] = temp;
          this.selectedSlot = { col, row: row - 1 };
          this.notifyChange();
          this.render(this.shooters);
        }
      });
    }

    const moveDownBtn = this.container.querySelector('[data-action="move-down"]');
    if (moveDownBtn) {
      moveDownBtn.addEventListener('click', () => {
        const col = Number(moveDownBtn.getAttribute('data-col'));
        const row = Number(moveDownBtn.getAttribute('data-row'));
        if (this.shooters[col]?.list && row < this.shooters[col].list.length - 1) {
          const list = this.shooters[col].list;
          const temp = list[row];
          list[row] = list[row + 1];
          list[row + 1] = temp;
          this.selectedSlot = { col, row: row + 1 };
          this.notifyChange();
          this.render(this.shooters);
        }
      });
    }

    const deleteSlotBtn = this.container.querySelector('[data-action="delete-slot"]');
    if (deleteSlotBtn) {
      deleteSlotBtn.addEventListener('click', () => {
        const col = Number(deleteSlotBtn.getAttribute('data-col'));
        const row = Number(deleteSlotBtn.getAttribute('data-row'));
        if (this.shooters[col]?.list) {
          this.shooters[col].list.splice(row, 1);
          this.selectedSlot = null;
          this.notifyChange();
          this.render(this.shooters);
        }
      });
    }

    // Toggle inputs visibility based on checkboxes
    const toggleFrozen = this.container.querySelector('#toggleFrozen');
    const valFrozenHardness = this.container.querySelector('#valFrozenHardness');
    if (toggleFrozen && valFrozenHardness) {
      toggleFrozen.addEventListener('change', () => {
        valFrozenHardness.style.display = toggleFrozen.checked ? 'inline-block' : 'none';
      });
    }

    const toggleCurtains = this.container.querySelector('#toggleCurtains');
    const valCurtainsDelay = this.container.querySelector('#valCurtainsDelay');
    if (toggleCurtains && valCurtainsDelay) {
      toggleCurtains.addEventListener('change', () => {
        valCurtainsDelay.style.display = toggleCurtains.checked ? 'inline-block' : 'none';
      });
    }

    const editShooterType = this.container.querySelector('#editShooterType');
    const groupEditType = this.container.querySelector('#groupEditType');
    if (editShooterType && groupEditType) {
      editShooterType.addEventListener('change', () => {
        const isNormal = editShooterType.value === '0';
        groupEditType.style.display = isNormal ? 'block' : 'none';
      });
    }

    // Nút Lưu thay đổi slot
    const btnSaveSlot = this.container.querySelector('#btnSaveSlotEdit');
    if (btnSaveSlot && this.selectedSlot) {
      btnSaveSlot.addEventListener('click', () => {
        const { col, row } = this.selectedSlot;
        const slot = this.shooters[col]?.list?.[row];
        if (!slot) return;

        const sType = Number(this.container.querySelector('#editShooterType')?.value || 0);
        const shot = Number(this.container.querySelector('#editShotVal')?.value || 0);
        const type = Number(this.container.querySelector('#editTypeVal')?.value || 0);

        slot.shooterType = sType;
        slot.shot = shot;
        slot.type = sType === 0 ? type : 0;

        // Cập nhật mechanics
        const newMechs = [];
        if (this.container.querySelector('#toggleMystery')?.checked) {
          newMechs.push({ type: 1, param: [] });
        }
        if (this.container.querySelector('#toggleFrozen')?.checked) {
          const h = Number(this.container.querySelector('#valFrozenHardness')?.value || 3);
          newMechs.push({ type: 3, param: [h] });
        }
        if (this.container.querySelector('#toggleCurtains')?.checked) {
          const d = Number(this.container.querySelector('#valCurtainsDelay')?.value || 4);
          newMechs.push({ type: 4, param: [d] });
        }

        // Giữ lại mechanic Linked cũ nếu có
        const oldLinked = slot.mechanics?.find(m => m.type === 2);
        if (oldLinked) newMechs.push(oldLinked);

        slot.mechanics = newMechs;
        this.notifyChange();
        this.render(this.shooters);
      });
    }
  }

  highlightCurtainsShadow(col, row, isHighlight) {
    const targets = [
      `${col},${row + 1}`,
      `${col + 1},${row}`,
      `${col + 1},${row + 1}`,
    ];

    targets.forEach((coord) => {
      const [c, r] = coord.split(',').map(Number);
      const el = this.container.querySelector(`.smap-slot-card[data-col="${c}"][data-row="${r}"]`);
      if (el) {
        if (isHighlight) {
          el.classList.add('curtains-shadow-hover');
        } else {
          el.classList.remove('curtains-shadow-hover');
        }
      }
    });
  }

  notifyChange() {
    if (typeof this.callbacks.onShooterDataChanged === 'function') {
      this.callbacks.onShooterDataChanged(this.shooters);
    }
  }
}
