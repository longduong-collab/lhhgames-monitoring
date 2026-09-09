/**
 * playtestRenderer.js
 * Giao diện trực quan Playtest tương tác cho game Pixel Ball:
 * - Render Canvas ma trận Block (phân biệt ô Exposed rực rỡ vs ô bị che khuất).
 * - Render Khay chờ (5 Tray slots) với hiệu ứng đạn bay/tia laser từ súng tới block.
 * - Render danh sách cột Shooter (bấm xe để phóng vào khay chờ).
 * - Các nút điều khiển: Chơi lại, Hoàn tác (Undo), Tốc độ 1x/2x/5x, và Auto-Play AI.
 */

import { getColor } from './palette.js';
import { PlaytestEngine } from './playtestEngine.js';
import { calculatePixelArtBounds } from './pixelArtRenderer.js';

export class PlaytestRenderer {
  constructor(containerEl, modalEl) {
    this.container = containerEl;
    this.modal = modalEl;
    this.engine = null;
    this.currentLevel = null;
    this.bounds = null;
    this.autoPlayInterval = null;
    this.bullets = []; // Quản lý hiệu ứng đạn bay trên Canvas

    this.initDOM();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="playtest-wrapper">
        <!-- Top HUD Status Bar -->
        <div class="playtest-hud">
          <div class="hud-stat">
            <span class="hud-label">Khối còn lại:</span>
            <span id="ptActiveBlocks" class="hud-value font-mono text-primary">0</span>
          </div>
          <div class="hud-stat">
            <span class="hud-label">Khay chứa:</span>
            <span id="ptTrayStatus" class="hud-value font-mono">0 / 5</span>
          </div>
          <div class="hud-controls-group">
            <button id="ptBtnSpeed" class="btn btn-secondary btn-sm" title="Tăng tốc độ">⏩ 1x</button>
            <button id="ptBtnUndo" class="btn btn-secondary btn-sm" title="Hoàn tác bước trước">↩️ Undo</button>
            <button id="ptBtnRestart" class="btn btn-secondary btn-sm" title="Chơi lại">🔄 Chơi lại</button>
            <button id="ptBtnAutoPlay" class="btn btn-sample btn-sm" title="AI tự động chơi test">🤖 Auto Test</button>
          </div>
        </div>

        <!-- Main Play Area -->
        <div class="playtest-main-area">
          <!-- Pixel Art Grid Canvas -->
          <div class="playtest-board-container">
            <canvas id="ptBoardCanvas"></canvas>
          </div>

          <!-- Waiting Tray (5 Slots) -->
          <div class="playtest-tray-section">
            <div class="tray-title">Khay Súng Đang Bắn (Waiting Tray - 5 Slots)</div>
            <div id="ptTraySlots" class="tray-slots-grid"></div>
          </div>

          <!-- Shooters Queue Columns -->
          <div class="playtest-shooters-section">
            <div class="shooters-title">Danh Sách Xe / Súng (Click để đưa vào khay)</div>
            <div id="ptShootersGrid" class="shooters-columns-grid"></div>
          </div>
        </div>

        <!-- Game Over Overlay Banner -->
        <div id="ptBannerOverlay" class="playtest-banner-overlay" style="display: none;">
          <div class="banner-box">
            <div id="ptBannerIcon" class="banner-icon">🎉</div>
            <h3 id="ptBannerTitle">CHIẾN THẮNG!</h3>
            <p id="ptBannerDesc">Đã dọn sạch toàn bộ Pixel Art của Level này.</p>
            <div class="banner-actions">
              <button id="ptBannerBtnRestart" class="btn btn-primary">Chơi lại</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.boardCanvas = this.container.querySelector('#ptBoardCanvas');
    this.ctx = this.boardCanvas.getContext('2d');
    this.activeBlocksEl = this.container.querySelector('#ptActiveBlocks');
    this.trayStatusEl = this.container.querySelector('#ptTrayStatus');
    this.traySlotsContainer = this.container.querySelector('#ptTraySlots');
    this.shootersGridContainer = this.container.querySelector('#ptShootersGrid');
    this.bannerOverlay = this.container.querySelector('#ptBannerOverlay');
    this.bannerTitle = this.container.querySelector('#ptBannerTitle');
    this.bannerIcon = this.container.querySelector('#ptBannerIcon');
    this.bannerDesc = this.container.querySelector('#ptBannerDesc');

    // Controls
    this.btnSpeed = this.container.querySelector('#ptBtnSpeed');
    this.btnUndo = this.container.querySelector('#ptBtnUndo');
    this.btnRestart = this.container.querySelector('#ptBtnRestart');
    this.btnAutoPlay = this.container.querySelector('#ptBtnAutoPlay');
    this.bannerBtnRestart = this.container.querySelector('#ptBannerBtnRestart');

    this.initEvents();
  }

