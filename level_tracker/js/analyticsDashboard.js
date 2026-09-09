/**
 * analyticsDashboard.js
 * Quản lý giao diện Analytics Dashboard:
 * 1. KPI Summary Cards
 * 2. Chart.js Trend Visualizations (Fail Rate Line, Volume Bar, Scatter Correlation, Mechanic Difficulty Heatmap)
 * 3. Sortable & Filterable Analytics Data Table
 * 4. Cross-Analysis: Join Level Design metrics với Analytics KPIs & Pearson Correlation
 */

export class AnalyticsDashboard {
  constructor(containerEl, callbacks = {}) {
    this.container = containerEl;
    this.callbacks = callbacks; // { onJumpToLevel: (lvl) => {} }
    this.analyticsData = [];
    this.parsedLevels = [];
    this.activeView = 'overview'; // 'overview' | 'charts' | 'table' | 'cross'
    this.charts = {}; // Lưu Chart.js instances để destroy khi re-render
    this.tableSortKey = 'level';
    this.tableSortDir = 'asc';
    this.tableSearchTerm = '';
    this.failRateThreshold = 0.35; // 35%
    this.scatterMetricX = 'complexity_score';
    this.scatterMetricY = 'fail_rate';
    this.maWindow = 10; // Moving Average window

    this.initSkeleton();
  }

