/**
 * economyMapRenderer.js
 * Render giao diện Ma trận Level x Liveops Events, Tooltip Inspector bóc tách nguồn gốc,
 * Thanh bật/tắt (Event Toggles) linh hoạt và Modal Cấu hình JSON cho Game Designer.
 */

import {
  DEFAULT_ECONOMY_CONFIG,
  loadEconomyConfig,
  saveEconomyConfig,
  resetEconomyConfig
} from './economyEventsConfig.js';
import { EconomyTracker } from './economyTracker.js';

export class EconomyMapRenderer {
  constructor(container) {
    this.container = container;
    this.config = loadEconomyConfig();
    this.tracker = new EconomyTracker(this.config);
    this.levels = [];
    this.hoverLevel = null;
    this.initTooltip();
    this.initMilestonePopover();
    this.initConfigModal();
  }

  initTooltip() {
    this.tooltip = document.getElementById('economyInspectorTooltip');
    if (!this.tooltip) {
      this.tooltip = document.createElement('div');
      this.tooltip.id = 'economyInspectorTooltip';
      this.tooltip.className = 'economy-inspector-tooltip';
      this.tooltip.style.display = 'none';
      document.body.appendChild(this.tooltip);
    }
  }

  initMilestonePopover() {
    this.popover = document.getElementById('economyMilestonePopover');
    if (!this.popover) {
      this.popover = document.createElement('div');
      this.popover.id = 'economyMilestonePopover';
      this.popover.className = 'economy-milestone-popover';
      this.popover.style.display = 'none';
      document.body.appendChild(this.popover);
    }
  }

