/**
 * app.js
 * Entry point của ứng dụng Level Tracker & Analytics Tool.
 * Quản lý state toàn cục: Level Data, Analytics Data, Tab Navigation, Filters, Multi-views & Modals.
 */

import { PALETTE, getColor } from './palette.js';
import { parseLevelData } from './jsonParser.js';
import {
  PROPERTY_DEFINITIONS,
  OPERATORS,
  getPropertyDefinition,
  filterLevels,
  sortLevels,
  getFilterPresets,
  saveFilterPreset,
  deleteFilterPreset,
  DEFAULT_PRESETS,
} from './filterEngine.js';
import { FileImporter } from './fileImport.js';
import { TableRenderer } from './tableRenderer.js';
import { PixelArtRenderer, calculatePixelArtBounds } from './pixelArtRenderer.js';
import { PlaytestRenderer } from './playtestRenderer.js';
import {
  MechanicMapRenderer,
  PROPOSED_MECHANIC_BLUEPRINT,
  PROPOSED_BOOSTER_BLUEPRINT,
  MECHANIC_COLORS,
} from './mechanicMapRenderer.js';
import { AnalyticsImporter } from './analyticsImporter.js';
import { AnalyticsDashboard } from './analyticsDashboard.js';
import { EconomyMapRenderer } from './economyMapRenderer.js';
import { saveLevels, loadLevels, clearStoredLevels } from './levelStorage.js';
import { saveEdit, removeEdit, loadAllEdits, clearAllEdits } from './mechanicMapEditsStorage.js';
import { exportProposedBlueprintCSV } from './csvExporter.js';
import { ShooterMapRenderer } from './shooterMapRenderer.js';
import {
  COMPOUND_PROFILES,
  ATOMIC_INTENTS,
  generateLevelByIntent,
  generateSmartTruckYard,
  calculateIntentScores,
  calculateScoresFromProfile,
} from './designIntent.js';

class App {
  constructor() {
    // Global State
    this.levels = [];
    this.analyticsData = [];
    this.activeFilters = [];
    this.sortKey = 'level';
    this.sortDirection = 'asc';
    this.currentViewIndex = 0;
    this.filteredLevels = [];
    this.activeTab = 'explorer'; // 'explorer' | 'mechanic-map' | 'analytics'
    this.viewMode = 'table'; // 'table' | 'split' | 'grid'

    // Level Side Panel & Intent State
    this.currentSelectedLevel = null;
    this.currentSelectedLevelIndex = -1;
    this.originalLevelRawSnapshot = null;
    this.selectedProfileId = 'P0_TUTORIAL';

    // Khởi tạo các DOM References
    this.initDomElements();

    // Khởi tạo các Renderer & Engine
    this.initModules();

    // Gắn sự kiện UI
    this.initNavTabsUI();
    this.initThemeUI();
    this.initFilterUI();
    this.initPresetUI();
    this.initViewModeUI();
    this.initSidePanelUI();
    this.initSampleLoaders();
    this.initModalUI();
    this.initPlaytestUI();
    this.initDetailModalUI();
    this.initAnalyticsModalUI();

    // Cập nhật giao diện lần đầu
    this.updateView();

    // Khôi phục dữ liệu đã lưu từ IndexedDB
    this.restorePersistedLevels();
  }

  initDomElements() {
    // Nav tabs
    this.navTabExplorer = document.getElementById('navTabExplorer');
    this.navTabMechanicMap = document.getElementById('navTabMechanicMap');
    this.navTabAnalytics = document.getElementById('navTabAnalytics');
    this.navTabEconomy = document.getElementById('navTabEconomy');

    this.viewLevelExplorer = document.getElementById('viewLevelExplorer');
    this.viewMechanicMap = document.getElementById('viewMechanicMap');
    this.viewAnalyticsDashboard = document.getElementById('viewAnalyticsDashboard');
    this.viewEconomyMap = document.getElementById('viewEconomyMap');
    this.economyMapContainer = document.getElementById('economyMapContainer');

    // Import elements
    this.dropZoneEl = document.getElementById('dropZone');
    this.fileInputEl = document.getElementById('fileInput');
    this.btnClearEl = document.getElementById('btnClear');
    this.btnLoadSampleLevels = document.getElementById('btnLoadSampleLevels');
    this.btnLoadAllLevels = document.getElementById('btnLoadAllLevels');

    // Header & Theme toggle
    this.btnThemeToggle = document.getElementById('btnThemeToggle');
    this.themeIcon = document.getElementById('themeIcon');
    this.themeText = document.getElementById('themeText');

    // Stats bar elements
    this.statTotalLevelsEl = document.getElementById('statTotalLevels');
    this.statMatchLevelsEl = document.getElementById('statMatchLevels');
    this.statErrorLevelsEl = document.getElementById('statErrorLevels');

    // Preset & Filter controls
    this.presetChipsContainer = document.getElementById('presetChipsContainer');
    this.btnSaveCurrentPreset = document.getElementById('btnSaveCurrentPreset');
    this.filterPropSelect = document.getElementById('filterProperty');
    this.filterOpSelect = document.getElementById('filterOperator');
    this.filterValueInput = document.getElementById('filterValue');
    this.btnAddFilter = document.getElementById('btnAddFilter');
    this.filterChipsContainer = document.getElementById('filterChips');
    this.btnClearFilters = document.getElementById('btnClearFilters');

    // View mode elements
    this.viewModeButtons = document.querySelectorAll('.btn-view-mode');
    this.tableContainer = document.getElementById('tableContainer');
    this.gridThumbnailContainer = document.getElementById('gridThumbnailContainer');

    // Mechanic Map Container
    this.mechanicMapContainer = document.getElementById('mechanicMapContainer');

    // Analytics Elements
    this.analyticsDropZone = document.getElementById('analyticsDropZone');
    this.analyticsFileInput = document.getElementById('analyticsFileInput');
    this.analyticsDashboardContainer = document.getElementById('analyticsDashboardContainer');

    // Analytics Import Preview Modal
    this.analyticsImportModal = document.getElementById('analyticsImportModal');
    this.analyticsImportClose = document.getElementById('analyticsImportClose');
    this.analyticsImportMeta = document.getElementById('analyticsImportMeta');
    this.analyticsPreviewHead = document.getElementById('analyticsPreviewHead');
    this.analyticsPreviewBody = document.getElementById('analyticsPreviewBody');
    this.btnAnalyticsCancel = document.getElementById('btnAnalyticsCancel');
    this.btnAnalyticsMerge = document.getElementById('btnAnalyticsMerge');
    this.btnAnalyticsReplace = document.getElementById('btnAnalyticsReplace');

    // Pixel Art Modal elements
    this.artModal = document.getElementById('artModal');
    this.artModalClose = document.getElementById('artModalClose');
    this.artCanvas = document.getElementById('artCanvas');
    this.artTooltip = document.getElementById('artTooltip');
    this.artLevelTitle = document.getElementById('artLevelTitle');
    this.artLevelMeta = document.getElementById('artLevelMeta');
    this.btnPrevLevel = document.getElementById('btnPrevLevel');
    this.btnNextLevel = document.getElementById('btnNextLevel');
    this.btnSwitchToPlaytest = document.getElementById('btnSwitchToPlaytest');
    this.btnToggleGrid = document.getElementById('btnToggleGrid');
    this.btnDownloadPng = document.getElementById('btnDownloadPng');

    // Playtest Modal elements
    this.playtestModal = document.getElementById('playtestModal');
    this.playtestModalClose = document.getElementById('playtestModalClose');
    this.playtestTitle = document.getElementById('playtestTitle');
    this.playtestContainer = document.getElementById('playtestContainer');

    // Detail Modal elements
    this.detailModal = document.getElementById('detailModal');
    this.detailModalClose = document.getElementById('detailModalClose');
    this.detailModalTitle = document.getElementById('detailModalTitle');
    this.detailModalContent = document.getElementById('detailModalContent');

    // Level Side Panel Elements
    this.explorerLayoutWrapper = document.getElementById('explorerLayoutWrapper');
    this.levelSidePanel = document.getElementById('levelSidePanel');
    this.sidePanelBackdrop = document.getElementById('sidePanelBackdrop');
    this.sidePanelLevelTitle = document.getElementById('sidePanelLevelTitle');
    this.sidePanelBadges = document.getElementById('sidePanelBadges');
    this.btnSidePanelPlaytest = document.getElementById('btnSidePanelPlaytest');
    this.btnSidePanelClose = document.getElementById('btnSidePanelClose');
    this.sideTabButtons = document.querySelectorAll('.side-tab-btn');
    
    // Side Panel View vs Edit Mode elements
    this.sideIntentViewMode = document.getElementById('sideReadonlyMechSection');
    this.sideIntentEditMode = document.getElementById('sideEditControlsGroup');
    this.sidePixelArtCanvas = document.getElementById('sidePixelArtCanvas');
    this.sidePixelArtMeta = document.getElementById('sidePixelArtMeta');
    this.sideLevelStatsGrid = document.getElementById('sideLevelStatsGrid');
    this.sideExistingMechsList = document.getElementById('sideExistingMechsList');
    this.intentProfilesList = document.getElementById('intentProfilesList');
    this.intentOverallBadge = document.getElementById('intentOverallBadge');
    this.intentScoresBarsContainer = document.getElementById('intentScoresBarsContainer');
    this.btnRunIntentGen = document.getElementById('btnRunIntentGen');
    this.btnDownloadGeneratedJson = document.getElementById('btnDownloadGeneratedJson');
    this.btnResetToOriginalJson = document.getElementById('btnResetToOriginalJson');
    this.sideShooterMapContainer = document.getElementById('sideShooterMapContainer');
    this.sideBlueprintLvlNum = document.getElementById('sideBlueprintLvlNum');
    this.sideBlueprintChecklist = document.getElementById('sideBlueprintChecklist');
    this.sideLevelDesignerNote = document.getElementById('sideLevelDesignerNote');
    this.btnSaveBlueprintEdit = document.getElementById('btnSaveBlueprintEdit');
    this.btnResetSideBlueprintLevel = document.getElementById('btnResetSideBlueprintLevel');
    this.sidePlaytestContainer = document.querySelector('.side-playtest-wrapper');
  }