  initEvents() {
    this.btnSpeed.addEventListener('click', () => {
      if (!this.engine) return;
      const speeds = [1, 2, 5];
      const curIdx = speeds.indexOf(this.engine.speedMulti);
      const nextSpeed = speeds[(curIdx + 1) % speeds.length];
      this.engine.speedMulti = nextSpeed;
      this.btnSpeed.textContent = `⏩ ${nextSpeed}x`;
    });

    this.btnUndo.addEventListener('click', () => {
      if (this.engine) {
        this.engine.undo();
        this.bannerOverlay.style.display = 'none';
      }
    });

    this.btnRestart.addEventListener('click', () => {
      this.restartLevel();
    });

    this.bannerBtnRestart.addEventListener('click', () => {
      this.restartLevel();
    });

    this.btnAutoPlay.addEventListener('click', () => {
      this.toggleAutoPlay();
    });

    // Event Delegation: Nhận diện bấm tức thì bằng pointerdown & click, không bao giờ bị gián đoạn hay trễ
    const handleShooterClick = (e) => {
      const card = e.target.closest('.shooter-card.ready');
      if (!card || !this.engine) return;
      const id = card.getAttribute('data-shooter-id');
      const shooter = this.engine.allShooters.find((s) => s.id === id);
      if (shooter && shooter.isReady && !shooter.inTray && !shooter.isFinished) {
        this.engine.clickShooter(shooter);
      }
    };

    this.shootersGridContainer.addEventListener('pointerdown', handleShooterClick);
  }

  /**
   * Khởi chạy Playtest cho một Level
   */
  startLevel(levelData) {
    this.currentLevel = levelData;
    this.stopAutoPlay();
    this.bannerOverlay.style.display = 'none';
    this.bounds = calculatePixelArtBounds(levelData.rawJson);

    this.engine = new PlaytestEngine(levelData, {
      maxTraySlots: 5,
      speedMulti: 1,
      onStateChange: () => this.render(),
      onBlockHit: (shooter, target) => this.spawnBulletEffect(shooter, target),
      onGameOver: (result) => this.handleGameOver(result),
    });

    this.btnSpeed.textContent = '⏩ 1x';
    this.render();
  }

  loadLevel(levelData) {
    this.startLevel(levelData);
  }

  destroy() {
    this.stopAutoPlay();
    this.engine = null;
    this.currentLevel = null;
    this.bullets = [];
    if (this.ctx && this.boardCanvas) {
      this.ctx.clearRect(0, 0, this.boardCanvas.width, this.boardCanvas.height);
    }
  }

  restartLevel() {
    if (this.currentLevel) {
      this.startLevel(this.currentLevel);
    }
  }

  toggleAutoPlay() {
    if (this.autoPlayInterval) {
      this.stopAutoPlay();
    } else {
      this.btnAutoPlay.classList.add('active');
      this.btnAutoPlay.textContent = '⏹ Dừng Auto';
      this.autoPlayInterval = setInterval(async () => {
        if (!this.engine || this.engine.isGameOver) {
          this.stopAutoPlay();
          return;
        }
        const moved = await this.engine.autoStep();
        if (!moved) {
          this.stopAutoPlay();
        }
      }, 350 / (this.engine?.speedMulti || 1));
    }
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
    this.btnAutoPlay.classList.remove('active');
    this.btnAutoPlay.textContent = '🤖 Auto Test';
  }

  handleGameOver({ isWin, reason }) {
    this.stopAutoPlay();
    this.bannerOverlay.style.display = 'flex';

    if (isWin) {
      this.bannerIcon.textContent = '🎉';
      this.bannerTitle.textContent = 'CHIẾN THẮNG!';
      this.bannerTitle.className = 'text-success';
      this.bannerDesc.textContent = 'Bạn đã dọn sạch toàn bộ Pixel Art mà không bị kẹt khay!';
    } else {
      this.bannerIcon.textContent = '💥';
      this.bannerTitle.textContent = 'THẤT BẠI (LOSE)!';
      this.bannerTitle.className = 'text-danger';
      this.bannerDesc.textContent =
        reason === 'deadlock'
          ? 'Cả 5 ô khay chứa đều đầy và không súng nào bắn được block tiếp theo (Kẹt đường).'
          : 'Hết lượt di chuyển hợp lệ.';
    }
  }