  initConfigModal() {
    this.modal = document.getElementById('economyConfigModal');
    if (!this.modal) {
      this.modal = document.createElement('div');
      this.modal.id = 'economyConfigModal';
      this.modal.className = 'economy-config-modal-backdrop';
      this.modal.style.display = 'none';
      this.modal.innerHTML = `
        <div class="economy-config-modal-window">
          <div class="economy-config-modal-header">
            <h3>⚙️ Cấu hình Liveops & Economy JSON</h3>
            <button class="btn-close-modal" id="btnCloseEconomyConfigModal">✖</button>
          </div>
          <div class="economy-config-modal-body">
            <div class="config-selector-row">
              <label for="economyConfigSectionSelect">Chọn Module cấu hình:</label>
              <select id="economyConfigSectionSelect" class="form-control">
                <option value="ALL">-- Toàn bộ Cấu hình (Full JSON) --</option>
                <option value="core">Core Game (Vàng thắng, Giá Booster, Hồi sinh)</option>
                <option value="weeklyChallenge">Weekly Challenge</option>
                <option value="adventureRush">Adventure Rush (30 CPs - Collect)</option>
                <option value="bearPass">Bear Pass (31 CPs - Season Pass)</option>
                <option value="keyChallenge">Key Challenge (Milestones & Rewards)</option>
                <option value="dragonTreasure">Dragon Treasure (Win Streak Pool)</option>
                <option value="treasureCave">Treasure Cave (Streak & Pool)</option>
                <option value="magicCrafting">Magic Crafting (15 Stages - Cauldron)</option>
                <option value="cloudQuest">Cloud Quest (Win Streak Lives)</option>
                <option value="grandHunt">Grand Hunt (Space Mission)</option>
                <option value="missionControl">Mission Control (Stage Chests)</option>
                <option value="boosterUnlocks">Mốc mở khóa Boosters</option>
                <option value="dailyFreeCoin">Daily Free Coin</option>
              </select>
            </div>
            <textarea id="economyConfigJsonTextarea" class="economy-json-textarea" spellcheck="false"></textarea>
            <div id="economyConfigErrorNotice" class="config-error-notice" style="display:none;"></div>
          </div>
          <div class="economy-config-modal-footer">
            <button class="btn btn-secondary" id="btnResetEconomyConfigDefault">🔄 Khôi phục mặc định</button>
            <div class="footer-right">
              <button class="btn btn-secondary" id="btnCancelEconomyConfig">Hủy</button>
              <button class="btn btn-primary" id="btnApplyEconomyConfig">💾 Áp dụng thay đổi</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(this.modal);
    }

    const btnClose = this.modal.querySelector('#btnCloseEconomyConfigModal');
    const btnCancel = this.modal.querySelector('#btnCancelEconomyConfig');
    const btnApply = this.modal.querySelector('#btnApplyEconomyConfig');
    const btnReset = this.modal.querySelector('#btnResetEconomyConfigDefault');
    const selectSection = this.modal.querySelector('#economyConfigSectionSelect');
    const textarea = this.modal.querySelector('#economyConfigJsonTextarea');
    const errorNotice = this.modal.querySelector('#economyConfigErrorNotice');

    const closeModal = () => {
      this.modal.style.display = 'none';
    };

    btnClose?.addEventListener('click', closeModal);
    btnCancel?.addEventListener('click', closeModal);

    selectSection?.addEventListener('change', () => {
      const section = selectSection.value;
      if (section === 'ALL') {
        textarea.value = JSON.stringify(this.config, null, 2);
      } else {
        textarea.value = JSON.stringify(this.config[section] || {}, null, 2);
      }
      errorNotice.style.display = 'none';
    });

    btnReset?.addEventListener('click', () => {
      if (confirm('Khôi phục toàn bộ cấu hình Economy về mặc định từ file asset gốc?')) {
        this.config = resetEconomyConfig();
        this.tracker.updateConfig(this.config);
        selectSection.value = 'ALL';
        textarea.value = JSON.stringify(this.config, null, 2);
        errorNotice.style.display = 'none';
        this.render(this.levels);
        this.showToast('✅ Đã khôi phục cấu hình mặc định!');
      }
    });

    btnApply?.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(textarea.value);
        const section = selectSection.value;
        if (section === 'ALL') {
          this.config = parsed;
        } else {
          this.config[section] = parsed;
        }

        saveEconomyConfig(this.config);
        this.tracker.updateConfig(this.config);
        errorNotice.style.display = 'none';
        closeModal();
        this.render(this.levels);
        this.showToast('💾 Đã áp dụng cấu hình Economy mới thành công!');
      } catch (err) {
        errorNotice.textContent = '❌ Lỗi cú pháp JSON: ' + err.message;
        errorNotice.style.display = 'block';
      }
    });
  }

  openConfigModal() {
    const selectSection = this.modal.querySelector('#economyConfigSectionSelect');
    const textarea = this.modal.querySelector('#economyConfigJsonTextarea');
    const errorNotice = this.modal.querySelector('#economyConfigErrorNotice');
    if (selectSection) selectSection.value = 'ALL';
    if (textarea) textarea.value = JSON.stringify(this.config, null, 2);
    if (errorNotice) errorNotice.style.display = 'none';
    this.modal.style.display = 'flex';
  }

  showToast(msg) {
    let toast = document.getElementById('economyToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'economyToast';
      toast.className = 'economy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /**
   * Render chính của Tab Economy Map
   * @param {Array} levelsData Danh sách level từ file hoặc sample
   */
  render(levelsData = []) {
    this.levels = levelsData;
    if (!this.container) return;

    const maxLevel = levelsData.length > 0
      ? Math.max(...levelsData.map(l => l.level || 0), 100)
      : 100;

    const eventRows = this.tracker.getEventRows(maxLevel);
    const enabledEvents = this.tracker.getEnabledEventsMap();

    // Danh sách các event phục vụ toggle bar
    const toggleOptions = [
      { id: 'level_wins', label: 'Thưởng ván thắng', icon: '🪙', color: '#f59e0b' },
      { id: 'weekly', label: 'Weekly Challenge (L11)', icon: '🏆', color: '#3b82f6' },
      { id: 'adventure_rush', label: 'Adventure Rush (L20)', icon: '🧭', color: '#14b8a6' },
      { id: 'bear_pass', label: 'Bear Pass (L36)', icon: '🐻', color: '#f97316' },
      { id: 'key_challenge', label: 'Key Challenge (L40)', icon: '🗝️', color: '#10b981' },
      { id: 'dragon_treasure', label: 'Dragon Treasure (L61)', icon: '🐲', color: '#dc2626' },
      { id: 'treasure_cave', label: 'Treasure Cave (L67)', icon: '💎', color: '#ec4899' },
      { id: 'magic_crafting', label: 'Magic Crafting (L81)', icon: '🧪', color: '#8b5cf6' },
      { id: 'cloud_quest', label: 'Cloud Quest (L101)', icon: '☁️', color: '#0284c7' },
      { id: 'grand_hunt', label: 'Grand Hunt (L121)', icon: '🛸', color: '#e11d48' },
      { id: 'mission_control', label: 'Mission Control (L131)', icon: '🛰️', color: '#4f46e5' },
      { id: 'daily_gift', label: 'Quà ngày', icon: '📅', color: '#06b6d4' }
    ];

    this.container.innerHTML = `
      <div class="economy-map-header">
        <div class="economy-title-block">
          <h2>💰 Bản Đồ Kinh Tế & Phần Thưởng Liveops (Economy & Liveops Map)</h2>
          <p class="economy-subtitle">
            Giả định kịch bản người chơi chuẩn (thắng không thua). Bật/tắt các sự kiện để mô phỏng dòng tiền và hover vào từng cột level để bóc tách nguồn gốc tài nguyên.
          </p>
        </div>
        <div class="economy-controls-block">
          <button id="btnOpenEconomyConfig" class="btn btn-secondary">
            <span>⚙️</span> Cấu hình Liveops JSON
          </button>
          <div class="economy-legend">
            <span class="legend-item"><span class="badge badge-normal">🟢 Normal (+25G)</span></span>
            <span class="legend-item"><span class="badge badge-hard">🟠 Hard (+50G)</span></span>
            <span class="legend-item"><span class="badge badge-super-hard">🔴 Super Hard (+75G)</span></span>
            <span class="legend-item"><span class="badge badge-milestone">🎁 Mốc Thưởng</span></span>
          </div>
        </div>
      </div>

      <!-- Liveops Event Toggles Bar -->
      <div class="economy-toggles-bar">
        <div class="toggles-bar-title">
          <span>⚡ Bật/Tắt Liveops Events:</span>
          <div class="toggles-quick-actions">
            <button id="btnEnableAllEvents" class="btn-toggle-quick">Bật tất cả</button>
            <span class="sep">•</span>
            <button id="btnDisableAllEvents" class="btn-toggle-quick">Tắt tất cả</button>
          </div>
        </div>
        <div class="toggles-pills-list">
          ${toggleOptions.map(opt => {
            const isChecked = enabledEvents[opt.id] !== false;
            return `
              <label class="toggle-pill ${isChecked ? 'active' : ''}" style="--pill-color: ${opt.color};">
                <input type="checkbox" class="economy-event-checkbox" data-event-id="${opt.id}" ${isChecked ? 'checked' : ''}>
                <span class="toggle-pill-icon">${opt.icon}</span>
                <span class="toggle-pill-label">${opt.label}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Khung bảng scroll ngang -->
      <div class="economy-table-wrapper" id="economyTableScrollWrapper">
        <table class="economy-matrix-table">
          <thead>
            <tr>
              <th class="sticky-col header-corner">Sự kiện / Tính năng</th>
              ${Array.from({ length: maxLevel }, (_, i) => {
                const lv = i + 1;
                const diff = this.tracker.getLevelDifficulty(lv);
                const badgeClass = diff === 'SuperHard' ? 'diff-super-hard' : diff === 'Hard' ? 'diff-hard' : 'diff-normal';
                return `
                  <th class="level-header-col ${badgeClass}" data-level="${lv}">
                    <div class="th-level-num">L${lv}</div>
                    <div class="th-level-diff">${diff === 'SuperHard' ? 'SH' : diff === 'Hard' ? 'H' : 'N'}</div>
                  </th>
                `;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${eventRows.map(row => `
              <tr class="event-row" data-event-id="${row.id}">
                <td class="sticky-col row-label-cell" style="border-left: 4px solid ${row.color}">
                  <span class="row-icon">${row.icon}</span>
                  <span class="row-name">${row.label}</span>
                </td>
                ${row.cells.map(cell => {
                  const cellClasses = ['event-cell'];
                  if (cell.active) cellClasses.push('cell-active');
                  if (cell.isMilestone) cellClasses.push('cell-milestone');
                  if (cell.reward?.isChest) cellClasses.push('cell-chest');

                  let contentHtml = '';
                  if (cell.reward) {
                    if (cell.reward.isChest) {
                      contentHtml = `<span class="milestone-badge chest-badge" title="${cell.tooltip || ''}">${cell.reward.icon} <span class="chest-badge-count">${cell.reward.count}</span></span>`;
                    } else {
                      contentHtml = `<span class="milestone-badge single-reward-badge" title="${cell.tooltip || ''}"><span class="reward-icon">${cell.reward.icon}</span> <span class="reward-text">${cell.text || ''}</span></span>`;
                    }
                  } else if (cell.text) {
                    contentHtml = `<span class="cell-text">${cell.text}</span>`;
                  }

                  const rewardDataAttr = cell.reward ? `data-reward="${encodeURIComponent(JSON.stringify(cell.reward))}"` : '';

                  return `
                    <td class="${cellClasses.join(' ')}" 
                        data-level="${cell.level}" 
                        ${rewardDataAttr}
                        data-tooltip="${encodeURIComponent(cell.tooltip || '')}"
                        style="${cell.active && !cell.isMilestone ? `background-color: ${row.color}15;` : ''}">
                      ${contentHtml}
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Gắn nút mở modal
    this.container.querySelector('#btnOpenEconomyConfig')?.addEventListener('click', () => {
      this.openConfigModal();
    });

    // Gắn sự kiện Checkbox Toggles
    this.attachToggleListeners();

    // Gắn sự kiện Hover Level Inspector
    this.attachHoverListeners();
  }

  attachToggleListeners() {
    const checkboxes = this.container.querySelectorAll('.economy-event-checkbox');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const evId = cb.getAttribute('data-event-id');
        const isChecked = cb.checked;
        this.tracker.toggleEvent(evId, isChecked);
        this.render(this.levels);
      });
    });

    this.container.querySelector('#btnEnableAllEvents')?.addEventListener('click', () => {
      checkboxes.forEach(cb => {
        const evId = cb.getAttribute('data-event-id');
        this.tracker.toggleEvent(evId, true);
      });
      this.render(this.levels);
    });

    this.container.querySelector('#btnDisableAllEvents')?.addEventListener('click', () => {
      checkboxes.forEach(cb => {
        const evId = cb.getAttribute('data-event-id');
        this.tracker.toggleEvent(evId, false);
      });
      this.render(this.levels);
    });
  }

  attachHoverListeners() {
    const table = this.container.querySelector('.economy-matrix-table');
    if (!table) return;

    // 1. Hover trên Cell để xem Milestone Reward Popover
    const cellsWithReward = table.querySelectorAll('td[data-reward]');
    cellsWithReward.forEach(cell => {
      cell.addEventListener('mouseenter', (e) => {
        const rawReward = cell.getAttribute('data-reward');
        if (rawReward) {
          try {
            const rewardObj = JSON.parse(decodeURIComponent(rawReward));
            const lv = parseInt(cell.getAttribute('data-level'), 10);
            const tooltipTitle = decodeURIComponent(cell.getAttribute('data-tooltip') || '');
            this.showMilestonePopover(e, rewardObj, lv, tooltipTitle);
          } catch (err) {
            // fallback
          }
        }
      });

      cell.addEventListener('mousemove', (e) => {
        this.positionMilestonePopover(e);
      });

      cell.addEventListener('mouseleave', () => {
        this.hideMilestonePopover();
      });
    });

    // 2. Hover trên cột (Header & Cell không có reward) để xem Inspector
    const interactiveCells = table.querySelectorAll('[data-level]');
    interactiveCells.forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const lv = parseInt(el.getAttribute('data-level'), 10);
        if (lv) {
          this.highlightColumn(lv, true);
          // Nếu cell này KHÔNG có data-reward (hoặc là header col), hiển thị Inspector tổng
          if (!el.hasAttribute('data-reward')) {
            this.showInspectorTooltip(e, lv);
          }
        }
      });

      el.addEventListener('mousemove', (e) => {
        if (!el.hasAttribute('data-reward')) {
          this.positionTooltip(e);
        }
      });

      el.addEventListener('mouseleave', () => {
        const lv = parseInt(el.getAttribute('data-level'), 10);
        if (lv) {
          this.highlightColumn(lv, false);
          this.hideInspectorTooltip();
        }
      });
    });
  }

  highlightColumn(level, isHighlight) {
    const cells = this.container.querySelectorAll(`[data-level="${level}"]`);
    cells.forEach(c => {
      if (isHighlight) c.classList.add('col-hovered');
      else c.classList.remove('col-hovered');
    });
  }

  showInspectorTooltip(event, level) {
    const data = this.tracker.calculateLevelEconomy(level);
    const diffBadge = data.difficulty === 'SuperHard' 
      ? '<span class="badge badge-super-hard">🔴 Super Hard</span>' 
      : data.difficulty === 'Hard' 
      ? '<span class="badge badge-hard">🟠 Hard</span>' 
      : '<span class="badge badge-normal">🟢 Normal</span>';

    const b = data.cumulative.boosters;
    const sources = data.breakdownBySource;

    this.tooltip.innerHTML = `
      <div class="e-tooltip-header">
        <div class="e-tooltip-title">Level ${level} ${diffBadge}</div>
        <div class="e-tooltip-win-coin">Thưởng ván: <strong>+${data.currentWinCoin} Coin</strong></div>
      </div>

      <!-- Khối tổng tài nguyên tích lũy -->
      <div class="e-tooltip-section">
        <div class="e-section-title">🪙 TÀI NGUYÊN TÍCH LŨY (PERFECT RUN)</div>
        <div class="e-resource-grid">
          <div class="e-res-item highlight-gold">
            <span class="e-res-icon">💰</span>
            <span class="e-res-label">Tổng Gold:</span>
            <span class="e-res-val">${data.cumulative.totalCoin.toLocaleString()} G</span>
          </div>
          <div class="e-res-item">
            <span class="e-res-icon">❤️</span>
            <span class="e-res-label">Unlimited Heart:</span>
            <span class="e-res-val">${data.cumulative.unlimitedHeartMinutes} phút</span>
          </div>
          <div class="e-res-item">
            <span class="e-res-icon">⚡</span>
            <span class="e-res-label">SpeedUp:</span>
            <span class="e-res-val">${data.cumulative.speedUpMinutes} phút</span>
          </div>
        </div>
        <div class="e-boosters-row">
          <span class="e-b-badge" title="Claw (Gắp)">🦀 x${b.claw}</span>
          <span class="e-b-badge" title="Hand (Đổi)">🖐️ x${b.hand}</span>
          <span class="e-b-badge" title="Shuffle (Xáo)">🔀 x${b.shuffle}</span>
          <span class="e-b-badge" title="Super Shooter (Đóng băng/Xóa màu)">❄️ x${b.superShooter}</span>
          <span class="e-b-badge" title="Add Tray (Khay phụ)">📥 x${b.addTray}</span>
        </div>
      </div>

      <!-- Khối phân nhóm nguồn gốc tài nguyên -->
      <div class="e-tooltip-section">
        <div class="e-section-title">📊 NGUỒN GỐC TÀI NGUYÊN (GROUP BY SOURCE)</div>
        <div class="e-source-breakdown">
          ${sources.levelWins.enabled ? `
            <div class="e-source-row">
              <span>🎮 Thắng màn chơi (${level} levels):</span>
              <strong>+${sources.levelWins.coin.toLocaleString()} G</strong>
            </div>
            <div class="e-source-sub">
              (Normal: ${sources.levelWins.normalCount} | Hard: ${sources.levelWins.hardCount} | SuperHard: ${sources.levelWins.superHardCount})
            </div>
          ` : '<div class="e-source-row text-muted"><span>🎮 Thắng màn chơi:</span><em>[Tắt]</em></div>'}
          
          ${sources.weeklyChallenge.enabled ? `
            <div class="e-source-row">
              <span>🏆 Weekly Challenge:</span>
              <strong>+${sources.weeklyChallenge.coin.toLocaleString()} G</strong>
            </div>
          ` : ''}

          ${sources.adventureRush.enabled ? `
            <div class="e-source-row">
              <span>🧭 Adventure Rush (${sources.adventureRush.checkpointsDone}/30 CPs):</span>
              <strong>+${sources.adventureRush.coin.toLocaleString()} G</strong>
            </div>
            <div class="e-source-sub">
              Thưởng: +${sources.adventureRush.heartMinutes}m Tim • +${sources.adventureRush.speedUpMinutes}m SpeedUp
            </div>
          ` : ''}

          ${sources.bearPass.enabled ? `
            <div class="e-source-row">
              <span>🐻 Bear Pass (${sources.bearPass.checkpointsDone}/31 Mốc):</span>
              <strong>+${sources.bearPass.coin.toLocaleString()} G</strong>
            </div>
            <div class="e-source-sub">
              Thưởng: +${sources.bearPass.heartMinutes}m Tim • +${sources.bearPass.speedUpMinutes}m SpeedUp
            </div>
          ` : ''}

          ${sources.keyChallenge.enabled ? `
            <div class="e-source-row">
              <span>🗝️ Key Challenge (${sources.keyChallenge.milestonesDone}/30 Mốc):</span>
              <strong>+${sources.keyChallenge.coin.toLocaleString()} G</strong>
            </div>
            <div class="e-source-sub">
              Tích lũy ${sources.keyChallenge.currentKeys} Keys • Thưởng: +${sources.keyChallenge.heartMinutes}m Tim
            </div>
          ` : ''}

          ${sources.dragonTreasure.enabled ? `
            <div class="e-source-row">
              <span>🐲 Dragon Treasure (${sources.dragonTreasure.poolsWon} pools):</span>
              <strong>+${sources.dragonTreasure.coin.toLocaleString()} G</strong>
            </div>
          ` : ''}

          ${sources.treasureCave.enabled ? `
            <div class="e-source-row">
              <span>💎 Treasure Cave (${sources.treasureCave.streaksCompleted} chuỗi win):</span>
              <strong>+${sources.treasureCave.coin.toLocaleString()} G</strong>
            </div>
            <div class="e-source-sub">
              Đang ở streak ${sources.treasureCave.currentStreak}/${sources.treasureCave.maxStreak} ván
            </div>
          ` : ''}

          ${sources.magicCrafting.enabled ? `
            <div class="e-source-row">
              <span>🧪 Magic Crafting (${sources.magicCrafting.stagesDone}/15 Stages):</span>
              <strong>+${sources.magicCrafting.coin.toLocaleString()} G</strong>
            </div>
            <div class="e-source-sub">
              Thưởng: +${sources.magicCrafting.heartMinutes}m Tim • +${sources.magicCrafting.speedUpMinutes}m SpeedUp
            </div>
          ` : ''}

          ${sources.cloudQuest.enabled ? `
            <div class="e-source-row">
              <span>☁️ Cloud Quest (${sources.cloudQuest.checkpointsDone}/10 CPs):</span>
              <strong>+${sources.cloudQuest.coin.toLocaleString()} G</strong>
            </div>
            <div class="e-source-sub">
              Thưởng: +${sources.cloudQuest.heartMinutes}m Tim • +${sources.cloudQuest.speedUpMinutes}m SpeedUp
            </div>
          ` : ''}

          ${sources.grandHunt.enabled ? `
            <div class="e-source-row">
              <span>🛸 Grand Hunt (${sources.grandHunt.stagesDone}/3 Stages):</span>
              <strong>+${sources.grandHunt.coin.toLocaleString()} G</strong>
            </div>
            <div class="e-source-sub">
              Thưởng: +${sources.grandHunt.heartMinutes}m Tim • +${sources.grandHunt.speedUpMinutes}m SpeedUp
            </div>
          ` : ''}

          ${sources.missionControl.enabled ? `
            <div class="e-source-row">
              <span>🛰️ Mission Control (${sources.missionControl.stagesDone}/4 Stages):</span>
              <strong>+${sources.missionControl.coin.toLocaleString()} G</strong>
            </div>
            <div class="e-source-sub">
              Thưởng: +${sources.missionControl.heartMinutes}m Tim • +${sources.missionControl.speedUpMinutes}m SpeedUp
            </div>
          ` : ''}

          ${sources.dailyFreeGifts.enabled ? `
            <div class="e-source-row">
              <span>📅 Quà ngày (Ước tính ~${sources.dailyFreeGifts.estimatedDays} ngày):</span>
              <strong>+${sources.dailyFreeGifts.coin.toLocaleString()} G</strong>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Mốc sắp đạt -->
      ${sources.keyChallenge.enabled && sources.keyChallenge.nextMilestone ? `
        <div class="e-tooltip-section next-milestone-box">
          <div class="e-section-title">🎯 MỐC TIẾP THEO SẮP ĐẠT</div>
          <div>Key Challenge Milestone ${sources.keyChallenge.nextMilestone.step}: <strong>${sources.keyChallenge.nextMilestone.rewardName}</strong></div>
          <div class="text-muted">Cần thêm ${sources.keyChallenge.nextMilestone.keysNeeded} Keys (${Math.ceil(sources.keyChallenge.nextMilestone.keysNeeded / 4)} ván thắng nữa)</div>
        </div>
      ` : ''}

      <!-- Cảnh báo Sinks & Khuyến nghị GD -->
      <div class="e-tooltip-section sink-warnings-box">
        <div class="e-section-title">⚠️ ĐIỂM TIÊU HAO (SINKS) & KHUYẾN NGHỊ</div>
        ${data.sinkWarnings.length > 0 ? `
          <ul class="e-sink-list">
            ${data.sinkWarnings.map(w => `<li>${w}</li>`).join('')}
          </ul>
        ` : '<div class="text-muted">Màn chơi an toàn, không có áp lực chi tiêu bắt buộc.</div>'}
        <div class="e-health-status ${data.healthStatus.rating.toLowerCase()}">
          Trạng thái kinh tế: <strong>${data.healthStatus.rating}</strong> — ${data.healthStatus.note}
        </div>
      </div>
    `;

    this.tooltip.style.display = 'block';
    this.positionTooltip(event);
  }

  positionTooltip(e) {
    if (!this.tooltip) return;
    const padding = 15;
    let left = e.clientX + padding;
    let top = e.clientY + padding;

    const rect = this.tooltip.getBoundingClientRect();
    if (left + rect.width > window.innerWidth) {
      left = e.clientX - rect.width - padding;
    }
    if (top + rect.height > window.innerHeight) {
      top = window.innerHeight - rect.height - padding;
    }
    if (top < 10) top = 10;

    this.tooltip.style.left = `${Math.max(10, left)}px`;
    this.tooltip.style.top = `${Math.max(10, top)}px`;
  }

  hideInspectorTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }

  /**
   * Hiển thị Popover khi rê chuột vào mốc thưởng (Icon / Rương báu)
   */
  showMilestonePopover(event, rewardObj, level, title) {
    if (!this.popover) return;
    const items = rewardObj.rewardItems || [];
    const isChest = rewardObj.isChest;

    let itemsHtml = '';
    if (items.length > 0) {
      itemsHtml = `
        <div class="popover-rewards-list">
          ${items.map(item => `
            <div class="popover-reward-item">
              <span class="popover-r-icon">${item.icon}</span>
              <span class="popover-r-label">${item.label}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    this.popover.innerHTML = `
      <div class="popover-header">
        <span class="popover-icon">${isChest ? '🧰' : rewardObj.icon}</span>
        <div>
          <div class="popover-title">${isChest ? 'RƯƠNG THƯỞNG MỐC' : 'PHẦN THƯỞNG MỐC'} (L${level})</div>
          <div class="popover-subtitle">${title || rewardObj.label}</div>
        </div>
      </div>
      <div class="popover-body">
        ${itemsHtml}
      </div>
    `;

    this.popover.style.display = 'block';
    this.positionMilestonePopover(event);
  }

  positionMilestonePopover(e) {
    if (!this.popover) return;
    const padding = 12;
    let left = e.clientX + padding;
    let top = e.clientY + padding;

    const rect = this.popover.getBoundingClientRect();
    if (left + rect.width > window.innerWidth) {
      left = e.clientX - rect.width - padding;
    }
    if (top + rect.height > window.innerHeight) {
      top = window.innerHeight - rect.height - padding;
    }
    if (top < 10) top = 10;

    this.popover.style.left = `${Math.max(10, left)}px`;
    this.popover.style.top = `${Math.max(10, top)}px`;
  }

  hideMilestonePopover() {
    if (this.popover) {
      this.popover.style.display = 'none';
    }
  }
}

