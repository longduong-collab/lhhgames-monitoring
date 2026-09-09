/**
 * playtestEngine.js
 * Mô phỏng toàn bộ logic gameplay của game Pixel Ball:
 * 1. Hệ thống lưới Block & thuật toán loang BFS xác định các ô hở (State 2 - Exposed) từ viền ngoài.
 * 2. Hệ thống Shooter (Súng / Xe) theo cột: kiểm tra điều kiện thông đường để click (isReadyToClick).
 * 3. Khay chờ (Tray / Dock - 5 slots): xe vào khay sẽ bắn/thu gom các block cùng màu lộ ra ngoài.
 * 4. Kiểm tra điều kiện Thắng (Win - hết block) và Thua (Lose - 5 slot bị nghẽn không thể bắn tiếp).
 * 5. Hỗ trợ Undo, Reset, Điều chỉnh tốc độ, và Trình giải tự động (Auto-Solver).
 */

import { getColor } from './palette.js';

export class PlaytestEngine {
  constructor(gameData, options = {}) {
    this.gameData = gameData;
    this.maxTraySlots = options.maxTraySlots || 5;
    this.speedMulti = options.speedMulti || 1; // 1x, 2x, 5x

    this.onStateChange = options.onStateChange || (() => {});
    this.onBlockHit = options.onBlockHit || (() => {});
    this.onShooterFinish = options.onShooterFinish || (() => {});
    this.onGameOver = options.onGameOver || (() => {});

    this.initLevel();
  }

  /**
   * Khởi tạo trạng thái ban đầu của Level
   */
  initLevel() {
    this.isGameOver = false;
    this.isWin = false;
    this.isLose = false;
    this.isShootingInProgress = false;
    this.history = []; // Dùng cho Undo

    const raw = this.gameData.rawJson || this.gameData;
    this.width = Number(raw.girdSizeX) || 10;
    this.height = Number(raw.girdSizeY) || 10;

    // 1. Khởi tạo ma trận Block
    this.blocks = [];
    this.totalActiveBlocks = 0;

    const blockData = raw.blockData || [];
    for (let x = 0; x < this.width; x++) {
      this.blocks[x] = [];
      const colData = blockData[x]?.d || [];
      for (let y = 0; y < this.height; y++) {
        const cell = colData[y];
        const type = cell && cell.type !== undefined ? cell.type : -1;
        const isAlive = type !== -1;
        if (isAlive) this.totalActiveBlocks++;

        this.blocks[x][y] = {
          x,
          y,
          type,
          blockType: cell?.blockType || 0,
          isAlive,
          isExposed: false, // State 2 trong Unity HexGridController
        };
      }
    }

    this.initialBlocksCount = this.totalActiveBlocks;

    // 2. Khởi tạo danh sách Shooters
    this.shootersGrid = []; // [colIndex][rowIndex]
    this.allShooters = [];
    const shootersRaw = raw.shooters || [];

    for (let i = 0; i < shootersRaw.length; i++) {
      this.shootersGrid[i] = [];
      const colList = shootersRaw[i]?.list || [];
      for (let j = 0; j < colList.length; j++) {
        const sData = colList[j];
        if (sData.shooterType === 3 || sData.shot <= 0) {
          // Ô trống
          this.shootersGrid[i][j] = null;
          continue;
        }

        const shooter = {
          id: `s_${i}_${j}_${Math.random().toString(36).substr(2, 4)}`,
          col: i,
          row: j,
          type: sData.type,
          totalShots: sData.shot,
          remainingShots: sData.shot,
          shooterType: sData.shooterType || 0,
          mechanics: sData.mechanics || [],
          isReady: false, // Có thể bấm hay không
          inTray: false,
          trayIndex: -1,
          isFinished: false,
        };

        this.shootersGrid[i][j] = shooter;
        this.allShooters.push(shooter);
      }
    }

    // 3. Khởi tạo Khay chờ (Tray Slots)
    this.tray = new Array(this.maxTraySlots).fill(null);

    // 4. Tính toán trạng thái exposed ban đầu & cập nhật sẵn sàng bấm
    this.updateBlockExposedStates();
    this.updateShooterReadiness();
  }