  /**
   * Tạo hiệu ứng đạn bay từ vị trí slot trong khay lên block
   */
  spawnBulletEffect(shooter, target) {
    if (!this.bounds) return;
    const cs = this.cellSize;
    const { minX, maxY } = this.bounds;
    const drawX = target.x - minX;
    const drawY = maxY - target.y;
    const targetPx = drawX * cs + cs / 2;
    const targetPy = drawY * cs + cs / 2;

    this.bullets.push({
      startX: targetPx,
      startY: targetPy + 60,
      targetX: targetPx,
      targetY: targetPy,
      color: getColor(shooter.type),
      progress: 0,
    });

    this.animateBullets();
  }

  animateBullets() {
    if (this.bullets.length === 0) return;

    this.bullets.forEach((b) => {
      b.progress += 0.25 * (this.engine?.speedMulti || 1);
    });

    this.bullets = this.bullets.filter((b) => b.progress < 1);
    this.renderCanvas();

    if (this.bullets.length > 0) {
      requestAnimationFrame(() => this.animateBullets());
    }
  }

  /**
   * Render toàn bộ giao diện Playtest
   */
  render() {
    if (!this.engine) return;

    // 1. Cập nhật HUD
    this.activeBlocksEl.textContent = this.engine.totalActiveBlocks;
    const occupiedSlots = this.engine.tray.filter((s) => s !== null).length;
    this.trayStatusEl.textContent = `${occupiedSlots} / ${this.engine.maxTraySlots}`;
    if (occupiedSlots >= 5) {
      this.trayStatusEl.className = 'hud-value font-mono text-danger font-bold';
    } else {
      this.trayStatusEl.className = 'hud-value font-mono text-primary';
    }

    // 2. Render Board Canvas
    this.renderCanvas();

    // 3. Render Tray Slots
    this.renderTray();

    // 4. Render Shooters Columns
    this.renderShooters();
  }