  initModules() {
    // 1. Pixel Art Renderer (Modal & Side panel)
    this.pixelRenderer = new PixelArtRenderer(this.artCanvas, this.artTooltip);
    if (this.sidePixelArtCanvas) {
      this.sidePixelRenderer = new PixelArtRenderer(this.sidePixelArtCanvas, null);
    }

    // 2. Playtest Renderer (Modal)
    this.playtestRenderer = new PlaytestRenderer(this.playtestContainer, this.playtestModal);

    // 2b. Shooter Map Renderer (Side panel & live editor)
    this.shooterMapRenderer = new ShooterMapRenderer(this.sideShooterMapContainer, {
      onShooterDataChanged: (updatedShooters) => {
        this.handleDirectShooterEdit(updatedShooters);
      },
    });

    // 2c. Embedded Side Playtest Renderer (Live Game in Side Panel)
    if (this.sidePlaytestContainer) {
      this.sidePlaytestRenderer = new PlaytestRenderer(this.sidePlaytestContainer, null);
    }

    // 3. Table Renderer
    this.tableRenderer = new TableRenderer(this.tableContainer, {
      onSelectLevel: (level, index) => {
        this.openLevelSidePanel(level, index);
      },
      onRenderLevel: (level, index, currentList) => {
        this.openPixelArtModal(level, index, currentList);
      },
      onPlaytestLevel: (level) => {
        this.openPlaytestModal(level);
      },
      onOpenDetails: (level) => {
        this.openDetailModal(level);
      },
      onSort: (sortKey, direction) => {
        this.sortKey = sortKey;
        this.sortDirection = direction;
        this.updateView();
      },
    });

    // 4. File Importer (LevelData)
    this.fileImporter = new FileImporter(
      {
        dropZoneEl: this.dropZoneEl,
        fileInputEl: this.fileInputEl,
        btnClearEl: this.btnClearEl,
      },
      {
        onFilesProcessed: (newLevels) => {
          this.addLevels(newLevels);
        },
        onClearAll: () => {
          this.clearAllLevels();
        },
      }
    );

    // 5. Mechanic Map Renderer
    this.mechanicMapRenderer = new MechanicMapRenderer(this.mechanicMapContainer, {
      onViewChange: (activeView) => {
        if (this.currentSelectedLevel && this.levelSidePanel && this.levelSidePanel.style.display !== 'none') {
          const isActual = (activeView === 'actual');
          this.openLevelSidePanel(this.currentSelectedLevel, this.currentSelectedLevelIndex, {
            readOnly: isActual,
            defaultEdit: !isActual,
          });
        }
      },
      onSelectLevel: async (levelNum) => {
        const isActual = (this.mechanicMapRenderer.activeView === 'actual');
        await this.openLevelSidePanelByNumber(levelNum, {
          readOnly: isActual,
          defaultEdit: !isActual,
        });
      },
      onSaveEdit: async (record) => {
        await saveEdit(record);
        this.mechanicMapRenderer.editsMap.set(record.key, record);
        this.mechanicMapRenderer.render();
        this.showToast('💾 Đã lưu thay đổi vào bộ nhớ máy (IndexedDB).');
      },
      onRemoveEdit: async (key) => {
        await removeEdit(key);
        this.mechanicMapRenderer.editsMap.delete(key);
        this.mechanicMapRenderer.render();
        this.showToast('🗑️ Đã xóa chỉnh sửa, khôi phục mặc định.');
      },
      onClearAllEdits: async () => {
        await clearAllEdits();
        this.mechanicMapRenderer.editsMap.clear();
        this.mechanicMapRenderer.render();
        this.showToast('🗑️ Đã xóa tất cả chỉnh sửa.');
      },
      onExportCSV: (minLvl, maxLvl) => {
        const levels = [];
        for (let l = 1; l <= maxLvl; l++) levels.push(l);
        const levelPhaseMap = this.mechanicMapRenderer.computeProposedLevelPhases(levels);
        exportProposedBlueprintCSV(levelPhaseMap, this.mechanicMapRenderer.editsMap, minLvl, maxLvl);
        this.showToast(`📥 Đã xuất CSV ma trận L${minLvl} - L${maxLvl}.`);
      },
      onGenerateSmartYard: async (levelNum) => {
        await this.generateSmartYardForLevel(levelNum);
      }
    });

    // 6. Analytics Importer
    this.analyticsImporter = new AnalyticsImporter(
      {
        dropZoneEl: this.analyticsDropZone,
        fileInputEl: this.analyticsFileInput,
      },
      {
        onPreview: (rows, meta, confirmCb) => {
          this.openAnalyticsPreviewModal(rows, meta, confirmCb);
        },
        onDataImported: (rows, mode) => {
          this.setAnalyticsData(rows, mode);
        },
      }
    );

    // 8. Economy Map Renderer
    this.economyMapRenderer = new EconomyMapRenderer(this.economyMapContainer);

    // 7. Analytics Dashboard
    this.analyticsDashboard = new AnalyticsDashboard(this.analyticsDashboardContainer, {
      onJumpToLevel: (levelNum) => {
        this.jumpToLevelInExplorer(levelNum);
      },
    });
  }