  /**
   * Thuật toán loang BFS từ viền ngoài để xác định các block State 2 (Exposed)
   * Giống 100% logic HexGridController.cs trong Unity project
   */
  updateBlockExposedStates() {
    const W = this.width;
    const H = this.height;

    // visited ma trận
    const visited = Array.from({ length: W }, () => Array(H).fill(false));
    const queue = [];

    // Tìm tất cả các ô rỗng ở viền biên ngoài (x=0, x=W-1, y=0, y=H-1)
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        if (x === 0 || x === W - 1 || y === 0 || y === H - 1) {
          if (!this.blocks[x][y].isAlive) {
            queue.push({ x, y });
            visited[x][y] = true;
          }
        }
      }
    }

    // BFS 4 hướng liền kề
    const dx = [0, 0, 1, -1];
    const dy = [1, -1, 0, 0];

    // Reset exposed state
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        this.blocks[x][y].isExposed = false;
      }
    }

    let head = 0;
    while (head < queue.length) {
      const { x, y } = queue[head++];

      for (let d = 0; d < 4; d++) {
        const nx = x + dx[d];
        const ny = y + dy[d];

        if (nx >= 0 && nx < W && ny >= 0 && ny < H && !visited[nx][ny]) {
          const neighbor = this.blocks[nx][ny];

          if (!neighbor.isAlive) {
            // Ô rỗng tiếp tục loang
            visited[nx][ny] = true;
            queue.push({ x: nx, y: ny });
          } else {
            // Chạm vào ô có Block -> Ô này trở thành State 2 (Exposed) và dừng loang nhánh đó
            neighbor.isExposed = true;
            visited[nx][ny] = true;
          }
        }
      }
    }
  }

  /**
   * Cập nhật trạng thái unblocked/ready của các shooter theo thuật toán BFS Escape (Shooter.cs)
   * Một xe có thể bấm được nếu nó ở đầu cột (j=0) HOẶC có đường thoát 4 hướng qua các ô trống tới hàng đầu (y=0) của bất kỳ cột nào!
   */
  updateShooterReadiness() {
    const numCols = this.shootersGrid.length;

    for (let i = 0; i < numCols; i++) {
      const col = this.shootersGrid[i];
      for (let j = 0; j < col.length; j++) {
        const s = col[j];
        if (!s || s.inTray || s.isFinished) {
          continue;
        }

        const canEscape = this.checkShooterCanEscape(i, j);
        s.isReady = canEscape;
      }
    }
  }

  /**
   * Thuật toán BFS tìm đường thoát 4 hướng của Shooter đến hàng xuất phát (ny = 0)
   * Tương ứng 100% logic Shooter._checkReadyToClick trong Unity
   */
  checkShooterCanEscape(startX, startY) {
    if (startY === 0) {
      return true; // Ở ngay đầu cột -> luôn luôn sẵn sàng đi
    }

    const numCols = this.shootersGrid.length;
    const visited = Array.from({ length: numCols }, () => []);

    const queue = [{ x: startX, y: startY }];
    visited[startX][startY] = true;

    const dx = [-1, 1, 0, 0];
    const dy = [0, 0, -1, 1];

    while (queue.length > 0) {
      const { x, y } = queue.shift();

      for (let d = 0; d < 4; d++) {
        const nx = x + dx[d];
        const ny = y + dy[d];

        // Kiểm tra giới hạn ma trận shooters
        if (nx < 0 || nx >= numCols) continue;
        const colLen = this.shootersGrid[nx].length;
        if (ny < 0 || ny >= colLen) continue;

        if (visited[nx][ny]) continue;

        // Chỉ đi vào ô trống (xe đã rời bãi vào khay chờ hoặc đã bắn xong)
        const neighbor = this.shootersGrid[nx][ny];
        if (neighbor && !neighbor.inTray && !neighbor.isFinished) {
          continue; // Bị xe khác cản đường
        }

        // Nếu chạm tới đầu cột (hàng y = 0) của bất kỳ cột nào -> Có đường thoát!
        if (ny === 0) {
          return true;
        }

        visited[nx][ny] = true;
        queue.push({ x: nx, y: ny });
      }
    }

    return false;
  }

  /**
   * Lấy danh sách các block cùng màu đang lộ diện (Exposed)
   */
  getExposedBlocksOfType(colorType) {
    const list = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const b = this.blocks[x][y];
        if (b.isAlive && b.isExposed && b.type === colorType) {
          list.push(b);
        }
      }
    }
    return list;
  }

  /**
   * Người chơi click vào 1 Shooter:
   * Miễn là còn slot trong khay và xe có đường thoát (isReady), có thể click chọn ngay lập tức mà không cần chờ xe khác bắn xong!
   */
  clickShooter(shooter) {
    if (this.isGameOver) return { success: false, reason: 'game_over' };
    if (!shooter || !shooter.isReady || shooter.inTray || shooter.isFinished) {
      return { success: false, reason: 'not_ready' };
    }

    // Tìm slot trống trong khay (tối đa 5 slots)
    const freeSlotIndex = this.tray.findIndex((slot) => slot === null);
    if (freeSlotIndex === -1) {
      return { success: false, reason: 'tray_full' };
    }

    // Lưu snapshot vào history để có thể Undo
    this.saveHistorySnapshot();

    // Đưa xe vào khay chờ ngay lập tức
    shooter.inTray = true;
    shooter.trayIndex = freeSlotIndex;
    this.tray[freeSlotIndex] = shooter;

    // Cập nhật ngay đường thoát cho các xe khác phía sau trên bãi đỗ
    this.updateShooterReadiness();
    this.onStateChange();

    // Kích hoạt xử lý bắn bất đồng bộ (chạy độc lập, song song với các xe khác trong khay)
    shooter.shootingPromise = this.processShooterWave(shooter);

    return { success: true, shootingPromise: shooter.shootingPromise };
  }

  async waitUntilIdle() {
    while (this.tray.some((s) => s && s.inTray && !s.isFinished && s.remainingShots > 0 && this.getExposedBlocksOfType(s.type).length > 0)) {
      await this.delay(20);
    }
  }

  /**
   * Thực hiện quá trình bắn/thu gom block của Shooter trong khay
   */
  async processShooterWave(shooter) {
    if (!shooter || !shooter.inTray || shooter.isFinished || shooter.remainingShots <= 0 || shooter.isProcessing) return;

    shooter.isProcessing = true;

    while (shooter.inTray && !shooter.isFinished && shooter.remainingShots > 0 && !this.isGameOver) {
      const targets = this.getExposedBlocksOfType(shooter.type);
      if (targets.length === 0) {
        shooter.isShooting = false;
        break; // Không còn block mục tiêu lộ ra, dừng bắn và chờ ở khay
      }

      shooter.isShooting = true;

      // Bắn từng block mục tiêu
      for (const target of targets) {
        if (!target.isAlive || shooter.remainingShots <= 0 || !shooter.inTray || this.isGameOver) break;

        // Xóa block
        target.isAlive = false;
        target.isExposed = false;
        shooter.remainingShots--;
        this.totalActiveBlocks--;

        // Báo event cho view vẽ đạn bay
        this.onBlockHit(shooter, target);

        // Cập nhật lại BFS loang
        this.updateBlockExposedStates();
        this.onStateChange();

        // Đánh thức các xe khác trong khay đang chờ cùng bắn song song
        this.wakeUpOtherTrayShooters(shooter);

        // Delay theo tốc độ
        await this.delay(70 / this.speedMulti);
      }
    }

    shooter.isShooting = false;
    shooter.isProcessing = false;

    // Kiểm tra nếu xe đã bắn hết số lượng shot
    if (shooter.remainingShots <= 0) {
      shooter.isFinished = true;
      shooter.inTray = false;
      if (shooter.trayIndex !== -1) {
        this.tray[shooter.trayIndex] = null;
        shooter.trayIndex = -1;
      }
      this.updateShooterReadiness();
      this.onShooterFinish(shooter);
      this.onStateChange();

      // Khi 1 xe rời đi, các xe còn lại trong khay kiểm tra bắn tiếp
      this.checkAllTrayShooters();
    }

    // Kiểm tra Win / Lose
    this.checkWinLose();
  }

  /**
   * Đánh thức các xe khác đang nằm trong khay nếu có block cùng màu mới lộ diện
   */
  wakeUpOtherTrayShooters(currentShooter) {
    for (const s of this.tray) {
      if (s && s !== currentShooter && s.inTray && !s.isFinished && !s.isProcessing && s.remainingShots > 0) {
        const available = this.getExposedBlocksOfType(s.type);
        if (available.length > 0) {
          this.processShooterWave(s);
        }
      }
    }
  }

  /**
   * Kiểm tra tất cả các xe đang đợi trong khay xem có xe nào bắn tiếp được không
   */
  checkAllTrayShooters() {
    for (const s of this.tray) {
      if (s && s.inTray && !s.isFinished && !s.isProcessing && s.remainingShots > 0) {
        const available = this.getExposedBlocksOfType(s.type);
        if (available.length > 0) {
          this.processShooterWave(s);
        }
      }
    }
  }

  /**
   * Kiểm tra điều kiện Thắng / Thua
   */
  checkWinLose() {
    if (this.totalActiveBlocks <= 0) {
      this.isGameOver = true;
      this.isWin = true;
      this.onGameOver({ isWin: true });
      return;
    }

    // Kiểm tra thua: Khay đầy 5 slot VÀ không có xe nào trong khay có thể bắn được bất kỳ block hở nào
    const isTrayFull = this.tray.every((slot) => slot !== null);
    if (isTrayFull) {
      let anyCanShoot = false;
      for (const s of this.tray) {
        if (s && this.getExposedBlocksOfType(s.type).length > 0) {
          anyCanShoot = true;
          break;
        }
      }

      if (!anyCanShoot) {
        this.isGameOver = true;
        this.isLose = true;
        this.onGameOver({ isWin: false, reason: 'deadlock' });
      }
    }
  }

  /**
   * Lưu snapshot cho tính năng Undo
   */
  saveHistorySnapshot() {
    const snapshot = {
      blocks: this.blocks.map((col) => col.map((b) => ({ ...b }))),
      shooters: this.allShooters.map((s) => ({ ...s })),
      tray: [...this.tray.map((s) => (s ? s.id : null))],
      totalActiveBlocks: this.totalActiveBlocks,
    };
    this.history.push(snapshot);
  }

  /**
   * Quay lại bước trước (Undo)
   */
  undo() {
    if (this.history.length === 0 || this.isGameOver) return false;

    const prev = this.history.pop();
    this.totalActiveBlocks = prev.totalActiveBlocks;
    this.isGameOver = false;
    this.isWin = false;
    this.isLose = false;

    // Khôi phục blocks
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        Object.assign(this.blocks[x][y], prev.blocks[x][y]);
      }
    }

    // Khôi phục shooters
    const shooterMap = new Map();
    this.allShooters.forEach((s, idx) => {
      Object.assign(s, prev.shooters[idx]);
      shooterMap.set(s.id, s);
    });

    // Khôi phục khay
    this.tray = prev.tray.map((id) => (id ? shooterMap.get(id) : null));

    this.updateBlockExposedStates();
    this.updateShooterReadiness();
    this.onStateChange();

    return true;
  }

  /**
   * Tự động giải thông minh (Auto-Solve / Playtest AI)
   * Tìm nước đi hợp lệ tốt nhất đưa vào khay
   */
  async autoStep() {
    if (this.isGameOver) return false;

    // 1. Ưu tiên xe đang có màu khớp với ô đang Exposed nhiều nhất
    const readyShooters = this.allShooters.filter((s) => s.isReady && !s.inTray && !s.isFinished);
    if (readyShooters.length === 0) return false;

    // Sắp xếp các xe theo độ ưu tiên: xe nào bắn được nhiều block exposed nhất trước
    readyShooters.sort((a, b) => {
      const aMatches = this.getExposedBlocksOfType(a.type).length;
      const bMatches = this.getExposedBlocksOfType(b.type).length;
      return bMatches - aMatches;
    });

    const chosen = readyShooters[0];
    const res = this.clickShooter(chosen);
    if (res.shootingPromise) {
      await res.shootingPromise;
    }
    return res.success;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
