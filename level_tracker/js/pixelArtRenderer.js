/**
 * pixelArtRenderer.js
 * Chịu trách nhiệm render hình ảnh Pixel Art từ blockData lên HTML5 Canvas bằng Palette 36 màu.
 * Render trực tiếp theo đúng cấu trúc dữ liệu JSON gốc (blockData[x].d[y]).
 * Tự động đổi màu nền Canvas và ô trống theo Theme Sáng / Tối (Dark / Light Mode) của ứng dụng.
 */

import { PALETTE, getColor } from './palette.js';

/**
 * Tính toán bounding box vừa khít bao quanh các block có màu
 * Giúp hiển thị pixel art to rõ, không bị dư thừa khoảng trống vô ích
 */
export function calculatePixelArtBounds(rawJson) {
  const blockData = rawJson?.blockData || [];
  const W = Number(rawJson?.girdSizeX) || blockData.length || 10;
  const H = Number(rawJson?.girdSizeY) || 10;
  let minX = W, maxX = -1, minY = H, maxY = -1;

  for (let x = 0; x < blockData.length; x++) {
    const col = blockData[x]?.d || [];
    for (let y = 0; y < col.length; y++) {
      const cell = col[y];
      if (cell && cell.type !== -1 && cell.type !== undefined && cell.type !== null) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1) {
    return { minX: 0, maxX: W - 1, minY: 0, maxY: H - 1, width: W, height: H };
  }

  // Thêm padding 1 ô viền xung quanh để tranh vừa khít và đẹp mắt
  const pad = 1;
  const cropMinX = Math.max(0, minX - pad);
  const cropMaxX = Math.min(W - 1, maxX + pad);
  const cropMinY = Math.max(0, minY - pad);
  const cropMaxY = Math.min(H - 1, maxY + pad);

  return {
    minX: cropMinX,
    maxX: cropMaxX,
    minY: cropMinY,
    maxY: cropMaxY,
    width: cropMaxX - cropMinX + 1,
    height: cropMaxY - cropMinY + 1,
  };
}

export class PixelArtRenderer {
  /**
   * @param {HTMLCanvasElement} canvas - Thẻ canvas để vẽ
   * @param {HTMLElement} tooltipEl - Phần tử DOM hiển thị tooltip
   */
  constructor(canvas, tooltipEl) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tooltipEl = tooltipEl;
    this.currentLevelData = null;
    this.bounds = null;

    // Cài đặt hiển thị
    this.showGrid = true;
    this.cellSize = 20;

    // Hover state
    this.hoveredCell = null;

    this.initEvents();
  }

  initEvents() {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
  }

  /**
   * Cập nhật dữ liệu level và vẽ lại canvas.
   * @param {object} levelData - Dữ liệu level đã parse
   * @param {number} containerMaxWidth - Chiều rộng tối đa mong muốn (mặc định 500)
   * @param {number} containerMaxHeight - Chiều cao tối đa mong muốn (mặc định 500)
   */
  loadLevel(levelData, containerMaxWidth = 500, containerMaxHeight = 500) {
    this.currentLevelData = levelData;
    if (!levelData || levelData.isError || !levelData.rawJson?.blockData) {
      this.clear();
      return;
    }

    const { rawJson } = levelData;
    this.bounds = calculatePixelArtBounds(rawJson);
    const { width: cropW, height: cropH } = this.bounds;
    const maxDimension = Math.max(cropW, cropH, 1);
    
    // Tính kích thước mỗi ô (cellSize) sao cho vừa khung
    const targetSize = Math.min(containerMaxWidth, containerMaxHeight);
    this.cellSize = Math.max(8, Math.floor(targetSize / maxDimension));

    const width = cropW * this.cellSize;
    const height = cropH * this.cellSize;

    // Setup high DPI canvas
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    this.render();
  }

  /**
   * Chuyển đổi trạng thái hiển thị lưới ô vuông
   */
  toggleGrid() {
    this.showGrid = !this.showGrid;
    this.render();
    return this.showGrid;
  }

  /**
   * Xóa canvas
   */
  clear() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none';
    }
  }

  /**
   * Lấy kiểu màu nền phù hợp với Theme hiện tại (Dark / Light)
   */
  getThemeStyles() {
    const isLight = typeof document !== 'undefined' && document.documentElement
      ? document.documentElement.getAttribute('data-theme') === 'light'
      : false;

    if (isLight) {
      // Light mode: nền sáng
      return {
        baseBg: '#f8fafc',
        checkerA: '#f1f5f9',
        checkerB: '#e2e8f0',
        emptyBorder: 'rgba(0, 0, 0, 0.08)',
        gridColor: 'rgba(0, 0, 0, 0.15)',
      };
    }

    // Dark mode: nền ô trống TRẮNG để pixel art nổi bật, dễ đọc
    return {
      baseBg: '#ffffff',
      checkerA: '#ffffff',
      checkerB: '#f0f0f0',       // checker cực nhẹ để vẫn thấy grid
      emptyBorder: 'rgba(0, 0, 0, 0.12)',
      gridColor: 'rgba(0, 0, 0, 0.20)',
    };
  }

  /**
   * Thực hiện vẽ toàn bộ lưới pixel art theo vùng bao khít (Bounding Box)
   * @param {object} [levelData] - Tuỳ chọn truyền levelData để load và render ngay
   */
  render(levelData = null) {
    if (levelData) {
      this.loadLevel(levelData);
      return;
    }

    if (!this.currentLevelData || !this.currentLevelData.rawJson || !this.bounds) return;

    const { rawJson } = this.currentLevelData;
    const blockData = rawJson.blockData || [];
    const cs = this.cellSize;
    const { minX, maxX, minY, maxY, width: cropW, height: cropH } = this.bounds;

    const theme = this.getThemeStyles();

    // 1. Vẽ nền Canvas dạng caro tinh tế theo theme
    this.ctx.fillStyle = theme.baseBg;
    this.ctx.fillRect(0, 0, cropW * cs, cropH * cs);

    for (let cx = 0; cx < cropW; cx++) {
      for (let cy = 0; cy < cropH; cy++) {
        const isAlt = (cx + cy) % 2 === 1;
        this.ctx.fillStyle = isAlt ? theme.checkerA : theme.checkerB;
        this.ctx.fillRect(cx * cs, cy * cs, cs, cs);
      }
    }

    // 2. Vẽ từng ô trong blockData[x].d[y] (Y=0 ở đáy màn hình theo Unity)
    for (let x = minX; x <= maxX; x++) {
      const col = blockData[x];
      const colData = col && Array.isArray(col.d) ? col.d : [];

      for (let y = minY; y <= maxY; y++) {
        const cell = colData[y];
        const type = cell ? cell.type : -1;

        const drawX = x - minX;
        const drawY = maxY - y;
        const px = drawX * cs;
        const py = drawY * cs;

        if (type === -1 || type === undefined || type === null) {
          // Ô trống: hiển thị nền caro và kẻ viền lưới nhẹ nếu bật lưới
          if (this.showGrid) {
            this.ctx.strokeStyle = theme.emptyBorder;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(px + 0.5, py + 0.5, cs - 1, cs - 1);
          }
        } else {
          // Ô có màu
          const hexColor = getColor(type);
          this.ctx.fillStyle = hexColor;
          this.ctx.fillRect(px, py, cs, cs);

          // Nếu có lưới, kẻ viền nhẹ giữa các khối màu
          if (this.showGrid) {
            this.ctx.strokeStyle = theme.gridColor;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(px + 0.5, py + 0.5, cs - 1, cs - 1);
          }
        }
      }
    }

    // 3. Highlight ô đang hover nếu có
    if (this.hoveredCell) {
      const { drawX, drawY } = this.hoveredCell;
      if (drawX >= 0 && drawX < cropW && drawY >= 0 && drawY < cropH) {
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(drawX * cs + 1, drawY * cs + 1, cs - 2, cs - 2);

        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(drawX * cs, drawY * cs, cs, cs);
      }
    }
  }

  /**
   * Xử lý di chuột trên Canvas để hiển thị tooltip với tọa độ gốc chính xác
   */
  handleMouseMove(event) {
    if (!this.currentLevelData || !this.currentLevelData.rawJson || !this.bounds) return;

    const rect = this.canvas.getBoundingClientRect();
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;

    const drawX = Math.floor(clientX / this.cellSize);
    const drawY = Math.floor(clientY / this.cellSize);

    const { minX, minY, maxY, width: cropW, height: cropH } = this.bounds;
    const { rawJson } = this.currentLevelData;

    if (drawX >= 0 && drawX < cropW && drawY >= 0 && drawY < cropH) {
      const dataX = drawX + minX;
      const dataY = maxY - drawY;

      this.hoveredCell = { drawX, drawY, dataX, dataY };
      const blockData = rawJson.blockData || [];
      const col = blockData[dataX];
      const cell = col && col.d ? col.d[dataY] : null;
      const type = cell ? cell.type : -1;
      const hex = getColor(type);

      this.updateTooltip(event, dataX, dataY, type, hex);
      this.render();
      return;
    }

    this.handleMouseLeave();
  }

  handleMouseLeave() {
    this.hoveredCell = null;
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none';
    }
    this.render();
  }

  updateTooltip(event, x, y, type, hex) {
    if (!this.tooltipEl) return;

    let contentHtml = `
      <div class="tooltip-header">Tọa độ: <strong>(${x}, ${y})</strong></div>
      <div class="tooltip-row">
        <span>Type:</span> 
        <strong class="${type === -1 ? 'text-muted' : ''}">${type === -1 ? '-1 (Ô rỗng)' : `ID ${type}`}</strong>
      </div>
    `;

    if (type !== -1 && hex) {
      contentHtml += `
        <div class="tooltip-row">
          <span>Màu:</span>
          <div class="tooltip-color-swatch" style="background-color: ${hex};"></div>
          <code>${hex}</code>
        </div>
      `;
    }

    this.tooltipEl.innerHTML = contentHtml;
    this.tooltipEl.style.display = 'block';

    // Đặt vị trí tooltip theo con trỏ chuột
    const tooltipRect = this.tooltipEl.getBoundingClientRect();
    let top = event.clientY + 15;
    let left = event.clientX + 15;

    // Giữ tooltip trong viewport
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = event.clientX - tooltipRect.width - 15;
    }
    if (top + tooltipRect.height > window.innerHeight - 10) {
      top = event.clientY - tooltipRect.height - 15;
    }

    this.tooltipEl.style.top = `${top}px`;
    this.tooltipEl.style.left = `${left}px`;
  }

  /**
   * Tải hình ảnh hiện tại dưới dạng PNG
   */
  downloadImage(fileName = 'level_pixel_art.png') {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = fileName;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }
}