  /**
   * Top-level Navigation Tabs
   */
  initNavTabsUI() {
    const navButtons = [
      { btn: this.navTabExplorer, tab: 'explorer', pane: this.viewLevelExplorer },
      { btn: this.navTabMechanicMap, tab: 'mechanic-map', pane: this.viewMechanicMap },
      { btn: this.navTabEconomy, tab: 'economy-map', pane: this.viewEconomyMap },
      { btn: this.navTabAnalytics, tab: 'analytics', pane: this.viewAnalyticsDashboard },
    ];

    navButtons.forEach(({ btn, tab, pane }) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        navButtons.forEach((item) => {
          if (item.btn) item.btn.classList.remove('active');
          if (item.pane) item.pane.classList.remove('active');
        });

        btn.classList.add('active');
        if (pane) pane.classList.add('active');
        this.activeTab = tab;

        // Lazy Render View on Tab Switch
        if (tab === 'mechanic-map') {
          this.mechanicMapRenderer.render(this.filteredLevels.length > 0 ? this.filteredLevels : this.levels);
        } else if (tab === 'economy-map') {
          this.economyMapRenderer.render(this.filteredLevels.length > 0 ? this.filteredLevels : this.levels);
        } else if (tab === 'analytics') {
          this.analyticsDashboard.render(this.analyticsData, this.levels);
        }
      });
    });
  }

  jumpToLevelInExplorer(levelNum) {
    // Switch to explorer tab
    if (this.navTabExplorer) {
      this.navTabExplorer.click();
    }

    // Find level in current or all levels
    const targetIdx = this.filteredLevels.findIndex((l) => l.level === levelNum);
    if (targetIdx !== -1) {
      this.openPixelArtModal(this.filteredLevels[targetIdx], targetIdx, this.filteredLevels);
    } else {
      const fullIdx = this.levels.findIndex((l) => l.level === levelNum);
      if (fullIdx !== -1) {
        this.openPixelArtModal(this.levels[fullIdx], fullIdx, this.levels);
      } else {
        alert(`Chưa nạp dữ liệu Level ${levelNum} vào Level Explorer. Hãy nạp file JSON của level này trước.`);
      }
    }
  }

  /**
   * Khởi tạo giao diện Side Panel cho Level Design Intent & Shooter Map
   */
  initSidePanelUI() {
    // 1. Tab buttons in side panel
    this.sideTabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.sideTabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-side-tab');

        document.querySelectorAll('.side-tab-pane').forEach((pane) => pane.classList.remove('active'));
        if (tabId === 'intent') {
          document.getElementById('sideTabContentIntent')?.classList.add('active');
        } else if (tabId === 'playtest') {
          document.getElementById('sideTabContentPlaytest')?.classList.add('active');
          if (this.sidePlaytestRenderer && this.currentSelectedLevel) {
            this.sidePlaytestRenderer.startLevel(this.currentSelectedLevel);
          }
        } else if (tabId === 'shooter-map') {
          document.getElementById('sideTabContentShooterMap')?.classList.add('active');
          if (this.currentSelectedLevel) {
            this.shooterMapRenderer.render(this.currentSelectedLevel.rawJson?.shooters);
          }
        }
      });
    });

    // 2. Nút đóng side panel & Backdrop
    if (this.btnSidePanelClose) {
      this.btnSidePanelClose.addEventListener('click', () => {
        this.closeLevelSidePanel();
      });
    }
    if (this.sidePanelBackdrop) {
      this.sidePanelBackdrop.addEventListener('click', () => {
        this.closeLevelSidePanel();
      });
    }

    // 3. Nút playtest trực tiếp từ side panel (chuyển sang tab playtest)
    if (this.btnSidePanelPlaytest) {
      this.btnSidePanelPlaytest.addEventListener('click', () => {
        const ptTabBtn = document.querySelector('.side-tab-btn[data-side-tab="playtest"]');
        if (ptTabBtn) {
          ptTabBtn.click();
        } else if (this.currentSelectedLevel) {
          this.openPlaytestModal(this.currentSelectedLevel);
        }
      });
    }

    // 4. Nút Chạy thuật toán Gen Intent
    if (this.btnRunIntentGen) {
      this.btnRunIntentGen.addEventListener('click', () => {
        this.runIntentGenerator();
      });
    }

    // 5. Nút Tải JSON
    if (this.btnDownloadGeneratedJson) {
      this.btnDownloadGeneratedJson.addEventListener('click', () => {
        this.downloadGeneratedJson();
      });
    }

    // 6. Nút Khôi phục gốc
    if (this.btnResetToOriginalJson) {
      this.btnResetToOriginalJson.addEventListener('click', () => {
        this.resetLevelToOriginalSnapshot();
      });
    }

    // 7. Nút Lưu Blueprint Mechanics
    if (this.btnSaveBlueprintEdit) {
      this.btnSaveBlueprintEdit.addEventListener('click', async () => {
        if (!this.currentSelectedLevel) return;
        await this.saveBlueprintForLevel(this.currentSelectedLevel.level, true);
      });
    }

    // 8. Nút Reset Blueprint cho Level này
    if (this.btnResetSideBlueprintLevel) {
      this.btnResetSideBlueprintLevel.addEventListener('click', async () => {
        if (!this.currentSelectedLevel) return;
        const lvlNum = this.currentSelectedLevel.level;
        if (confirm(`Bạn có chắc muốn khôi phục Level ${lvlNum} về cấu hình Blueprint mặc định?`)) {
          await this.resetBlueprintForLevel(lvlNum);
        }
      });
    }
  }

  /**
   * Khôi phục toàn bộ chỉnh sửa Blueprint của một Level về mặc định
   */
  async resetBlueprintForLevel(levelNum) {
    if (!levelNum) return;

    const noteKey = `${levelNum}_#level_comment`;
    if (this.mechanicMapRenderer.editsMap.has(noteKey)) {
      await removeEdit(noteKey);
      this.mechanicMapRenderer.editsMap.delete(noteKey);
    }

    const allMechs = [...PROPOSED_MECHANIC_BLUEPRINT, ...PROPOSED_BOOSTER_BLUEPRINT];
    for (const m of allMechs) {
      const compositeKey = `${levelNum}_${m.id}`;
      if (this.mechanicMapRenderer.editsMap.has(compositeKey)) {
        await removeEdit(compositeKey);
        this.mechanicMapRenderer.editsMap.delete(compositeKey);
      }
    }

    this.renderSideBlueprintChecklist(levelNum);
    this.mechanicMapRenderer.render();
    this.showToast(`↺ Đã khôi phục Level ${levelNum} về cấu hình mặc định!`);
  }

  /**
   * Lưu Mechanic & Phase & Note vào Blueprint (IndexedDB + re-render matrix)
   */
  async saveBlueprintForLevel(levelNum, showToastNotification = false) {
    if (!levelNum) return;

    // 1. Lưu Note của Level
    const noteText = this.sideLevelDesignerNote?.value?.trim() || '';
    const noteKey = `${levelNum}_#level_comment`;
    if (noteText) {
      const record = {
        key: noteKey,
        levelNum,
        mechId: '#level_comment',
        mechName: 'Level Designer Note',
        overrideType: 'comment_only',
        overridePhase: null,
        comment: noteText,
      };
      await saveEdit(record);
      this.mechanicMapRenderer.editsMap.set(noteKey, record);
    } else {
      if (this.mechanicMapRenderer.editsMap.has(noteKey)) {
        await removeEdit(noteKey);
        this.mechanicMapRenderer.editsMap.delete(noteKey);
      }
    }

    // 2. Lưu từng Mechanic & Phase (bao gồm cả Boosters)
    const proposedMechs = this.mechanicMapRenderer.getAllProposedMechanicsInLevel(levelNum);
    const allMechs = [...PROPOSED_MECHANIC_BLUEPRINT, ...PROPOSED_BOOSTER_BLUEPRINT];

    for (const m of allMechs) {
      const chk = document.getElementById(`sideChk_${levelNum}_${m.id}`);
      const sel = document.getElementById(`sideSel_${levelNum}_${m.id}`);
      if (!chk) continue;

      const isChecked = chk.checked;
      const selectedPhase = sel ? sel.value : 'combine';
      const computedEntry = proposedMechs.find((p) => p.id === m.id);
      const compositeKey = `${levelNum}_${m.id}`;

      if (isChecked) {
        if (!computedEntry || computedEntry.phase !== selectedPhase) {
          const overrideType = !computedEntry ? 'added' : 'phase_changed';
          const record = {
            key: compositeKey,
            levelNum,
            mechId: m.id,
            mechName: m.name,
            overrideType,
            overridePhase: selectedPhase,
            comment: '',
          };
          await saveEdit(record);
          this.mechanicMapRenderer.editsMap.set(compositeKey, record);
        } else {
          if (this.mechanicMapRenderer.editsMap.has(compositeKey)) {
            await removeEdit(compositeKey);
            this.mechanicMapRenderer.editsMap.delete(compositeKey);
          }
        }
      } else {
        if (computedEntry) {
          const record = {
            key: compositeKey,
            levelNum,
            mechId: m.id,
            mechName: m.name,
            overrideType: 'removed',
            overridePhase: null,
            comment: '',
          };
          await saveEdit(record);
          this.mechanicMapRenderer.editsMap.set(compositeKey, record);
        } else {
          if (this.mechanicMapRenderer.editsMap.has(compositeKey)) {
            await removeEdit(compositeKey);
            this.mechanicMapRenderer.editsMap.delete(compositeKey);
          }
        }
      }
    }

    this.mechanicMapRenderer.render();
    if (showToastNotification) {
      this.showToast(`💾 Đã lưu Blueprint cho Level ${levelNum}!`);
    }
  }

  /**
   * Mở Side Panel cho level theo số thứ tự level
   */
  async openLevelSidePanelByNumber(levelNum, options = {}) {
    let targetIdx = this.levels.findIndex((l) => l.level === levelNum);
    if (targetIdx === -1) {
      this.showToast(`⏳ Đang nạp dữ liệu Level ${levelNum}...`, 1200);
      const loaded = await this.fetchLevelsByNumbers([levelNum]);
      if (loaded && loaded.length > 0) {
        this.addLevels(loaded);
        targetIdx = this.levels.findIndex((l) => l.level === levelNum);
      }
    }

    if (targetIdx !== -1 && this.levels[targetIdx]) {
      this.openLevelSidePanel(this.levels[targetIdx], targetIdx, options);
    } else {
      // Tự động tạo object level placeholder để designer vẫn có thể lên Blueprint và ghi chú bình thường
      const placeholderJson = {
        id: levelNum,
        name: `Level ${levelNum}`,
        girdSizeX: 10,
        girdSizeY: 10,
        blockData: [],
        shooters: []
      };
      const placeholderLevel = parseLevelData(JSON.stringify(placeholderJson), `${levelNum}.json`);
      this.addLevels([placeholderLevel]);
      const newIdx = this.levels.findIndex((l) => l.level === levelNum);
      this.openLevelSidePanel(placeholderLevel, newIdx >= 0 ? newIdx : 0, options);
    }
  }

  /**
   * Chuyển đổi giữa Chế Độ Xem và Chế Độ Sửa Ý Đồ
   */
  setSidePanelEditMode(isEdit) {
    if (this.isReadOnlySidePanel) {
      isEdit = false;
    }
    this.isSidePanelEditMode = isEdit;
    if (this.sideIntentViewMode) {
      this.sideIntentViewMode.style.display = isEdit ? 'none' : 'block';
    }
    if (this.sideIntentEditMode) {
      this.sideIntentEditMode.style.display = isEdit ? 'block' : 'none';
    }
  }

  /**
   * Render Chế Độ Xem (Thông tin cơ bản, Pixel Art, Stats, Mechanics)
   */
  renderSideViewMode(level) {
    if (!level) return;

    // 1. Pixel Art Canvas Preview
    if (this.sidePixelRenderer && level.rawJson?.blockData) {
      this.sidePixelRenderer.loadLevel(level, 280, 190);
    }
    if (this.sidePixelArtMeta) {
      this.sidePixelArtMeta.textContent = `${level.girdSizeX || 10}×${level.girdSizeY || 10} Grid • ${level.active_blocks || 0} Blocks (${level.fill_ratio_pct || 0}%)`;
    }

    // 2. Thông số cơ bản
    if (this.sideLevelStatsGrid) {
      const diffCss = level.difficultyMeta?.cssClass === 'super-hard' ? '#ef4444' : (level.difficultyMeta?.cssClass === 'hard' ? '#f97316' : '#38bdf8');
      this.sideLevelStatsGrid.innerHTML = `
        <div class="side-stat-pill">
          <span class="label">Kích thước Grid</span>
          <span class="value">${level.girdSizeX || 10} × ${level.girdSizeY || 10}</span>
        </div>
        <div class="side-stat-pill">
          <span class="label">Số Khối Active</span>
          <span class="value">${level.active_blocks || 0} (${level.fill_ratio_pct || 0}%)</span>
        </div>
        <div class="side-stat-pill">
          <span class="label">Số Màu Bàn Chơi</span>
          <span class="value">${level.num_colors || 0} màu</span>
        </div>
        <div class="side-stat-pill">
          <span class="label">Số Cột Xe</span>
          <span class="value">${level.num_shooters || 0} cột (${level.active_slots || 0} xe)</span>
        </div>
        <div class="side-stat-pill">
          <span class="label">Độ Khó Level</span>
          <span class="value" style="color: ${diffCss};">${level.difficultyMeta?.badgeText || 'Normal'}</span>
        </div>
        <div class="side-stat-pill">
          <span class="label">Cân Bằng Đạn</span>
          <span class="value" style="color: ${level.invariant_valid ? '#4ade80' : '#f87171'};">${level.invariant_valid ? '✓ Hợp lệ' : '✗ Lệch đạn'}</span>
        </div>
      `;
    }

    // 3. Danh sách Mechanics hiện có trong Level
    if (this.sideExistingMechsList) {
      const allMechs = this.mechanicMapRenderer.getAllMechanicsInLevel(level);
      if (this.sideMechanicCountBadge) {
        this.sideMechanicCountBadge.textContent = `${allMechs.length} Mechanics`;
      }

      if (allMechs.length > 0) {
        this.sideExistingMechsList.innerHTML = allMechs.map((m) => {
          const dotColor = MECHANIC_COLORS[m.id]?.dot || '#3b82f6';
          const iconImg = this.mechanicMapRenderer.renderMechIcon(m, true);
          const countStr = m.detailText || `${m.count} ${m.unit}`;
          const covStr = m.coverage && m.coverage !== '-' ? ` (${m.coverage})` : '';

          return `
            <div class="side-mech-item">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${dotColor}; flex-shrink: 0;"></span>
                ${iconImg}
                <strong style="color: #f8fafc; font-size: 12px;">${m.name}</strong>
              </div>
              <span class="font-mono text-muted" style="font-size: 11px;">${countStr}${covStr}</span>
            </div>
          `;
        }).join('');
      } else {
        this.sideExistingMechsList.innerHTML = `
          <div style="padding: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; font-size: 11px; color: var(--text-muted); text-align: center;">
            Standard Core Level (Không chứa Mechanic đặc biệt)
          </div>
        `;
      }
    }
  }

  /**
   * Mở Side Panel cho level được chọn
   */
  openLevelSidePanel(level, index, options = {}) {
    if (!level || !this.levelSidePanel) return;
    this.currentSelectedLevel = level;
    this.currentSelectedLevelIndex = index;
    const isReadOnly = (options.readOnly !== undefined)
      ? options.readOnly
      : (this.mechanicMapRenderer ? this.mechanicMapRenderer.activeView === 'actual' : false);
    this.isReadOnlySidePanel = isReadOnly;

    if (!this.originalLevelRawSnapshot || this.originalLevelRawSnapshot.id !== level.id) {
      this.originalLevelRawSnapshot = JSON.parse(JSON.stringify(level.rawJson || {}));
    }

    // Mở ở Edit Mode cho Map Đề xuất, hoặc View Mode cho Map Thực tế (ReadOnly)
    const shouldEdit = !this.isReadOnlySidePanel && (options.defaultEdit !== false);
    this.setSidePanelEditMode(shouldEdit);

    // Hiển thị Global Side Panel Drawer & Backdrop
    this.levelSidePanel.style.display = 'flex';
    if (this.sidePanelBackdrop) {
      this.sidePanelBackdrop.style.display = 'block';
    }
    if (this.explorerLayoutWrapper) {
      this.explorerLayoutWrapper.classList.add('side-panel-open');
    }

    // Update table row selection
    this.tableRenderer.setSelectedLevelIndex(index);

    // Header info
    if (this.sidePanelLevelTitle) {
      this.sidePanelLevelTitle.textContent = `Level ${level.level}`;
    }

    if (this.sidePanelBadges) {
      const invBadge = level.invariant_valid
        ? '<span class="badge-status badge-valid font-mono font-xs">✓ Cân bằng</span>'
        : '<span class="badge-status badge-invalid font-mono font-xs">✗ Lệch đạn</span>';
      const diffBadge = `<span class="badge-difficulty ${level.difficultyMeta?.cssClass || 'normal'} font-xs">${level.difficultyMeta?.badgeText || 'Bình thường'}</span>`;
      const readOnlyBadge = this.isReadOnlySidePanel
        ? '<span class="badge-tag font-xs" style="background: rgba(148, 163, 184, 0.15); color: #cbd5e1;">👁️ Level Hiện Tại (Chỉ Xem)</span>'
        : `<span class="badge-tag font-xs" style="background: rgba(245, 158, 11, 0.18); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">📐 Blueprint Level ${level.level}</span>`;
      this.sidePanelBadges.innerHTML = `${diffBadge} ${invBadge} ${readOnlyBadge}`;
    }

    // Render Chế độ xem (Pixel Art & Thông số cơ bản & Mechanic)
    this.renderSideViewMode(level);

    // Chuẩn bị sẵn dữ liệu Chế độ Edit (10 Profiles, 7 Intent bars, Blueprint)
    this.renderIntentProfiles();

    const intentScores = level.intentScores || calculateIntentScores(level).scores;
    const overallPressure = level.overallPressure || calculateIntentScores(level).overallPressure;
    this.renderIntentScoresBars(intentScores, overallPressure);

    this.renderSideBlueprintChecklist(level.level);
    this.shooterMapRenderer.render(level.rawJson?.shooters);

    // If active tab is Playtest, restart Playtest
    const activeSideTab = document.querySelector('.side-tab-btn.active')?.getAttribute('data-side-tab');
    if (activeSideTab === 'playtest' && this.sidePlaytestRenderer) {
      this.sidePlaytestRenderer.startLevel(level);
    }
  }

  /**
   * Render Checklist Blueprint Mechanics trong Side Panel
   */
  renderSideBlueprintChecklist(levelNum) {
    if (this.sideBlueprintLvlNum) {
      this.sideBlueprintLvlNum.textContent = levelNum;
    }

    if (!this.sideBlueprintChecklist) return;

    const proposedMechs = this.mechanicMapRenderer.getAllProposedMechanicsInLevel(levelNum);
    const proposedMap = new Map();
    proposedMechs.forEach((p) => proposedMap.set(p.id, p));

    const allMechs = [...PROPOSED_MECHANIC_BLUEPRINT, ...PROPOSED_BOOSTER_BLUEPRINT];

    const html = allMechs.map((m) => {
      const isChecked = proposedMap.has(m.id);
      const currentPhase = isChecked ? proposedMap.get(m.id).phase : (m.tier === 'BOOSTER' ? 'combine' : 'combine');
      const iconImg = this.mechanicMapRenderer.renderMechIcon(m, true);
      const tierBadge = `<span class="mmap-cat-pill ${m.tier?.toLowerCase() || ''}" style="font-size: 9px; padding: 1px 4px;">${m.tier || 'MECH'}</span>`;

      return `
        <div class="tip-chk-item" style="padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" class="side-mech-chk" id="sideChk_${levelNum}_${m.id}" data-mech-id="${m.id}" ${isChecked ? 'checked' : ''}>
              <label for="sideChk_${levelNum}_${m.id}" style="font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px; color: ${isChecked ? '#f8fafc' : '#94a3b8'};">
                ${iconImg}
                <strong>${m.name}</strong>
                ${tierBadge}
              </label>
            </div>
            <select id="sideSel_${levelNum}_${m.id}" class="side-phase-select form-control-xs" style="font-size: 10px; height: 22px; padding: 1px 3px; ${isChecked ? 'display:inline-block;' : 'display:none;'}">
              <option value="teach" ${currentPhase === 'teach' ? 'selected' : ''}>Teach (T)</option>
              <option value="practice" ${currentPhase === 'practice' ? 'selected' : ''}>Practice (P)</option>
              <option value="test" ${currentPhase === 'test' ? 'selected' : ''}>Test (Tst)</option>
              <option value="combine" ${currentPhase === 'combine' ? 'selected' : ''}>Combine (C)</option>
            </select>
          </div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px; padding-left: 20px; line-height: 1.3;">
            ${m.intent || m.desc || m.behaviorChange || ''}
          </div>
        </div>
      `;
    }).join('');

    this.sideBlueprintChecklist.innerHTML = html;

    // Toggle select display & auto-save live on checkbox change
    this.sideBlueprintChecklist.querySelectorAll('.side-mech-chk').forEach((chk) => {
      chk.addEventListener('change', () => {
        const mId = chk.getAttribute('data-mech-id');
        const sel = document.getElementById(`sideSel_${levelNum}_${mId}`);
        if (sel) {
          sel.style.display = chk.checked ? 'inline-block' : 'none';
        }
        this.saveBlueprintForLevel(levelNum, false);
      });
    });

    // Auto-save live on phase select change
    this.sideBlueprintChecklist.querySelectorAll('.side-phase-select').forEach((sel) => {
      sel.addEventListener('change', () => {
        this.saveBlueprintForLevel(levelNum, false);
      });
    });

    // Load designer comment
    if (this.sideLevelDesignerNote) {
      this.sideLevelDesignerNote.value = this.mechanicMapRenderer.getLevelComment(levelNum) || '';
    }
  }

  /**
   * Đóng Side Panel
   */
  closeLevelSidePanel() {
    if (this.levelSidePanel) {
      this.levelSidePanel.style.display = 'none';
    }
    if (this.sidePanelBackdrop) {
      this.sidePanelBackdrop.style.display = 'none';
    }
    if (this.explorerLayoutWrapper) {
      this.explorerLayoutWrapper.classList.remove('side-panel-open');
    }
    this.tableRenderer.setSelectedLevelIndex(-1);
    this.currentSelectedLevel = null;
  }

  /**
   * Render danh sách 10 Profile Intent với diễn giải chi tiết & mechanics áp dụng
   */
  renderIntentProfiles() {
    if (!this.intentProfilesList) return;
    this.selectedProfileId = this.selectedProfileId || 'P0_TUTORIAL';

    this.intentProfilesList.innerHTML = COMPOUND_PROFILES.map((p) => {
      const isActive = this.selectedProfileId === p.id;
      
      // Tạo danh sách tag mechanics áp dụng trong profile này
      const atomicKeys = Object.keys(p.atomics || {});
      let atomicTagsHtml = '';
      if (atomicKeys.length > 0) {
        atomicTagsHtml = `<div class="ipc-mechanics" style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px;">` +
          atomicKeys.map(k => {
            const def = ATOMIC_INTENTS[k];
            const name = def ? `${def.icon} ${def.shortName}` : k;
            return `<span style="font-size: 9.5px; padding: 1px 5px; border-radius: 3px; background: rgba(59, 130, 246, 0.15); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3);">${name}</span>`;
          }).join('') +
          `</div>`;
      } else {
        atomicTagsHtml = `<div class="ipc-mechanics" style="margin-top: 4px;"><span style="font-size: 9.5px; color: var(--text-muted); font-style: italic;">🌱 Core loop chuẩn (Không gimmick)</span></div>`;
      }

      return `
        <div class="intent-profile-card ${isActive ? 'active' : ''}" data-profile-id="${p.id}" style="cursor: pointer; padding: 10px; border-radius: 8px; margin-bottom: 8px; transition: all 0.2s ease;">
          <div class="ipc-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span class="ipc-title" style="font-size: 12px; font-weight: 700; color: #f8fafc;">${p.name}</span>
            <span class="ipc-stars" style="color: #fbbf24; font-size: 11px;">${p.difficultyStars}</span>
          </div>
          <div class="ipc-tagline" style="font-size: 11px; color: #38bdf8; font-weight: 500; margin-bottom: 4px;">🎯 ${p.tagline}</div>
          <div class="ipc-description" style="font-size: 10.5px; line-height: 1.4; color: #cbd5e1; background: rgba(0, 0, 0, 0.25); padding: 6px 8px; border-radius: 4px; border-left: 2px solid #3b82f6;">
            ${p.description}
          </div>
          ${atomicTagsHtml}
        </div>
      `;
    }).join('');

    this.intentProfilesList.querySelectorAll('.intent-profile-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-profile-id');
        this.selectedProfileId = id;
        this.renderIntentProfiles();

        // Cập nhật simulated intent scores trên 7 thanh áp lực khi designer click chọn Profile
        const profile = COMPOUND_PROFILES.find((p) => p.id === this.selectedProfileId) || COMPOUND_PROFILES[0];
        const simulated = calculateScoresFromProfile(profile);
        this.renderIntentScoresBars(simulated.scores, simulated.overallPressure);
      });
    });
  }

  /**
   * Render 7 thanh tiến trình Intent nằm ngang
   */
  renderIntentScoresBars(intentScores, overallPressure) {
    if (this.intentOverallBadge) {
      this.intentOverallBadge.textContent = `Overall: ${overallPressure || 0}`;
    }
    if (!this.intentScoresBarsContainer) return;

    const barDefs = [
      { key: 'BLIND', altKey: 'mystery', label: '🔮 Ẩn danh', color: '#a855f7' },
      { key: 'PAIR', altKey: 'pairPressure', label: '🔗 Ghép đôi', color: '#3b82f6' },
      { key: 'FROZEN', altKey: 'frozenGate', label: '❄️ Đóng băng', color: '#38bdf8' },
      { key: 'CURTAINS', altKey: 'hiddenSurge', label: '🎭 Rèm che', color: '#ec4899' },
      { key: 'BOMB', altKey: 'bombClock', label: '💣 Bom hẹn', color: '#ef4444' },
      { key: 'GATE', altKey: 'dispatchGate', label: '🧪 Ống nhả', color: '#10b981' },
      { key: 'TUNNEL', altKey: 'floodRelease', label: '🚇 Hầm tràn', color: '#f59e0b' },
    ];

    this.intentScoresBarsContainer.innerHTML = barDefs.map((b) => {
      const rawVal = intentScores?.[b.key] ?? intentScores?.[b.altKey] ?? 0;
      const numericVal = Number(rawVal);
      const val = numericVal.toFixed(1);
      const pct = Math.min(100, Math.round(numericVal <= 5 ? (numericVal / 5) * 100 : numericVal));
      return `
        <div class="intent-bar-row">
          <span class="intent-bar-label">${b.label}</span>
          <div class="intent-bar-track">
            <div class="intent-bar-fill" style="width: ${pct}%; background-color: ${b.color};"></div>
          </div>
          <span class="intent-bar-val font-mono">${val}</span>
        </div>
      `;
    }).join('');
  }

  /**
   * Chạy thuật toán sinh lại shooter theo Intent
   */
  runIntentGenerator() {
    if (!this.currentSelectedLevel) return;
    const currentRaw = this.currentSelectedLevel.rawJson;
    const profile = COMPOUND_PROFILES.find((p) => p.id === this.selectedProfileId) || COMPOUND_PROFILES[0];

    const generatedRaw = generateLevelByIntent(currentRaw, this.selectedProfileId);
    if (!generatedRaw) {
      alert('Không thể tạo shooter cho level này!');
      return;
    }

    const reParsed = parseLevelData(generatedRaw, this.currentSelectedLevel.fileName);
    if (reParsed.isError) {
      alert(`Lỗi cú pháp khi gen: ${reParsed.errorMessage}`);
      return;
    }

    // Update in levels array
    const lvlNum = this.currentSelectedLevel.level;
    const lIdx = this.levels.findIndex((l) => l.level === lvlNum);
    if (lIdx !== -1) this.levels[lIdx] = reParsed;

    const fIdx = this.filteredLevels.findIndex((l) => l.level === lvlNum);
    if (fIdx !== -1) this.filteredLevels[fIdx] = reParsed;

    this.currentSelectedLevel = reParsed;

    // Refresh UI
    this.openLevelSidePanel(reParsed, this.currentSelectedLevelIndex);
    this.tableRenderer.renderTable(this.filteredLevels, this.sortKey, this.sortDirection);
    this.debouncedSave();

    if (generatedRaw._yardMetrics) {
      const ym = generatedRaw._yardMetrics;
      this.showToast(`🚚 Đã gen Smart Truck Yard: Bãi ${ym.yardSize}, ${ym.totalTrucks} xe (Avg Cap ${ym.avgCap}) • Solvable 100% ✓ • Suýt thắng: ${ym.nearMissRate}!`);
    } else {
      this.showToast(`⚡ Đã gen lại shooters theo ý đồ: ${profile.name}! (Invariant: ${reParsed.invariant_valid ? '✓ Cân bằng' : '✗ Lệch'})`);
    }
  }

  /**
   * Sinh lại bãi đỗ xe theo thuật toán Smart Truck Yard cho 1 level cụ thể (gọi từ Mechanic Map Edit Mode)
   */
  async generateSmartYardForLevel(levelNum) {
    let targetLevel = this.levels.find((l) => l.level === levelNum);
    if (!targetLevel) {
      // Cố gắng load level từ placeholder / storage nếu có
      await this.openLevelSidePanelByNumber(levelNum);
      targetLevel = this.levels.find((l) => l.level === levelNum);
    }
    if (!targetLevel || !targetLevel.rawJson) {
      this.showToast(`⚠️ Không tìm thấy dữ liệu Level ${levelNum} để gen bãi đỗ.`);
      return;
    }

    const generatedRaw = generateSmartTruckYard(targetLevel.rawJson);
    if (!generatedRaw) {
      this.showToast(`⚠️ Không thể gen bãi đỗ cho Level ${levelNum}.`);
      return;
    }

    const reParsed = parseLevelData(generatedRaw, targetLevel.fileName || `${levelNum}.json`);
    if (reParsed.isError) {
      this.showToast(`❌ Lỗi cú pháp khi gen Level ${levelNum}: ${reParsed.errorMessage}`);
      return;
    }

    const lIdx = this.levels.findIndex((l) => l.level === levelNum);
    if (lIdx !== -1) this.levels[lIdx] = reParsed;

    const fIdx = this.filteredLevels.findIndex((l) => l.level === levelNum);
    if (fIdx !== -1) this.filteredLevels[fIdx] = reParsed;

    if (this.currentSelectedLevel && this.currentSelectedLevel.level === levelNum) {
      this.currentSelectedLevel = reParsed;
      this.openLevelSidePanel(reParsed, this.currentSelectedLevelIndex);
    }

    this.tableRenderer.renderTable(this.filteredLevels, this.sortKey, this.sortDirection);
    this.debouncedSave();

    const ym = generatedRaw._yardMetrics || {};
    this.showToast(`🚚 Đã gen bãi đỗ Lvl ${levelNum}: Bãi ${ym.yardSize || '-'}, ${ym.totalTrucks || '-'} xe • Solvable 100% ✓ • Suýt thắng: ${ym.nearMissRate || '-'}`);
  }

  /**
   * Xử lý khi người dùng trực tiếp sửa slot trong Shooter Map
   */
  handleDirectShooterEdit(updatedShooters) {
    if (!this.currentSelectedLevel) return;
    this.currentSelectedLevel.rawJson.shooters = updatedShooters;
    const reParsed = parseLevelData(this.currentSelectedLevel.rawJson, this.currentSelectedLevel.fileName);

    const lvlNum = this.currentSelectedLevel.level;
    const lIdx = this.levels.findIndex((l) => l.level === lvlNum);
    if (lIdx !== -1) this.levels[lIdx] = reParsed;

    const fIdx = this.filteredLevels.findIndex((l) => l.level === lvlNum);
    if (fIdx !== -1) this.filteredLevels[fIdx] = reParsed;

    this.currentSelectedLevel = reParsed;

    // Refresh badges & intent bars
    if (this.sidePanelBadges) {
      const invBadge = reParsed.invariant_valid
        ? '<span class="badge-status badge-valid font-mono font-xs">✓ Cân bằng</span>'
        : '<span class="badge-status badge-invalid font-mono font-xs">✗ Lệch đạn</span>';
      const diffBadge = `<span class="badge-difficulty ${reParsed.difficultyMeta?.cssClass || 'normal'} font-xs">${reParsed.difficultyMeta?.badgeText || 'Bình thường'}</span>`;
      const blocksBadge = `<span class="badge-tag font-xs">🎯 ${reParsed.active_blocks || 0} blocks</span>`;
      this.sidePanelBadges.innerHTML = `${diffBadge} ${invBadge} ${blocksBadge}`;
    }

    this.renderIntentScoresBars(reParsed.intentScores, reParsed.overallPressure);
    this.tableRenderer.renderTable(this.filteredLevels, this.sortKey, this.sortDirection);
    this.debouncedSave();
  }

  /**
   * Tải file JSON mới đã sinh
   */
  downloadGeneratedJson() {
    if (!this.currentSelectedLevel) return;
    const jsonStr = JSON.stringify(this.currentSelectedLevel.rawJson, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.currentSelectedLevel.fileName || `${this.currentSelectedLevel.level}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast(`📥 Đã tải file ${a.download}`);
  }

  /**
   * Khôi phục bãi đỗ xe gốc
   */
  resetLevelToOriginalSnapshot() {
    if (!this.currentSelectedLevel || !this.originalLevelRawSnapshot) return;
    if (confirm('Khôi phục lại bãi đỗ xe gốc của level này?')) {
      const restoredRaw = JSON.parse(JSON.stringify(this.originalLevelRawSnapshot));
      const reParsed = parseLevelData(restoredRaw, this.currentSelectedLevel.fileName);

      const lvlNum = this.currentSelectedLevel.level;
      const lIdx = this.levels.findIndex((l) => l.level === lvlNum);
      if (lIdx !== -1) this.levels[lIdx] = reParsed;

      const fIdx = this.filteredLevels.findIndex((l) => l.level === lvlNum);
      if (fIdx !== -1) this.filteredLevels[fIdx] = reParsed;

      this.currentSelectedLevel = reParsed;
      this.openLevelSidePanel(reParsed, this.currentSelectedLevelIndex);
      this.tableRenderer.renderTable(this.filteredLevels, this.sortKey, this.sortDirection);
      this.debouncedSave();
      this.showToast('↺ Đã khôi phục dữ liệu xe ban đầu.');
    }
  }

  /**
   * Vẽ Pixel Art mini trong Side Panel
   */
  renderSidePanelPixelArt(level) {
    if (!this.sideArtCanvas || !level.rawJson?.blockData) return;
    const ctx = this.sideArtCanvas.getContext('2d');
    const raw = level.rawJson;
    const blockData = raw.blockData;
    const W = Number(raw.girdSizeX) || blockData.length;
    const H = Number(raw.girdSizeY) || (blockData[0]?.d ? blockData[0].d.length : 10);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.sideArtCanvas.width, this.sideArtCanvas.height);

    const cellSize = Math.min(this.sideArtCanvas.width / W, this.sideArtCanvas.height / H);
    const offsetX = (this.sideArtCanvas.width - W * cellSize) / 2;
    const offsetY = (this.sideArtCanvas.height - H * cellSize) / 2;

    for (let x = 0; x < blockData.length; x++) {
      const col = blockData[x]?.d || [];
      for (let y = 0; y < col.length; y++) {
        const cell = col[y];
        const type = cell?.type;
        if (type !== undefined && type !== -1) {
          ctx.fillStyle = getColor(type);
          ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
        }
      }
    }

    if (this.sideArtMeta) {
      const shallowCount = level.shallowColors ? level.shallowColors.length : 0;
      const deepCount = level.deepColors ? level.deepColors.length : 0;
      this.sideArtMeta.innerHTML = `
        <div>Kích thước tranh: <strong>${W} × ${H}</strong></div>
        <div>Màu ở lớp ngoài (nông): <strong>${shallowCount}</strong> màu</div>
        <div>Màu ở lớp trong (sâu): <strong>${deepCount}</strong> màu</div>
      `;
    }
  }

  setAnalyticsData(newRows, mode = 'replace') {
    if (mode === 'replace' || this.analyticsData.length === 0) {
      this.analyticsData = newRows;
    } else if (mode === 'merge') {
      const map = new Map();
      this.analyticsData.forEach((r) => map.set(r.level, r));
      newRows.forEach((r) => map.set(r.level, { ...(map.get(r.level) || {}), ...r }));
      this.analyticsData = Array.from(map.values()).sort((a, b) => a.level - b.level);
    }

    this.analyticsDashboard.render(this.analyticsData, this.levels);
    if (this.activeTab !== 'analytics' && this.navTabAnalytics) {
      this.navTabAnalytics.click();
    }
  }

  /**
   * Sample Loaders (Local LevelData files & Analytics monitoring)
   */
  initSampleLoaders() {
    // Load 50 Sample Levels
    if (this.btnLoadSampleLevels) {
      this.btnLoadSampleLevels.addEventListener('click', async () => {
        this.btnLoadSampleLevels.disabled = true;
        this.btnLoadSampleLevels.textContent = '⏳ Đang nạp...';

        const sampleNumbers = [];
        for (let i = 1; i <= 50; i++) sampleNumbers.push(i);

        const loaded = await this.fetchLevelsByNumbers(sampleNumbers);
        this.addLevels(loaded);

        this.btnLoadSampleLevels.disabled = false;
        this.btnLoadSampleLevels.innerHTML = '<span>📂</span> Nạp Level mẫu (50 levels)';
      });
    }

    // Load All Levels
    if (this.btnLoadAllLevels) {
      this.btnLoadAllLevels.addEventListener('click', async () => {
        this.btnLoadAllLevels.disabled = true;
        this.btnLoadAllLevels.textContent = '⏳ Đang nạp toàn bộ...';

        // Load standard range 1-360 + test ranges
        const numbers = [];
        for (let i = 1; i <= 360; i++) numbers.push(i);
        for (let i = 1000; i <= 1011; i++) numbers.push(i);
        for (let i = 1100; i <= 1151; i++) numbers.push(i);
        for (let i = 1300; i <= 1309; i++) numbers.push(i);
        for (let i = 1400; i <= 1404; i++) numbers.push(i);

        const loaded = await this.fetchLevelsByNumbers(numbers);
        this.addLevels(loaded);

        this.btnLoadAllLevels.disabled = false;
        this.btnLoadAllLevels.innerHTML = '<span>🚀</span> Nạp Toàn bộ Level (439 levels)';
      });
    }

    // Load Sample Analytics Button in Analytics subnav
    const btnSampleAnalytics = document.getElementById('btnLoadSampleAnalytics');
    if (btnSampleAnalytics) {
      btnSampleAnalytics.addEventListener('click', async () => {
        btnSampleAnalytics.disabled = true;
        btnSampleAnalytics.textContent = '⏳ Đang nạp...';

        try {
          // Try fetching Dashboard/level_monitoring.json or generate realistic data
          let response = await fetch('../Dashboard/level_monitoring.json');
          if (!response.ok) response = await fetch('../../Dashboard/level_monitoring.json');
          if (!response.ok) response = await fetch('./sample_levels/level_monitoring.json');

          if (response.ok) {
            const rawJson = await response.json();
            const { normalizedRows, detectedCols } = this.analyticsImporter.parseAnalyticsJson(rawJson);
            this.setAnalyticsData(normalizedRows, 'replace');
          } else {
            // Fallback generated mock analytics data
            this.setAnalyticsData(this.generateMockAnalytics(100), 'replace');
          }
        } catch (e) {
          console.warn('Lỗi nạp file level_monitoring.json, sử dụng mock dataset:', e);
          this.setAnalyticsData(this.generateMockAnalytics(100), 'replace');
        }

        btnSampleAnalytics.disabled = false;
        btnSampleAnalytics.innerHTML = '📁 Nạp dữ liệu mẫu';
      });
    }
  }

  generateMockAnalytics(count = 100) {
    const rows = [];
    for (let lvl = 1; lvl <= count; lvl++) {
      const attempts = Math.floor(1500 * Math.exp(-lvl / 60)) + 50;
      const baseFail = 0.05 + Math.min(0.5, (lvl / 120) * 0.45);
      const noise = (Math.random() - 0.5) * 0.15;
      const failRate = Math.max(0.02, Math.min(0.75, Number((baseFail + noise).toFixed(4))));
      const winRate = Number((1 - failRate).toFixed(4));
      const completions = Math.floor(attempts * winRate);
      const failCount = attempts - completions;
      const adRate = Number((0.15 + (failRate * 0.3) + Math.random() * 0.08).toFixed(4));
      const sessionDuration = Number((20 + (lvl * 0.3) + Math.random() * 15).toFixed(1));
      const revenue = Number(((attempts * 0.003) + (adRate * 0.02)).toFixed(3));

      rows.push({
        level: lvl,
        attempts,
        completions,
        fail_count: failCount,
        fail_rate: failRate,
        win_rate: winRate,
        ad_rate: adRate,
        session_duration_avg: sessionDuration,
        revenue,
        churn_rate: Number((failRate * 0.2).toFixed(4)),
      });
    }
    return rows;
  }

  async fetchLevelsByNumbers(numbers) {
    const results = [];
    const batchSize = 25;

    for (let i = 0; i < numbers.length; i += batchSize) {
      const batch = numbers.slice(i, i + batchSize);
      const promises = batch.map(async (num) => {
        try {
          // Try multiple relative paths to LevelData in Unity project and sample folders
          const paths = [
            `../../Assets/__PixelHunt/Resources/LevelData/${num}.json`,
            `../Assets/__PixelHunt/Resources/LevelData/${num}.json`,
            `../../../Assets/__PixelHunt/Resources/LevelData/${num}.json`,
            `../../Assets/Resources/LevelData/${num}.json`,
            `../Assets/Resources/LevelData/${num}.json`,
            `./sample_levels/${num}.json`,
            `sample_levels/${num}.json`,
          ];

          for (const p of paths) {
            try {
              const res = await fetch(p);
              if (res.ok) {
                const text = await res.text();
                return parseLevelData(text, `${num}.json`);
              }
            } catch (err) {}
          }
        } catch (e) {}
        return null;
      });

      const batchResults = await Promise.all(promises);
      batchResults.forEach((res) => {
        if (res && !res.isError) results.push(res);
      });
    }

    return results;
  }

  /**
   * Analytics Import Preview Modal UI
   */
  initAnalyticsModalUI() {
    let pendingConfirm = null;

    this.openAnalyticsPreviewModal = (rows, meta, confirmCb) => {
      pendingConfirm = confirmCb;
      this.analyticsImportMeta.innerHTML = `
        <div class="stat-pill">File: <strong>${meta.fileName}</strong></div>
        <div class="stat-pill">Tổng số dòng: <strong>${meta.totalRows}</strong></div>
        <div class="stat-pill">Columns: <strong>${meta.detectedCols.slice(0, 6).join(', ')}</strong></div>
      `;

      // Render 5 preview rows
      const cols = ['level', 'attempts', 'completions', 'fail_rate', 'win_rate', 'ad_rate'];
      this.analyticsPreviewHead.innerHTML = `
        <tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>
      `;

      const previewRows = rows.slice(0, 5);
      this.analyticsPreviewBody.innerHTML = previewRows.map((r) => `
        <tr>
          <td><strong>${r.level}</strong></td>
          <td>${(r.attempts || 0).toLocaleString()}</td>
          <td>${(r.completions || 0).toLocaleString()}</td>
          <td>${(r.fail_rate * 100).toFixed(1)}%</td>
          <td>${(r.win_rate * 100).toFixed(1)}%</td>
          <td>${r.ad_rate ? (r.ad_rate * 100).toFixed(1) + '%' : '-'}</td>
        </tr>
      `).join('');

      this.analyticsImportModal.classList.add('active');
    };

    const closeModal = () => {
      this.analyticsImportModal.classList.remove('active');
      pendingConfirm = null;
    };

    if (this.analyticsImportClose) this.analyticsImportClose.addEventListener('click', closeModal);
    if (this.btnAnalyticsCancel) this.btnAnalyticsCancel.addEventListener('click', closeModal);

    if (this.btnAnalyticsReplace) {
      this.btnAnalyticsReplace.addEventListener('click', () => {
        if (pendingConfirm) pendingConfirm('replace');
        closeModal();
      });
    }

    if (this.btnAnalyticsMerge) {
      this.btnAnalyticsMerge.addEventListener('click', () => {
        if (pendingConfirm) pendingConfirm('merge');
        closeModal();
      });
    }
  }

  /**
   * Presets Bar UI
   */
  initPresetUI() {
    this.renderPresets();

    if (this.btnSaveCurrentPreset) {
      this.btnSaveCurrentPreset.addEventListener('click', () => {
        if (this.activeFilters.length === 0) {
          alert('Hãy tạo ít nhất 1 điều kiện filter trước khi lưu!');
          return;
        }
        const name = prompt('Nhập tên cho Bộ lọc nhanh này:');
        if (name && name.trim()) {
          saveFilterPreset(name.trim(), this.activeFilters);
          this.renderPresets();
        }
      });
    }
  }

  renderPresets() {
    if (!this.presetChipsContainer) return;
    const presets = getFilterPresets();

    this.presetChipsContainer.innerHTML = presets.map((p) => `
      <div class="preset-chip" data-preset-name="${p.name}">
        <span>${p.name}</span>
        ${!DEFAULT_PRESETS.some((d) => d.name === p.name) ? `<button class="btn-del-preset" title="Xóa preset này">&times;</button>` : ''}
      </div>
    `).join('');

    const chips = this.presetChipsContainer.querySelectorAll('.preset-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-del-preset')) {
          e.stopPropagation();
          const name = chip.getAttribute('data-preset-name');
          deleteFilterPreset(name);
          this.renderPresets();
          return;
        }

        const name = chip.getAttribute('data-preset-name');
        const found = presets.find((p) => p.name === name);
        if (found) {
          this.activeFilters = [...found.conditions];
          this.updateView();
        }
      });
    });
  }

  /**
   * Multi-view mode switcher UI (Table, Split, Grid)
   */
  initViewModeUI() {
    this.viewModeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.viewModeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.viewMode = btn.getAttribute('data-mode');
        this.updateViewModeDisplay();
      });
    });
  }

  updateViewModeDisplay() {
    if (this.viewMode === 'grid') {
      if (this.tableContainer) this.tableContainer.style.display = 'none';
      if (this.gridThumbnailContainer) {
        this.gridThumbnailContainer.style.display = 'grid';
        this.renderGridThumbnails();
      }
    } else {
      if (this.tableContainer) this.tableContainer.style.display = 'block';
      if (this.gridThumbnailContainer) this.gridThumbnailContainer.style.display = 'none';
    }
  }

  renderGridThumbnails() {
    if (!this.gridThumbnailContainer) return;
    const levelsToRender = this.filteredLevels;

    if (this._gridObserver) {
      this._gridObserver.disconnect();
    }

    if (levelsToRender.length === 0) {
      this.gridThumbnailContainer.innerHTML = '<div class="empty-state-card" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">Không có level nào để hiển thị thumbnail</div>';
      return;
    }

    this.gridThumbnailContainer.innerHTML = levelsToRender.map((lvl, idx) => {
      const diffTag = lvl.difficulty === 'hard'
        ? '<span class="grid-card-tag hard" title="Level Khó">🔥 Khó</span>'
        : (lvl.difficulty === 'super_hard'
            ? '<span class="grid-card-tag super-hard" title="Level Siêu Khó">💀 Siêu Khó</span>'
            : '');

      return `
        <div class="grid-art-card ${lvl.difficulty || 'normal'}" data-level-index="${idx}" data-level-num="${lvl.level}">
          ${diffTag}
          <canvas class="grid-art-canvas" width="120" height="120" id="thumbCanvas_${lvl.level}"></canvas>
          <span class="grid-art-title">Level ${lvl.level}</span>
        </div>
      `;
    }).join('');

    const drawThumbnail = (lvl) => {
      const cv = document.getElementById(`thumbCanvas_${lvl.level}`);
      if (!cv) return;
      const ctx = cv.getContext('2d');
      const raw = lvl.rawJson;

      // Clean white background for pixel art in both dark and light modes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 120, 120);

      if (!raw || !raw.blockData) return;

      const bounds = calculatePixelArtBounds(raw);
      const { minX, maxX, minY, maxY, width: cropW, height: cropH } = bounds;
      const maxDim = Math.max(cropW, cropH, 1);
      const cellSize = Math.max(2, Math.floor(100 / maxDim));
      const pixelWidth = cropW * cellSize;
      const pixelHeight = cropH * cellSize;
      const offsetX = Math.floor((120 - pixelWidth) / 2);
      const offsetY = Math.floor((120 - pixelHeight) / 2);

      for (let x = minX; x <= maxX; x++) {
        const col = raw.blockData[x]?.d || [];
        for (let y = minY; y <= maxY; y++) {
          const cell = col[y];
          const type = cell?.type;
          if (type !== undefined && type !== -1 && type !== null) {
            const drawX = x - minX;
            const drawY = maxY - y;
            ctx.fillStyle = getColor(type);
            ctx.fillRect(offsetX + drawX * cellSize, offsetY + drawY * cellSize, cellSize, cellSize);
          }
        }
      }
    };

    if (typeof IntersectionObserver !== 'undefined') {
      this._gridObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const idx = parseInt(card.getAttribute('data-level-index'), 10);
            if (levelsToRender[idx]) {
              drawThumbnail(levelsToRender[idx]);
            }
            this._gridObserver.unobserve(card);
          }
        });
      }, { rootMargin: '200px' });

      const cards = this.gridThumbnailContainer.querySelectorAll('.grid-art-card');
      cards.forEach((card) => {
        this._gridObserver.observe(card);
        card.addEventListener('click', () => {
          const idx = parseInt(card.getAttribute('data-level-index'), 10);
          if (levelsToRender[idx]) {
            this.openPixelArtModal(levelsToRender[idx], idx, levelsToRender);
          }
        });
      });
    } else {
      // Fallback
      levelsToRender.forEach(drawThumbnail);
      const cards = this.gridThumbnailContainer.querySelectorAll('.grid-art-card');
      cards.forEach((card) => {
        card.addEventListener('click', () => {
          const idx = parseInt(card.getAttribute('data-level-index'), 10);
          if (levelsToRender[idx]) {
            this.openPixelArtModal(levelsToRender[idx], idx, levelsToRender);
          }
        });
      });
    }
  }

  /**
   * Thêm level vào state (cộng dồn) và lưu vào IndexedDB
   */
  addLevels(newLevels) {
    if (!newLevels || newLevels.length === 0) return;

    const existingNames = new Set(this.levels.map((l) => l.fileName));
    const toAdd = newLevels.filter((l) => {
      if (existingNames.has(l.fileName)) {
        const idx = this.levels.findIndex((ex) => ex.fileName === l.fileName);
        if (idx !== -1) {
          this.levels[idx] = l;
        }
        return false;
      }
      return true;
    });

    this.levels = [...this.levels, ...toAdd];
    this.updateView();
    this.debouncedSave();
  }

  async clearAllLevels() {
    if (this.levels.length === 0) return;
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách Level đã import?')) {
      this.levels = [];
      this.activeFilters = [];
      this.updateView();
      try {
        await clearStoredLevels();
        this.showToast('Đã xóa toàn bộ level khỏi bộ nhớ máy.');
      } catch (e) {
        console.warn('Lỗi khi xóa levels khỏi IndexedDB:', e);
      }
    }
  }

  debouncedSave() {
    if (this._saveTimeout) clearTimeout(this._saveTimeout);
    this._saveTimeout = setTimeout(async () => {
      try {
        await saveLevels(this.levels);
      } catch (e) {
        console.warn('Lỗi tự động lưu levels vào IndexedDB:', e);
      }
    }, 500);
  }

  async restorePersistedLevels() {
    try {
      // Restore level data
      const stored = await loadLevels();
      if (stored && stored.length > 0) {
        this.levels = stored;
        this.updateView();
        this.showToast(`✨ Đã tự động khôi phục ${stored.length} level từ bộ nhớ máy.`);
      }

      // Restore user edits cho Mechanic Map
      const storedEdits = await loadAllEdits();
      if (storedEdits && storedEdits.size > 0) {
        this.mechanicMapRenderer.editsMap = storedEdits;
        if (this.mechanicMapRenderer.activeView === 'proposed') {
          this.mechanicMapRenderer.render();
        }
      }
    } catch (e) {
      console.warn('Không thể load persisted levels hoặc edits từ IndexedDB:', e);
    }
  }

  showToast(message, duration = 3000) {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    if (this._toastTimeout) clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  /**
   * Khởi tạo giao diện Filter động
   */
  initFilterUI() {
    this.filterPropSelect.innerHTML = PROPERTY_DEFINITIONS.map(
      (prop) => `<option value="${prop.key}">${prop.label}</option>`
    ).join('');

    const onPropertyChange = () => {
      const selectedKey = this.filterPropSelect.value;
      const propDef = getPropertyDefinition(selectedKey);
      const opList = OPERATORS[propDef.type] || OPERATORS.string;

      this.filterOpSelect.innerHTML = opList
        .map((op) => `<option value="${op.value}">${op.label}</option>`)
        .join('');

      if (propDef.type === 'boolean') {
        this.filterValueInput.style.display = 'none';
      } else {
        this.filterValueInput.style.display = 'inline-block';
        this.filterValueInput.type = propDef.type === 'number' ? 'number' : 'text';
        this.filterValueInput.placeholder =
          propDef.type === 'number' ? 'Nhập số...' : (propDef.type === 'range' ? 'VD: 1-100' : 'Nhập giá trị...');
      }
    };

    this.filterPropSelect.addEventListener('change', onPropertyChange);
    onPropertyChange();

    this.btnAddFilter.addEventListener('click', () => {
      const propKey = this.filterPropSelect.value;
      const propDef = getPropertyDefinition(propKey);
      const opValue = this.filterOpSelect.value;
      let filterVal = this.filterValueInput.value.trim();

      if (propDef.type === 'boolean') {
        filterVal = opValue === 'true';
      } else if (filterVal === '') {
        alert('Vui lòng nhập giá trị cần lọc!');
        return;
      }

      const opDef = (OPERATORS[propDef.type] || []).find((o) => o.value === opValue);
      const opLabel = opDef ? opDef.label : opValue;

      const condition = {
        id: 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        property: propKey,
        operator: opValue,
        value: filterVal,
        label: `${propDef.label} ${opLabel} ${propDef.type === 'boolean' ? '' : filterVal}`,
      };

      this.activeFilters.push(condition);
      this.filterValueInput.value = '';
      this.updateView();
    });

    this.filterValueInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.btnAddFilter.click();
      }
    });

    this.btnClearFilters.addEventListener('click', () => {
      this.activeFilters = [];
      this.updateView();
    });
  }

  renderFilterChips() {
    if (this.activeFilters.length === 0) {
      this.filterChipsContainer.innerHTML = '';
      this.btnClearFilters.style.display = 'none';
      return;
    }

    this.btnClearFilters.style.display = 'inline-flex';
    this.filterChipsContainer.innerHTML = this.activeFilters
      .map(
        (filter) => `
        <div class="filter-chip">
          <span>${filter.label}</span>
          <button class="btn-remove-chip" data-filter-id="${filter.id}" title="Xóa điều kiện này">&times;</button>
        </div>
      `
      )
      .join('');

    const chipBtns = this.filterChipsContainer.querySelectorAll('.btn-remove-chip');
    chipBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-filter-id');
        this.activeFilters = this.activeFilters.filter((f) => f.id !== id);
        this.updateView();
      });
    });
  }

  /**
   * Cập nhật toàn bộ View khi state thay đổi
   */
  updateView() {
    // 1. Áp dụng filter
    const filtered = filterLevels(this.levels, this.activeFilters);

    // 2. Áp dụng sort
    this.filteredLevels = sortLevels(filtered, this.sortKey, this.sortDirection);

    // 3. Render Table
    this.tableRenderer.renderTable(this.filteredLevels, this.sortKey, this.sortDirection);

    // 4. Render Filter Chips
    this.renderFilterChips();

    // 5. Cập nhật Stats Bar
    this.updateStatsBar();

    // 6. Cập nhật view mode nếu đang ở Grid
    if (this.viewMode === 'grid') {
      this.renderGridThumbnails();
    }

    // 7. Đồng bộ sang Mechanic Map & Analytics Dashboard nếu đang active
    if (this.activeTab === 'mechanic-map') {
      this.mechanicMapRenderer.render(this.filteredLevels.length > 0 ? this.filteredLevels : this.levels);
    } else if (this.activeTab === 'economy-map') {
      this.economyMapRenderer.render(this.filteredLevels.length > 0 ? this.filteredLevels : this.levels);
    } else if (this.activeTab === 'analytics') {
      this.analyticsDashboard.render(this.analyticsData, this.levels);
    }
  }

  updateStatsBar() {
    const total = this.levels.length;
    const matched = this.filteredLevels.length;

    let errorCount = 0;
    this.levels.forEach((l) => {
      if (l.isError || !l.invariant_valid || (Array.isArray(l.invalid_types_found) && l.invalid_types_found.length > 0)) {
        errorCount++;
      }
    });

    this.statTotalLevelsEl.textContent = total;
    this.statMatchLevelsEl.textContent = matched;
    this.statErrorLevelsEl.textContent = errorCount;

    if (errorCount > 0) {
      this.statErrorLevelsEl.classList.add('has-error');
    } else {
      this.statErrorLevelsEl.classList.remove('has-error');
    }
  }

  /**
   * Pixel Art Modal UI
   */
  initModalUI() {
    this.artModalClose.addEventListener('click', () => {
      this.closePixelArtModal();
    });

    this.artModal.addEventListener('click', (e) => {
      if (e.target === this.artModal) {
        this.closePixelArtModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.artModal.classList.contains('active')) this.closePixelArtModal();
        if (this.playtestModal.classList.contains('active')) this.closePlaytestModal();
        if (this.detailModal.classList.contains('active')) this.closeDetailModal();
        if (this.analyticsImportModal?.classList.contains('active')) this.analyticsImportModal.classList.remove('active');
      }
    });

    this.btnPrevLevel.addEventListener('click', () => {
      if (this.currentViewIndex > 0) {
        this.currentViewIndex--;
        this.loadLevelToModal(this.filteredLevels[this.currentViewIndex]);
      }
    });

    this.btnNextLevel.addEventListener('click', () => {
      if (this.currentViewIndex < this.filteredLevels.length - 1) {
        this.currentViewIndex++;
        this.loadLevelToModal(this.filteredLevels[this.currentViewIndex]);
      }
    });

    this.btnToggleGrid.addEventListener('click', () => {
      const isGrid = this.pixelRenderer.toggleGrid();
      if (isGrid) {
        this.btnToggleGrid.classList.add('active');
      } else {
        this.btnToggleGrid.classList.remove('active');
      }
    });

    this.btnDownloadPng.addEventListener('click', () => {
      const currentLevel = this.filteredLevels[this.currentViewIndex];
      const name = currentLevel ? `level_${currentLevel.level}_pixel_art.png` : 'pixel_art.png';
      this.pixelRenderer.downloadPNG(name);
    });

    this.btnSwitchToPlaytest.addEventListener('click', () => {
      const currentLevel = this.filteredLevels[this.currentViewIndex];
      if (currentLevel) {
        this.closePixelArtModal();
        this.openPlaytestModal(currentLevel);
      }
    });
  }

  openPixelArtModal(level, index, currentList) {
    this.currentViewIndex = index;
    this.loadLevelToModal(level);
    this.artModal.classList.add('active');
  }

  closePixelArtModal() {
    this.artModal.classList.remove('active');
    this.pixelRenderer.clear();
  }

  loadLevelToModal(level) {
    if (!level || level.isError) return;

    const diffTagHtml = level.difficulty === 'hard'
      ? '<span class="badge-difficulty hard inline-badge">🔥 Khó</span>'
      : (level.difficulty === 'super_hard'
          ? '<span class="badge-difficulty super-hard inline-badge">💀 Siêu Khó</span>'
          : '');

    this.artLevelTitle.textContent = `Level ${level.level} Pixel Art (${level.fileName})`;

    this.artLevelMeta.innerHTML = `
      ${diffTagHtml ? `<span class="meta-tag meta-tag-diff">${diffTagHtml}</span>` : ''}
      <span class="meta-tag">Kích thước: <strong>${level.girdSizeX} × ${level.girdSizeY}</strong></span>
      <span class="meta-tag">Active Blocks: <strong>${level.active_blocks}</strong></span>
      <span class="meta-tag">Fill: <strong>${level.fill_ratio_pct}%</strong></span>
      <span class="meta-tag">Complexity: <strong>${level.complexity_score ?? '-'}</strong></span>
      <span class="meta-tag">Unique Types: <strong>${level.unique_types_used}</strong></span>
      <span class="meta-tag">Shooters: <strong>${level.num_shooters} (${level.active_slots} xe)</strong></span>
    `;

    this.btnPrevLevel.disabled = this.currentViewIndex <= 0;
    this.btnNextLevel.disabled = this.currentViewIndex >= this.filteredLevels.length - 1;

    this.pixelRenderer.loadLevel(level);
  }

  /**
   * Playtest Simulator Modal UI
   */
  initPlaytestUI() {
    this.playtestModalClose.addEventListener('click', () => {
      this.closePlaytestModal();
    });

    this.playtestModal.addEventListener('click', (e) => {
      if (e.target === this.playtestModal) {
        this.closePlaytestModal();
      }
    });
  }

  openPlaytestModal(level) {
    if (!level || level.isError) return;
    this.playtestTitle.textContent = `🎮 Playtest Game Simulator: Level ${level.level}`;
    this.playtestModal.classList.add('active');
    this.playtestRenderer.startLevel(level);
  }

  closePlaytestModal() {
    this.playtestModal.classList.remove('active');
    this.playtestRenderer.destroy();
  }

  /**
   * Detail Modal (Diff Blocks vs Shots) UI
   */
  initDetailModalUI() {
    this.detailModalClose.addEventListener('click', () => {
      this.closeDetailModal();
    });

    this.detailModal.addEventListener('click', (e) => {
      if (e.target === this.detailModal) {
        this.closeDetailModal();
      }
    });
  }

  openDetailModal(level) {
    if (!level || level.isError) return;

    this.detailModalTitle.textContent = `Chi tiết Invariant & Thống kê Type: Level ${level.level}`;

    const allTypes = new Set([
      ...Object.keys(level.blocks_by_type || {}).map(Number),
      ...Object.keys(level.total_shots_by_type || {}).map(Number),
    ]);

    const sortedTypes = Array.from(allTypes).sort((a, b) => a - b);

    let html = `
      <div class="diff-summary-card ${level.invariant_valid ? 'valid' : 'invalid'}">
        <div class="diff-status-icon">${level.invariant_valid ? '✅' : '⚠️'}</div>
        <div>
          <h4>${level.invariant_valid ? 'Dữ liệu toàn vẹn (Invariant Valid)' : 'CẢNH BÁO: Lệch số lượng đạn (Invariant Inconsistent)!'}</h4>
          <p>${level.invariant_valid ? 'Tổng số Shots của tất cả các xe khớp 100% với số Blocks trên bản đồ theo từng Type.' : `Có ${level.invariantMismatches.length} loại Type có số Shots khác số Blocks!`}</p>
        </div>
      </div>

      <div class="table-wrapper" style="margin-top: 16px;">
        <table class="level-table detail-diff-table">
          <thead>
            <tr>
              <th>Type ID</th>
              <th>Màu sắc</th>
              <th>Blocks trên Map</th>
              <th>Shots trong Xe</th>
              <th>Chênh lệch (Shots - Blocks)</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
    `;

    sortedTypes.forEach((t) => {
      const bCount = level.blocks_by_type[t] || 0;
      const sCount = level.total_shots_by_type[t] || 0;
      const diff = sCount - bCount;
      const isMatch = diff === 0;
      const hex = getColor(t);

      html += `
        <tr class="${!isMatch ? 'row-alert-error' : ''}">
          <td class="font-mono"><strong>${t}</strong></td>
          <td>
            <span class="color-preview-box" style="background-color: ${hex};"></span>
            <span class="font-mono">${hex}</span>
          </td>
          <td class="font-mono">${bCount}</td>
          <td class="font-mono">${sCount}</td>
          <td class="font-mono ${diff > 0 ? 'text-warning' : (diff < 0 ? 'text-danger' : 'text-success')}">
            ${diff > 0 ? `+${diff}` : diff}
          </td>
          <td>
            ${isMatch ? '<span class="badge-status badge-valid">✓ Khớp</span>' : '<span class="badge-status badge-invalid">✗ Lệch</span>'}
          </td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;

    this.detailModalContent.innerHTML = html;
    this.detailModal.classList.add('active');
  }

  closeDetailModal() {
    this.detailModal.classList.remove('active');
  }

  /**
   * Theme Switcher UI (Dark / Light)
   */
  initThemeUI() {
    const savedTheme = localStorage.getItem('pixel_ball_theme') || 'dark';
    this.setTheme(savedTheme);

    this.btnThemeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(nextTheme);
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pixel_ball_theme', theme);

    if (theme === 'dark') {
      this.themeIcon.textContent = '☀️';
      this.themeText.textContent = 'Chế độ Sáng';
    } else {
      this.themeIcon.textContent = '🌙';
      this.themeText.textContent = 'Chế độ Tối';
    }
  }
}

// Khởi chạy ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