  initSkeleton() {
    this.container.innerHTML = `
      <div class="analytics-dashboard-wrapper">
        <!-- Sub-Navigation Bar -->
        <div class="analytics-subnav">
          <div class="subnav-tabs">
            <button class="subnav-btn active" data-view="overview">📊 Tổng quan & KPI</button>
            <button class="subnav-btn" data-view="charts">📈 Biểu đồ Xu hướng</button>
            <button class="subnav-btn" data-view="cross">🧬 Phân tích Chéo (Design × BI)</button>
            <button class="subnav-btn" data-view="table">📋 Bảng Dữ liệu Chi tiết</button>
          </div>
          <div class="subnav-actions">
            <span id="analyticsDataBadge" class="badge-info">Chưa nạp data</span>
            <button id="btnLoadSampleAnalytics" class="btn btn-sm btn-sample" title="Nạp mẫu analytics">
              📁 Nạp dữ liệu mẫu
            </button>
          </div>
        </div>

        <!-- View 1: KPI Overview -->
        <div id="analyticsOverviewView" class="analytics-view-pane active">
          <div class="kpi-grid" id="analyticsKpiGrid"></div>
          
          <div class="dashboard-charts-grid">
            <div class="chart-card">
              <div class="chart-card-header">
                <h3>📈 Tỉ lệ Thất bại theo Level (Fail Rate Trend)</h3>
                <div class="chart-controls">
                  <span class="ctrl-label-sm">MA:</span>
                  <select id="selMaWindow" class="form-control form-control-sm" style="width: 80px;">
                    <option value="5">MA 5</option>
                    <option value="10" selected>MA 10</option>
                    <option value="20">MA 20</option>
                  </select>
                </div>
              </div>
              <div class="chart-canvas-wrapper" style="height: 320px;">
                <canvas id="chartFailRateOverview"></canvas>
              </div>
            </div>

            <div class="chart-card">
              <div class="chart-card-header">
                <h3>👥 Lượng người chơi & Phân bố độ khó (Attempts Volume)</h3>
              </div>
              <div class="chart-canvas-wrapper" style="height: 320px;">
                <canvas id="chartVolumeOverview"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- View 2: Deep Dive Charts -->
        <div id="analyticsChartsView" class="analytics-view-pane">
          <div class="dashboard-charts-grid">
            <div class="chart-card">
              <div class="chart-card-header">
                <h3>🔍 Phân tán Tương quan (Scatter Correlation)</h3>
                <div class="chart-controls">
                  <span class="ctrl-label-sm">Trục X:</span>
                  <select id="selScatterX" class="form-control form-control-sm" style="width: 140px;"></select>
                  <span class="ctrl-label-sm">Trục Y:</span>
                  <select id="selScatterY" class="form-control form-control-sm" style="width: 140px;"></select>
                </div>
              </div>
              <div class="chart-canvas-wrapper" style="height: 380px;">
                <canvas id="chartScatterCorrelation"></canvas>
              </div>
            </div>

            <div class="chart-card">
              <div class="chart-card-header">
                <h3>🧩 Mechanic vs Tỉ lệ Thất bại (Mechanic Difficulty Impact)</h3>
              </div>
              <div class="chart-canvas-wrapper" style="height: 380px;">
                <canvas id="chartMechanicHeatmap"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- View 3: Cross Analysis -->
        <div id="analyticsCrossView" class="analytics-view-pane">
          <div id="crossAnalysisContainer"></div>
        </div>

        <!-- View 4: Data Table -->
        <div id="analyticsTableView" class="analytics-view-pane">
          <div class="analytics-table-toolbar">
            <input type="text" id="analyticsTableSearch" class="form-control" placeholder="🔍 Tìm kiếm Level..." style="max-width: 260px;" />
            <div class="toolbar-stats" id="analyticsTableStats"></div>
          </div>
          <div id="analyticsTableContainer" class="table-wrapper"></div>
        </div>

        <!-- Inline Level Preview Modal -->
        <div id="analyticsLevelPreview" class="analytics-level-preview">
          <div class="alp-backdrop"></div>
          <div class="alp-panel">
            <div class="alp-header">
              <h3 id="alpTitle">🔍 Preview Level</h3>
              <button class="alp-close-btn" id="alpCloseBtn">&times;</button>
            </div>
            <div class="alp-body">
              <div class="alp-canvas-pane">
                <canvas id="alpCanvas" width="280" height="280"></canvas>
                <div id="alpNoDataNotice" class="alp-no-data" style="display: none;">
                  ⚠️ Chưa nạp file JSON của Level này.<br/>Hãy nạp file LevelData trong tab Level Explorer.
                </div>
              </div>
              <div class="alp-stats-pane">
                <h4>📊 Chỉ số Analytics</h4>
                <div class="alp-stats-grid" id="alpStatsGrid"></div>
                <div class="alp-meta-grid" id="alpMetaGrid"></div>
              </div>
            </div>
            <div class="alp-footer">
              <button id="alpBtnJump" class="btn btn-primary">🚀 Mở trong Level Explorer</button>
              <button id="alpBtnClose" class="btn btn-secondary">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const alpCloseBtn = this.container.querySelector('#alpCloseBtn');
    const alpBtnClose = this.container.querySelector('#alpBtnClose');
    const alpBackdrop = this.container.querySelector('.alp-backdrop');
    const closeAlp = () => this.closePreview();
    if (alpCloseBtn) alpCloseBtn.addEventListener('click', closeAlp);
    if (alpBtnClose) alpBtnClose.addEventListener('click', closeAlp);
    if (alpBackdrop) alpBackdrop.addEventListener('click', closeAlp);
    const tabs = this.container.querySelectorAll('.subnav-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeView = tab.getAttribute('data-view');
        this.switchView(this.activeView);
      });
    });

    const selMa = this.container.querySelector('#selMaWindow');
    if (selMa) {
      selMa.addEventListener('change', (e) => {
        this.maWindow = parseInt(e.target.value, 10) || 10;
        this.renderFailRateChart();
      });
    }

    const selScatterX = this.container.querySelector('#selScatterX');
    const selScatterY = this.container.querySelector('#selScatterY');
    if (selScatterX && selScatterY) {
      selScatterX.addEventListener('change', (e) => {
        this.scatterMetricX = e.target.value;
        this.renderScatterChart();
      });
      selScatterY.addEventListener('change', (e) => {
        this.scatterMetricY = e.target.value;
        this.renderScatterChart();
      });
    }

    const searchInp = this.container.querySelector('#analyticsTableSearch');
    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        this.tableSearchTerm = e.target.value.trim().toLowerCase();
        this.renderDataTable();
      });
    }
  }

  switchView(viewName) {
    const panes = {
      overview: this.container.querySelector('#analyticsOverviewView'),
      charts: this.container.querySelector('#analyticsChartsView'),
      cross: this.container.querySelector('#analyticsCrossView'),
      table: this.container.querySelector('#analyticsTableView'),
    };

    Object.keys(panes).forEach((k) => {
      if (panes[k]) {
        if (k === viewName) panes[k].classList.add('active');
        else panes[k].classList.remove('active');
      }
    });

    // Re-render / update views when switched
    if (viewName === 'overview') {
      this.renderFailRateChart();
      this.renderVolumeChart();
    } else if (viewName === 'charts') {
      this.populateScatterDropdowns();
      this.renderScatterChart();
      this.renderMechanicDifficultyChart();
    } else if (viewName === 'cross') {
      this.renderCrossAnalysis();
    } else if (viewName === 'table') {
      this.renderDataTable();
    }
  }

  /**
   * Cung cấp toàn bộ dữ liệu để render
   */
  render(analyticsData = null, parsedLevels = null) {
    if (analyticsData !== null) this.analyticsData = analyticsData;
    if (parsedLevels !== null) this.parsedLevels = parsedLevels;

    const badgeEl = this.container.querySelector('#analyticsDataBadge');
    if (badgeEl) {
      badgeEl.textContent = this.analyticsData.length > 0
        ? `Đã nạp ${this.analyticsData.length} levels metrics`
        : 'Chưa nạp data';
      badgeEl.className = this.analyticsData.length > 0 ? 'badge-info success' : 'badge-info';
    }

    if (this.analyticsData.length === 0) {
      const kpiGrid = this.container.querySelector('#analyticsKpiGrid');
      if (kpiGrid) {
        kpiGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1; padding: 3rem;">
            <div class="empty-icon">📊</div>
            <h3>Chưa có dữ liệu Analytics</h3>
            <p>Kéo & thả file JSON Analytics (hoặc nhấn "Nạp dữ liệu mẫu") để bắt đầu phân tích.</p>
          </div>
        `;
      }
      return;
    }

    this.renderKpiCards();
    this.switchView(this.activeView);
  }

  /**
   * View 1: Render KPI Cards
   */
  renderKpiCards() {
    const kpiGrid = this.container.querySelector('#analyticsKpiGrid');
    if (!kpiGrid || this.analyticsData.length === 0) return;

    const totalLevels = this.analyticsData.length;
    const avgFailRate = this.analyticsData.reduce((s, r) => s + (r.fail_rate || 0), 0) / totalLevels;
    const avgWinRate = this.analyticsData.reduce((s, r) => s + (r.win_rate || 0), 0) / totalLevels;
    const avgAdRate = this.analyticsData.reduce((s, r) => s + (r.ad_rate || 0), 0) / totalLevels;
    const totalAttempts = this.analyticsData.reduce((s, r) => s + (r.attempts || 0), 0);

    // Choke points: levels with fail_rate > threshold (e.g. 35%)
    const chokeLevels = this.analyticsData.filter((r) => r.fail_rate >= this.failRateThreshold);

    // Anomaly detection: mean & standard deviation (2 sigma)
    const stdDev = Math.sqrt(
      this.analyticsData.reduce((s, r) => s + Math.pow(r.fail_rate - avgFailRate, 2), 0) / totalLevels
    );
    const anomalies = this.analyticsData.filter((r) => Math.abs(r.fail_rate - avgFailRate) >= 2 * stdDev);

    kpiGrid.innerHTML = `
      <div class="kpi-card q2-border">
        <div class="kpi-title">Tổng số Level Analytics</div>
        <div class="kpi-value">${totalLevels}</div>
        <div class="kpi-desc">Tổng ${totalAttempts.toLocaleString()} lượt chơi ghi nhận</div>
      </div>

      <div class="kpi-card ${avgFailRate > 0.3 ? 'q4-border' : 'q1-border'}">
        <div class="kpi-title">Tỉ lệ Thất bại TB (Avg Fail)</div>
        <div class="kpi-value ${avgFailRate > 0.3 ? 'text-danger' : 'text-success'}">
          ${(avgFailRate * 100).toFixed(1)}%
        </div>
        <div class="kpi-desc">Win Rate TB: ${(avgWinRate * 100).toFixed(1)}%</div>
      </div>

      <div class="kpi-card q3-border">
        <div class="kpi-title">Điểm nghẽn (Choke Points &gt; ${(this.failRateThreshold * 100).toFixed(0)}%)</div>
        <div class="kpi-value text-warning">${chokeLevels.length}</div>
        <div class="kpi-desc">Cần tinh chỉnh độ khó balance</div>
      </div>

      <div class="kpi-card q1-border">
        <div class="kpi-title">Điểm bất thường (Outliers &gt; 2σ)</div>
        <div class="kpi-value">${anomalies.length}</div>
        <div class="kpi-desc">Độ lệch chuẩn σ = ${(stdDev * 100).toFixed(1)}%</div>
      </div>
    `;
  }

  /**
   * Helper: Destroy existing Chart.js instance before recreating
   */
  safeDestroyChart(key) {
    if (this.charts[key]) {
      this.charts[key].destroy();
      this.charts[key] = null;
    }
  }

  /**
   * Chart A: Fail Rate Line Chart (with Moving Average & Anomalies)
   */
  renderFailRateChart() {
    const canvas = this.container.querySelector('#chartFailRateOverview');
    if (!canvas || this.analyticsData.length === 0 || typeof Chart === 'undefined') return;

    this.safeDestroyChart('failRate');

    const labels = this.analyticsData.map((d) => d.levelLabel || `Lvl ${d.level}`);
    const rawFailRates = this.analyticsData.map((d) => Number((d.fail_rate * 100).toFixed(1)));

    // Calculate Moving Average
    const maData = [];
    for (let i = 0; i < rawFailRates.length; i++) {
      const start = Math.max(0, i - this.maWindow + 1);
      const subset = rawFailRates.slice(start, i + 1);
      const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
      maData.push(Number(avg.toFixed(1)));
    }

    const mean = rawFailRates.reduce((a, b) => a + b, 0) / rawFailRates.length;
    const std = Math.sqrt(rawFailRates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rawFailRates.length);

    // Color points: highlight > 2 sigma
    const pointColors = rawFailRates.map((val) => {
      if (Math.abs(val - mean) >= 2 * std) return '#ef4444'; // Anomaly red
      if (val >= this.failRateThreshold * 100) return '#f59e0b'; // Warning yellow
      return '#3b82f6';
    });

    const pointRadius = rawFailRates.map((val) => (Math.abs(val - mean) >= 2 * std ? 6 : 3));

    const ctx = canvas.getContext('2d');
    this.charts.failRate = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Fail Rate (%)',
            data: rawFailRates,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: pointColors,
            pointRadius,
            fill: true,
            tension: 0.15,
          },
          {
            label: `Moving Average (MA ${this.maWindow})`,
            data: maData,
            borderColor: '#ec4899',
            borderWidth: 2.5,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
          {
            label: `Ngưỡng cảnh báo (${(this.failRateThreshold * 100).toFixed(0)}%)`,
            data: new Array(labels.length).fill(this.failRateThreshold * 100),
            borderColor: 'rgba(239, 68, 68, 0.6)',
            borderWidth: 1.5,
            borderDash: [3, 3],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (e, activeEls) => {
          if (activeEls && activeEls.length > 0) {
            const index = activeEls[0].index;
            const item = this.analyticsData[index];
            if (item && this.callbacks.onJumpToLevel) {
              this.callbacks.onJumpToLevel(item.level);
            }
          }
        },
        plugins: {
          legend: {
            labels: { color: '#94a3b8' },
          },
          tooltip: {
            callbacks: {
              afterBody: (context) => {
                const idx = context[0].dataIndex;
                const item = this.analyticsData[idx];
                return item ? `Attempts: ${item.attempts.toLocaleString()} | Completions: ${item.completions.toLocaleString()}` : '';
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#64748b', maxTicksLimit: 25 },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
          },
          y: {
            min: 0,
            ticks: { color: '#64748b', callback: (v) => v + '%' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
          },
        },
      },
    });
  }

  /**
   * Chart B: Volume Distribution Bar Chart
   */
  renderVolumeChart() {
    const canvas = this.container.querySelector('#chartVolumeOverview');
    if (!canvas || this.analyticsData.length === 0 || typeof Chart === 'undefined') return;

    this.safeDestroyChart('volume');

    const labels = this.analyticsData.map((d) => d.levelLabel || `Lvl ${d.level}`);
    const attempts = this.analyticsData.map((d) => d.attempts);

    const bgColors = this.analyticsData.map((d) => {
      if (d.fail_rate >= 0.4) return 'rgba(239, 68, 68, 0.7)'; // Hard
      if (d.fail_rate >= 0.25) return 'rgba(245, 158, 11, 0.7)'; // Medium
      return 'rgba(16, 185, 129, 0.7)'; // Easy
    });

    const ctx = canvas.getContext('2d');
    this.charts.volume = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Số lượt chơi (Attempts)',
            data: attempts,
            backgroundColor: bgColors,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8' } },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => {
                const item = this.analyticsData[ctx.dataIndex];
                return `Fail Rate: ${(item.fail_rate * 100).toFixed(1)}%`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#64748b', maxTicksLimit: 25 },
            grid: { display: false },
          },
          y: {
            ticks: { color: '#64748b' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
          },
        },
      },
    });
  }

  /**
   * Populate Scatter Dropdowns with numeric options
   */
  populateScatterDropdowns() {
    const selX = this.container.querySelector('#selScatterX');
    const selY = this.container.querySelector('#selScatterY');
    if (!selX || !selY) return;

    const metrics = [
      { key: 'complexity_score', label: 'Complexity Score' },
      { key: 'fail_rate', label: 'Fail Rate (%)' },
      { key: 'win_rate', label: 'Win Rate (%)' },
      { key: 'ad_rate', label: 'Ad Rate / Shows' },
      { key: 'attempts', label: 'Lượt chơi (Attempts)' },
      { key: 'session_duration_avg', label: 'Thời lượng (Avg Seconds)' },
      { key: 'fill_ratio_pct', label: 'Fill Ratio (%)' },
      { key: 'unique_types_used', label: 'Unique Types' },
      { key: 'active_blocks', label: 'Active Blocks' },
      { key: 'total_slots', label: 'Total Slots' },
    ];

    const generateOptions = (selected) =>
      metrics.map((m) => `<option value="${m.key}" ${m.key === selected ? 'selected' : ''}>${m.label}</option>`).join('');

    selX.innerHTML = generateOptions(this.scatterMetricX);
    selY.innerHTML = generateOptions(this.scatterMetricY);
  }

  /**
   * Chart C: Scatter Correlation
   */
  renderScatterChart() {
    const canvas = this.container.querySelector('#chartScatterCorrelation');
    if (!canvas || this.analyticsData.length === 0 || typeof Chart === 'undefined') return;

    this.safeDestroyChart('scatter');

    const joinedData = this.getJoinedData();
    const pointsEarly = [];
    const pointsMid = [];
    const pointsLate = [];

    joinedData.forEach((row) => {
      let xVal = row[this.scatterMetricX];
      let yVal = row[this.scatterMetricY];

      if (this.scatterMetricX.includes('rate')) xVal = Number((xVal * 100).toFixed(1));
      if (this.scatterMetricY.includes('rate')) yVal = Number((yVal * 100).toFixed(1));

      if (xVal === undefined || yVal === undefined || isNaN(xVal) || isNaN(yVal)) return;

      const pt = { x: Number(xVal), y: Number(yVal), level: row.level };

      if (row.level <= 30) pointsEarly.push(pt);
      else if (row.level <= 100) pointsMid.push(pt);
      else pointsLate.push(pt);
    });

    const ctx = canvas.getContext('2d');
    this.charts.scatter = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Early Game (Lvl 1-30)',
            data: pointsEarly,
            backgroundColor: '#10b981',
            pointRadius: 5,
          },
          {
            label: 'Mid Game (Lvl 31-100)',
            data: pointsMid,
            backgroundColor: '#3b82f6',
            pointRadius: 5,
          },
          {
            label: 'Late Game (Lvl >100)',
            data: pointsLate,
            backgroundColor: '#8b5cf6',
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8' } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pt = ctx.raw;
                return `Level ${pt.level}: X=${pt.x}, Y=${pt.y}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: this.scatterMetricX, color: '#94a3b8' },
            ticks: { color: '#64748b' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
          },
          y: {
            title: { display: true, text: this.scatterMetricY, color: '#94a3b8' },
            ticks: { color: '#64748b' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
          },
        },
      },
    });
  }

  /**
   * Chart D: Mechanic Difficulty Heatmap / Bar
   */
  renderMechanicDifficultyChart() {
    const canvas = this.container.querySelector('#chartMechanicHeatmap');
    if (!canvas || this.analyticsData.length === 0 || typeof Chart === 'undefined') return;

    this.safeDestroyChart('mechanicImpact');

    const joined = this.getJoinedData();

    // Group levels by presence of special mechanics vs average fail rate
    const groups = [
      { label: 'Normal Only', filter: (l) => !l.has_special_mechanics },
      { label: 'BlockBig (1-4)', filter: (l) => l.has_blockType_1 },
      { label: 'BlockShooter (7)', filter: (l) => l.has_blockType_7 },
      { label: 'ShooterPipe (4)', filter: (l) => l.has_pipe_shooter },
      { label: 'BlockKey (5)', filter: (l) => l.has_blockType_5 },
      { label: 'BlockBomb (9)', filter: (l) => l.has_blockType_9 },
      { label: 'BlockUnknown (6)', filter: (l) => l.has_blockType_6 },
    ];

    const labels = [];
    const avgFailRates = [];
    const counts = [];

    groups.forEach((g) => {
      const match = joined.filter((l) => g.filter(l));
      if (match.length > 0) {
        labels.push(g.label);
        const avg = match.reduce((s, r) => s + (r.fail_rate || 0), 0) / match.length;
        avgFailRates.push(Number((avg * 100).toFixed(1)));
        counts.push(match.length);
      }
    });

    const ctx = canvas.getContext('2d');
    this.charts.mechanicImpact = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Tỉ lệ thất bại TB (%)',
            data: avgFailRates,
            backgroundColor: avgFailRates.map((r) => (r > 35 ? '#ef4444' : (r > 20 ? '#f59e0b' : '#3b82f6'))),
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => `Số lượng Level: ${counts[ctx.dataIndex]}`,
            },
          },
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
          y: {
            ticks: { color: '#64748b', callback: (v) => v + '%' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
          },
        },
      },
    });
  }

  /**
   * Helper: Join Level Design data with Analytics data by level number
   */
  getJoinedData() {
    const mapDesign = new Map();
    this.parsedLevels.forEach((l) => {
      if (!l.isError && typeof l.level === 'number') {
        mapDesign.set(l.level, l);
      }
    });

    const joined = [];
    this.analyticsData.forEach((a) => {
      if (a.isGroup && typeof a.minLevel === 'number' && typeof a.maxLevel === 'number') {
        let matchedAny = false;
        for (let lvl = a.minLevel; lvl <= a.maxLevel; lvl++) {
          if (mapDesign.has(lvl)) {
            matchedAny = true;
            joined.push({
              ...mapDesign.get(lvl),
              ...a,
              level: lvl,
              groupLabel: a.levelLabel || `Group ${a.minLevel}-${a.maxLevel}`,
            });
          }
        }
        if (!matchedAny) {
          const d = mapDesign.get(a.level) || {};
          joined.push({ ...d, ...a });
        }
      } else {
        const d = mapDesign.get(a.level) || {};
        joined.push({
          ...d,
          ...a,
        });
      }
    });

    return joined;
  }

  /**
   * View 3: Render Cross-Analysis View
   */
  renderCrossAnalysis() {
    const container = this.container.querySelector('#crossAnalysisContainer');
    if (!container) return;

    const joined = this.getJoinedData().filter((r) => r.active_blocks !== undefined);

    if (joined.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 3rem;">
          <div class="empty-icon">🧬</div>
          <h3>Chưa đủ dữ liệu Phân tích Chéo</h3>
          <p>Cần có cả dữ liệu Level Design (từ LevelData JSON) và Analytics JSON để thực hiện đối soát chéo.</p>
        </div>
      `;
      return;
    }

    // Calculate Pearson Correlation Coefficients
    const calcCorrelation = (keyX, keyY) => {
      const pairs = joined
        .map((r) => ({ x: Number(r[keyX]), y: Number(r[keyY]) }))
        .filter((p) => !isNaN(p.x) && !isNaN(p.y));
      if (pairs.length < 2) return 0;

      const n = pairs.length;
      const sumX = pairs.reduce((s, p) => s + p.x, 0);
      const sumY = pairs.reduce((s, p) => s + p.y, 0);
      const sumXY = pairs.reduce((s, p) => s + p.x * p.y, 0);
      const sumX2 = pairs.reduce((s, p) => s + p.x * p.x, 0);
      const sumY2 = pairs.reduce((s, p) => s + p.y * p.y, 0);

      const num = n * sumXY - sumX * sumY;
      const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      return den === 0 ? 0 : Number((num / den).toFixed(3));
    };

    const corrComplexityFail = calcCorrelation('complexity_score', 'fail_rate');
    const corrFillFail = calcCorrelation('fill_ratio_pct', 'fail_rate');
    const corrTypesFail = calcCorrelation('unique_types_used', 'fail_rate');
    const corrSlotsFail = calcCorrelation('total_slots', 'fail_rate');

    let html = `
      <div class="cross-analysis-wrapper">
        <div class="cross-header-card">
          <h3>🧬 Hệ số tương quan Pearson (Correlation Matrix)</h3>
          <p class="desc">Đánh giá mức độ ảnh hưởng của thuộc tính Level Design lên tỉ lệ thất bại (Fail Rate)</p>
          
          <div class="corr-cards-grid">
            <div class="corr-card">
              <span class="corr-title">Complexity vs Fail Rate</span>
              <span class="corr-value ${corrComplexityFail > 0.3 ? 'pos' : ''}">${corrComplexityFail > 0 ? '+' : ''}${corrComplexityFail}</span>
              <span class="corr-desc">${corrComplexityFail > 0.3 ? 'Tương quan thuận mạnh' : 'Tương quan trung bình'}</span>
            </div>
            <div class="corr-card">
              <span class="corr-title">Fill Ratio % vs Fail Rate</span>
              <span class="corr-value">${corrFillFail > 0 ? '+' : ''}${corrFillFail}</span>
              <span class="corr-desc">Mật độ block trên map</span>
            </div>
            <div class="corr-card">
              <span class="corr-title">Unique Types vs Fail Rate</span>
              <span class="corr-value">${corrTypesFail > 0 ? '+' : ''}${corrTypesFail}</span>
              <span class="corr-desc">Số màu sắc xuất hiện</span>
            </div>
            <div class="corr-card">
              <span class="corr-title">Total Slots vs Fail Rate</span>
              <span class="corr-value">${corrSlotsFail > 0 ? '+' : ''}${corrSlotsFail}</span>
              <span class="corr-desc">Số slot súng bố trí</span>
            </div>
          </div>
        </div>

        <div class="cross-table-card">
          <div class="cross-table-header">
            <h4>Bảng Đối soát Chi tiết: Level Design × Game BI (${joined.length} levels khớp)</h4>
          </div>
          <div class="table-wrapper">
            <table class="level-table">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Complexity</th>
                  <th>Fill Ratio</th>
                  <th>Unique Types</th>
                  <th>Active Blocks</th>
                  <th>Shooters</th>
                  <th>Fail Rate</th>
                  <th>Win Rate</th>
                  <th>Ad Rate</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
    `;

    joined.slice(0, 100).forEach((row) => {
      const failPct = (row.fail_rate * 100).toFixed(1);
      const isHighFail = row.fail_rate >= 0.35;
      const displayLevel = row.groupLabel ? `${row.level} (${row.groupLabel})` : row.level;
      html += `
        <tr class="${isHighFail ? 'row-alert-error' : ''}">
          <td><strong>${displayLevel}</strong></td>
          <td><span class="badge-complexity">${row.complexity_score ?? '-'}</span></td>
          <td>${row.fill_ratio_pct ?? '-'}%</td>
          <td>${row.unique_types_used ?? '-'}</td>
          <td>${row.active_blocks ?? '-'}</td>
          <td>${row.num_shooters ?? '-'}</td>
          <td class="${isHighFail ? 'text-danger font-bold' : ''}">${failPct}%</td>
          <td>${(row.win_rate * 100).toFixed(1)}%</td>
          <td>${row.ad_rate ? (row.ad_rate * 100).toFixed(1) + '%' : '-'}</td>
          <td>${(row.attempts || 0).toLocaleString()}</td>
        </tr>
      `;
    });

    html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * View 4: Render Full Sortable Data Table
   */
  renderDataTable() {
    const container = this.container.querySelector('#analyticsTableContainer');
    const statsEl = this.container.querySelector('#analyticsTableStats');
    if (!container || this.analyticsData.length === 0) return;

    let rows = [...this.analyticsData];

    if (this.tableSearchTerm) {
      const term = this.tableSearchTerm.toLowerCase();
      rows = rows.filter((r) => String(r.level).includes(term) || (r.levelLabel && r.levelLabel.toLowerCase().includes(term)));
    }

    if (statsEl) {
      statsEl.textContent = `Hiển thị ${rows.length} / ${this.analyticsData.length} dòng`;
    }

    let html = `
      <table class="level-table">
        <thead>
          <tr>
            <th>Thao tác</th>
            <th>Level</th>
            <th>Lượt chơi (Attempts)</th>
            <th>Vượt màn (Completions)</th>
            <th>Thất bại (Fails)</th>
            <th>Tỉ lệ Thất bại (Fail Rate)</th>
            <th>Tỉ lệ Thắng (Win Rate)</th>
            <th>Ad Shows / Rate</th>
            <th>Thời lượng TB (s)</th>
            <th>Doanh thu ($)</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach((row) => {
      const failPct = (row.fail_rate * 100).toFixed(1);
      const isRed = row.fail_rate >= 0.4;
      const isYellow = row.fail_rate >= 0.25 && row.fail_rate < 0.4;
      const displayLabel = row.levelLabel || `Level ${row.level}`;

      html += `
        <tr class="${isRed ? 'row-alert-error' : (isYellow ? 'row-alert-warning' : '')}">
          <td class="col-action">
            <button class="btn-action-view btn-jump-lvl" data-level="${row.level}" title="Mở level trong Explorer">
              🔍 Xem Map
            </button>
          </td>
          <td><strong>${displayLabel}</strong></td>
          <td>${row.attempts.toLocaleString()}</td>
          <td>${row.completions.toLocaleString()}</td>
          <td>${row.fail_count.toLocaleString()}</td>
          <td class="${isRed ? 'text-danger font-bold' : (isYellow ? 'text-warning' : '')}">${failPct}%</td>
          <td>${(row.win_rate * 100).toFixed(1)}%</td>
          <td>${row.ad_rate ? (row.ad_rate * 100).toFixed(1) + '%' : '-'}</td>
          <td>${row.session_duration_avg ? row.session_duration_avg.toFixed(1) : '-'}s</td>
          <td>${row.revenue ? '$' + row.revenue.toFixed(3) : '$0'}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;

    // Attach click jump to level
    const jumpBtns = container.querySelectorAll('.btn-jump-lvl');
    jumpBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const lvl = parseInt(btn.getAttribute('data-level'), 10);
        if (this.callbacks.onJumpToLevel && !isNaN(lvl)) {
          this.callbacks.onJumpToLevel(lvl);
        }
      });
    });
  }
}