  /**
   * Render Canvas Ma Trận Block theo Bounding Box vừa vặn
   */
  renderCanvas() {
    if (!this.engine || !this.bounds) return;
    const { blocks } = this.engine;
    const { minX, maxX, minY, maxY, width: cropW, height: cropH } = this.bounds;

    const maxDim = Math.max(cropW, cropH, 1);
    const targetSize = 440;
    this.cellSize = Math.max(10, Math.floor(targetSize / maxDim));
    const cs = this.cellSize;

    const canvasW = cropW * cs;
    const canvasH = cropH * cs;

    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    this.boardCanvas.width = canvasW * dpr;
    this.boardCanvas.height = canvasH * dpr;
    this.boardCanvas.style.width = `${canvasW}px`;
    this.boardCanvas.style.height = `${canvasH}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    const isLight = typeof document !== 'undefined' && document.documentElement ? document.documentElement.getAttribute('data-theme') === 'light' : false;

    // Vẽ nền caro
    const baseBg = isLight ? '#f8fafc' : '#10131d';
    const checkerA = isLight ? '#f1f5f9' : '#141824';
    const checkerB = isLight ? '#e2e8f0' : '#1c2132';

    this.ctx.fillStyle = baseBg;
    this.ctx.fillRect(0, 0, canvasW, canvasH);

    for (let cx = 0; cx < cropW; cx++) {
      for (let cy = 0; cy < cropH; cy++) {
        const isAlt = (cx + cy) % 2 === 1;
        this.ctx.fillStyle = isAlt ? checkerA : checkerB;
        this.ctx.fillRect(cx * cs, cy * cs, cs, cs);
      }
    }

    // Vẽ từng Block trong vùng Bounding Box (Y=0 ở đáy màn hình theo Unity)
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const b = blocks[x] ? blocks[x][y] : null;
        if (!b) continue;

        const drawX = x - minX;
        const drawY = maxY - y;
        const px = drawX * cs;
        const py = drawY * cs;

        if (b.isAlive) {
          const hex = getColor(b.type);
          this.ctx.fillStyle = hex;
          this.ctx.fillRect(px, py, cs, cs);

          // Đường viền nhẹ để phân tách từng ô pixel art rõ nét
          this.ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.12)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(px + 0.5, py + 0.5, cs - 1, cs - 1);
        } else {
          // Ô trống
          this.ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(px + 0.5, py + 0.5, cs - 1, cs - 1);
        }
      }
    }

    // Vẽ hiệu ứng đạn bay nếu có
    this.bullets.forEach((bullet) => {
      const curX = bullet.startX + (bullet.targetX - bullet.startX) * bullet.progress;
      const curY = bullet.startY + (bullet.targetY - bullet.startY) * bullet.progress;

      this.ctx.beginPath();
      this.ctx.arc(curX, curY, Math.max(3, cs / 3), 0, Math.PI * 2);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fill();
      this.ctx.strokeStyle = bullet.color;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });
  }

  /**
   * Render Khay 5 slots dạng xe tải (Truck / Bus)
   */
  renderTray() {
    const slots = this.engine.tray;
    let html = '';

    for (let i = 0; i < this.engine.maxTraySlots; i++) {
      const shooter = slots[i];
      if (shooter) {
        const hex = getColor(shooter.type);
        html += `
          <div class="tray-slot occupied truck-slot" style="--truck-color: ${hex};">
            <div class="truck-shape">
              <div class="truck-cab">
                <div class="truck-headlight-l"></div>
                <div class="truck-windshield"></div>
                <div class="truck-headlight-r"></div>
              </div>
              <div class="truck-body" style="background-color: ${hex};">
                <div class="truck-roof-badge">
                  <span class="truck-shots-text font-mono">${shooter.remainingShots}</span>
                </div>
              </div>
              <div class="truck-wheel wheel-fl"></div>
              <div class="truck-wheel wheel-fr"></div>
              <div class="truck-wheel wheel-bl"></div>
              <div class="truck-wheel wheel-br"></div>
            </div>
            <div class="slot-info">
              <span class="slot-type">Type ${shooter.type}</span>
            </div>
            <div class="slot-shooting-indicator">${shooter.isShooting ? '⚡ Đang bắn...' : '⏸ Chờ ở khay'}</div>
          </div>
        `;
      } else {
        html += `
          <div class="tray-slot empty">
            <span class="empty-slot-num">Slot ${i + 1}</span>
            <span class="empty-slot-desc">Trống</span>
          </div>
        `;
      }
    }

    if (this._lastTrayHtml !== html) {
      this.traySlotsContainer.innerHTML = html;
      this._lastTrayHtml = html;
    }
  }

  /**
   * Render Ma trận Xe tải Shooter theo từng cột
   */
  renderShooters() {
    const fullGrid = this.engine.shootersGrid;
    
    // Tìm giới hạn cột thực sự có xe
    let startCol = fullGrid.length;
    let endCol = 0;
    
    fullGrid.forEach((colList, colIdx) => {
      const hasShooter = colList.some(s => s !== null && s !== undefined);
      if (hasShooter) {
        if (colIdx < startCol) startCol = colIdx;
        if (colIdx > endCol) endCol = colIdx;
      }
    });

    if (startCol > endCol) {
      startCol = 0;
      endCol = 0;
    }

    let html = '';

    // Tìm số hàng lớn nhất trong vùng hiển thị để tạo lưới đồng nhất
    let maxRows = 0;
    for (let colIdx = startCol; colIdx <= endCol; colIdx++) {
      const len = (fullGrid[colIdx] || []).length;
      if (len > maxRows) maxRows = len;
    }

    for (let colIdx = startCol; colIdx <= endCol; colIdx++) {
      const colList = fullGrid[colIdx] || [];
      html += `<div class="shooter-column" data-col="${colIdx}">`;
      html += `<div class="column-header">Cột ${colIdx + 1}</div>`;

      for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
        const shooter = colList[rowIdx];
        if (!shooter || shooter.isFinished || shooter.inTray) {
          html += `<div class="shooter-card empty-slot"></div>`;
          continue;
        }

        const hex = getColor(shooter.type);
        const cardClass = shooter.isReady ? 'shooter-card ready truck-card' : 'shooter-card blocked truck-card';

        html += `
          <div class="${cardClass}" data-shooter-id="${shooter.id}" style="--truck-color: ${hex};">
            <div class="truck-shape">
              <div class="truck-cab">
                <div class="truck-headlight-l"></div>
                <div class="truck-windshield"></div>
                <div class="truck-headlight-r"></div>
              </div>
              <div class="truck-body" style="background-color: ${hex};">
                <div class="truck-roof-badge">
                  <span class="truck-shots-text font-mono">${shooter.remainingShots}</span>
                </div>
              </div>
              <div class="truck-wheel wheel-fl"></div>
              <div class="truck-wheel wheel-fr"></div>
              <div class="truck-wheel wheel-bl"></div>
              <div class="truck-wheel wheel-br"></div>
            </div>
          </div>
        `;
      }

      html += `</div>`;
    }

    if (this._lastShootersHtml !== html) {
      this.shootersGridContainer.innerHTML = html;
      this._lastShootersHtml = html;
    }
  }
}
