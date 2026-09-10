# Clever Carson — Game Design, Level Studio & Analytics Suite 🎮

> **Bộ công cụ Web All-in-One chuyên sâu dành cho Game Designer, Developer & Data Analyst của dự án Pixel Ball (Pixel Hunt core gameplay).**

---

## 📑 Mục lục
1. [Giới thiệu tổng quan](#1-giới-thiệu-tổng-quan)
2. [Các phân hệ tính năng chính (Feature Matrix)](#2-các-phân-hệ-tính-năng-chính-feature-matrix)
   - [2.1. Level Explorer & Invariant Verification](#21-level-explorer--invariant-verification)
   - [2.2. Mechanic Map & Timeline Phân bổ TPTC](#22-mechanic-map--timeline-phân-bổ-tptc)
   - [2.3. Design Intent Studio & Shooter Auto-Generator](#23-design-intent-studio--shooter-auto-generator)
   - [2.4. Interactive Playtest Simulator](#24-interactive-playtest-simulator)
   - [2.5. Shooter Map & Parking Grid Viewer](#25-shooter-map--parking-grid-viewer)
   - [2.6. BI & Analytics Dashboard (Phân tích chéo Design × Dữ liệu thực tế)](#26-bi--analytics-dashboard)
   - [2.7. Pixel Art Canvas Renderer](#27-pixel-art-canvas-renderer)
3. [Cấu trúc thư mục & Giải thích Source Code](#3-cấu-trúc-thư-mục--giải-thích-source-code)
4. [Bảng Palette 36 màu chuẩn (0 - 35)](#4-bảng-palette-36-màu-chuẩn-0---35)
5. [Quy chuẩn Framework TPTC & Density Cap](#5-quy-chuẩn-framework-tptc--density-cap)
6. [Hướng dẫn cài đặt & Khởi chạy](#6-hướng-dẫn-cài-đặt--khởi-chạy)
7. [Chạy Automated Test Suite](#7-chạy-automated-test-suite)
8. [Quy trình làm việc khuyến nghị cho Game Designer (GD Workflow)](#8-quy-trình-làm-việc-khuyến-nghị-cho-game-designer-gd-workflow)
9. [Tài liệu Đặc tả Logic Gameplay & Ma trận Combine (GAMEPLAY_MECHANICS_AND_COMBINATIONS.md)](./GAMEPLAY_MECHANICS_AND_COMBINATIONS.md)

---

## 1. Giới thiệu tổng quan

**Clever Carson** (tên phân hệ: **Pixel Ball Level Tracker & Studio**) là công cụ nền tảng Web không phụ thuộc server backend nặng nề (chạy hoàn toàn Client-side trên trình duyệt hiện đại bằng ES Modules).

### 🎯 Mục tiêu giải quyết:
- **Kiểm soát tính toàn vẹn (Invariant Integrity):** Đảm bảo 100% không bao giờ xảy ra lỗi "thiếu hàng" hoặc "thừa tải trọng" giữa ma trận công nhân ôm thùng hàng (`blockData`) và tổng tải trọng tiếp nhận của dàn xe tải (`shooterData`), tự động cảnh báo mã màu rác ngoài palette `[0..35]`.
- **Quy hoạch Mechanic chuẩn mực (TPTC Framework):** Giúp Game Designer trực quan hóa nhịp độ giới thiệu cơ chế từ Level 1 đến 439+, kiểm soát tải nhận thức (Cognitive Load) và giới hạn mật độ cơ chế (Density Cap).
- **Tạo sinh Level theo Ý đồ thiết kế (Design Intent Generator):** Tự động tái tạo cấu hình dàn xe tải và bãi đỗ theo 10 hồ sơ ý đồ chiến thuật (Rush, Squeeze, Freeze, Bomb...) mà vẫn **bảo toàn tuyệt đối 100% hình vẽ Pixel Art gốc**.
- **Playtest giả lập tức thời (Zero Build Playtest):** Mô phỏng luồng công nhân bốc hàng lên xe ngay trên trình duyệt mà không cần mở Unity Editor hay build APK/IPA.
- **Tối ưu hóa bằng dữ liệu BI (Data-Driven Level Tuning):** Nhập dữ liệu Analytics từ Firebase/Amplitude để tìm ra ngay các level có tỷ lệ nghẽn bến bất thường, drop-off cao, từ đó tinh chỉnh độ khó kịp thời.

---

## 2. Các phân hệ tính năng chính (Feature Matrix)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLEVER CARSON                                       │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│ 📋 LEVEL EXPLORER │ 🗺️ MECHANIC MAP   │ 🎯 INTENT STUDIO  │ 📊 ANALYTICS DASHBOARD     │
│ • Import JSON     │ • Timeline 400+   │ • 7 Atomic Intents│ • KPI Summary Cards        │
│ • 20+ Chỉ số      │ • TPTC Progression│ • 10 Compound Pro │ • Fail Rate & Churn Charts │
│ • Invariant Check │ • Actual vs Prop  │ • BFS Depth Radar │ • Cross Analysis Design×BI │
│ • Filter & Sort   │ • Density Cap     │ • Auto Generator  │ • Heatmaps & Scatter Plot  │
├───────────────────┴───────────────────┴───────────────────┴────────────────────────────┤
│ 🎮 INTERACTIVE PLAYTEST SIMULATOR   •   🚚 SHOOTER MAP   •   🎨 PIXEL ART CANVAS       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.1. Level Explorer & Invariant Verification

- **Import dữ liệu linh hoạt:** Kéo thả hàng loạt file `.json`, chọn folder, hoặc click nạp nhanh bộ mẫu **50 levels** / toàn bộ **439 levels**.
- **Trích xuất 20+ chỉ số chuyên sâu:**
  - `Grid Size` ($X \times Y$, Total Cells).
  - `Active Blocks` (Số khối điểm ảnh thực tế), `Fill Ratio %`.
  - `Unique Colors Used` (Số màu khác nhau trong tranh).
  - `Total Shooters` & `Total Shots` theo từng mã màu.
  - `Max Tray Capacity` (Số slot khay đạn).
  - `Mechanics Breakdown` (Danh sách cơ chế xuất hiện: Hidden, Connected, Frozen, Bomb, Pipe, Curtain...).
  - `Complexity Score` (Điểm độ khó ước tính dựa trên tương quan màu, tầng sâu và cơ chế).
- **Bộ máy kiểm tra tính toàn vẹn (Invariant Verification Engine):**
  - So khớp từng mã màu $k \in [0..35]$: $\sum \text{Blocks}(k) \equiv \sum \text{Shots}(k)$.
  - Nếu có bất kỳ sự lệch pha (mất cân bằng số đạn) hoặc xuất hiện ID màu ngoài `[0..35]`, hệ thống tự động **bôi đỏ cảnh báo toàn hàng**, gắn nhãn lỗi và cung cấp popup xem chi tiết từng màu bị lệch.
- **Bộ lọc đa điều kiện (Dynamic Multi-filter) & Presets:**
  - Hỗ trợ lọc theo mọi trường dữ liệu với toán tử tương thích kiểu dữ liệu (`=`, `!=`, `>`, `<`, `contains`, `true/false`).
  - Hệ thống lưu / tải nhanh các Filter Presets thường dùng (vd: "Chỉ hiện lỗi Invariant", "Level có > 4 mechanics", "Level Hard/SuperHard").
- **3 Chế độ hiển thị (Multi-View Modes):**
  - **Table View:** Bảng dữ liệu chi tiết đầy đủ cột, hỗ trợ sort header 2 chiều.
  - **Split View:** Chia đôi màn hình (bên trái là bảng số liệu, bên phải là canvas preview pixel art tức thời khi click chọn dòng).
  - **Grid Thumbnail View:** Xem danh sách dạng lưới ảnh thu nhỏ kèm thông số tóm tắt.
- **Xuất báo cáo:** Xuất toàn bộ dữ liệu hoặc dữ liệu đã qua bộ lọc ra file `CSV / Excel` chỉ với 1 click.

---

### 2.2. Mechanic Map & Timeline Phân bổ TPTC

- **Trực quan hóa Ma trận Tiến trình (Progression Timeline):** Hiển thị toàn bộ lộ trình xuất hiện của 14+ Mechanic từ Level 1 đến Level 439+.
- **Chế độ đối soát kép (Dual-layer Comparison):**
  - **Actual Level Map:** Quét trực tiếp từ cấu trúc file JSON thực tế.
  - **Proposed Blueprint Map:** Bản quy hoạch thiết kế chuẩn theo lý thuyết TPTC.
- **Phân loại trạng thái chuẩn TPTC:**
  - `[T] Teach` (Màu tím/hồng): Màn cô lập cơ chế mới.
  - `[P] Practice` (Màu xanh dương): 2-3 màn luyện tập mở rộng.
  - `[Tst] Test` (Màu vàng cam): Màn kiểm tra đánh giá độ thành thục.
  - `[C] Combine` (Màu xanh lá): Màn phối hợp nhiều cơ chế.
  - `[--] Inactive`: Không kích hoạt ở level này.
- **Kiểm soát Tải nhận thức & Cảnh báo vi phạm (Violation Alerts):**
  - **Density Cap:** Cảnh báo khi số mechanic vượt quá ngưỡng cho phép (Normal $\le 4$, Hard/SuperHard $\le 5$, Peak $\le 8$).
  - **Idle Time Alert:** Cảnh báo khi một mechanic bị "bỏ quên" không xuất hiện lại quá 25 level sau khi đã được Teach.
- **Chỉnh sửa & Ghi chú trực tiếp (Cell Editor & LocalStorage):**
  - Nhấp vào bất kỳ cell nào trên timeline để đổi Phase, thêm ghi chú thiết kế (Designer Comments), hoặc loại bỏ mechanic (`Removed`).
  - Dữ liệu chỉnh sửa được lưu an toàn trên trình duyệt (`LocalStorage`) và có nút khôi phục mặc định (`Reset`).

---

### 2.3. Design Intent Studio & Shooter Auto-Generator

Công cụ đột phá hỗ trợ Game Designer tái cấu trúc lại nhịp độ bắn của màn chơi mà không phải sửa thủ công từng tọa độ xe:

- **7 Atomic Intents (Ý đồ nguyên tử):**
  1. `MYSTERY` (Ẩn danh): Ẩn màu xe ở hàng sau, tăng tính bất ngờ.
  2. `PAIR_PRESSURE` (Ghép đôi): Xe nối đôi di chuyển cùng lúc, chiếm 2 slot khay.
  3. `FROZEN_GATE` (Đóng băng): Khóa xe hàng đầu, cần N lượt dọn bãi mới tan băng.
  4. `HIDDEN_SURGE` (Rèm che): Xe vô hình sau rèm, mở ra sau N lượt.
  5. `BOMB_CLOCK` (Bom hẹn giờ): Đếm ngược lượt đi, áp lực thời gian khẩn cấp.
  6. `DISPATCH_GATE` (Ống tiếp ứng / Pipe): Cấp xe liên tục theo hàng đợi FIFO.
  7. `FLOOD_RELEASE` (Tháo đập): Giải phóng lượng lớn xe cùng màu sau khi mở chốt then cài (Long Key).
- **10 Compound Intent Profiles (Hồ sơ ý đồ hoàn chỉnh):**
  - *Onboarding Classic, Speed Rush, Tight Tray Squeeze, Frozen Core, Bomb Countdown, Dual-Color Pressure, Deep Layer Reveal, Chaotic Mystery, Pipe Conveyor, Mega Climax Sink.*
- **Phân tích chiều sâu BFS Layer Depth:**
  - Bóc tách tranh pixel art từ lớp ngoài cùng vào trong lõi theo thứ tự tia bắn có thể tiếp cận.
- **Đánh giá áp lực 7 trục (Intent Radar & Complexity Metric):**
  - Tính điểm từ 0.0 đến 5.0 cho từng khía cạnh: Nhận thức, Khay chứa, Tốc độ, Quản lý rủi ro...
- **Bộ máy sinh tự động (Level Generator Engine):**
  - Sinh lại toàn bộ `shooterData` và `slotCount` tương thích với Intent Profile đã chọn.
  - **Nguyên tắc bất di bất dịch:** Bảo toàn 100% `blockData` và khớp tuyệt đối số phát bắn theo màu.
  - Hỗ trợ tải file JSON mới sinh (`Download Generated JSON`) hoặc Reset về bản gốc.

---

### 2.4. Interactive Playtest Simulator

Trình giả lập gameplay hoàn chỉnh chạy Native JavaScript Canvas mà không cần Unity:

- **Mô phỏng vật lý & quy tắc chuẩn của game:**
  - Thuật toán Raycast quét đạn từ khay bắn vào khối pixel art lộ diện ngoài cùng.
  - Cơ chế lan truyền BFS tiêu thụ cụm khối cùng màu liền kề.
  - Quản lý khay chờ (Tray) từ 4 đến 5 slots.
- **Tương tác trực tiếp:**
  - Click vào xe ở bãi đỗ để điều khiển xe chạy vào khay.
  - Tính toán trạng thái xe bị chặn bởi xe khác phía trước.
- **Tự động & Tinh chỉnh tốc độ:**
  - Nút **Auto Step** (đi 1 nước tối ưu) hoặc **Auto Play** (tự giải toàn màn).
  - Tùy chỉnh tốc độ giả lập từ $1\times$ đến $100\times$.
  - Tự động phát hiện điều kiện **WIN** (dọn sạch toàn bộ block) hoặc **LOSE / DEADLOCK** (đầy khay mà không còn phát bắn hợp lệ).

---

### 2.5. Shooter Map & Parking Grid Viewer

- Trực quan hóa bãi đỗ xe (Parking Lot Grid) theo tọa độ thực tế.
- Hiển thị mũi tên hướng di chuyển (Up, Down, Left, Right).
- Hiển thị trạng thái xe: Xe sẵn sàng di chuyển (Ready), xe bị kẹt bởi xe phía trước (Blocked), xe mang cơ chế đặc biệt (Ice, Linked, Curtain...).

---

### 2.6. BI & Analytics Dashboard

Phân hệ kết nối giữa **Ý đồ thiết kế (Design)** và **Hành vi thực tế (BI Data)**:

- **Import Analytics Data:** Hỗ trợ nhập file log JSON xuất từ Firebase / Amplitude / Google BigQuery.
- **KPI Summary Cards:**
  - Win Rate trung bình toàn game, Màn có Drop-rate cao nhất, Số lượt thử trung bình (Avg Attempts), Tỷ lệ dùng Booster.
- **Biểu đồ trực quan (Chart.js):**
  - **Fail Rate Line Chart:** Biểu đồ đường thể hiện tỷ lệ thua theo level kèm đường Moving Average (MA) làm mịn xu hướng.
  - **Churn Drop-off Waterfall:** Thể hiện lượng người chơi rơi rụng tại từng mốc level để định vị chính xác "điểm nghẽn" (Churn Chokepoint).
  - **Scatter Correlation Plot:** Biểu đồ phân tán so sánh tương quan giữa Điểm độ khó lý thuyết (`Complexity Score`) và Tỷ lệ thua thực tế (`Fail Rate`). Tính hệ số tương quan **Pearson Correlation $r$**.
  - **Mechanic Difficulty Heatmap:** Đánh giá mức độ khó thực tế của từng loại Mechanic dựa trên dữ liệu người chơi.

---

### 2.7. Pixel Art Canvas Renderer

- **Render pixel art độ nét cao:** Tái hiện trung thực hình ảnh bưu kiện pixel từ `blockData` theo đúng 36 mã màu palette chuẩn.
- **Tự động cân chỉnh (Auto-fit):** Tự động scale vừa vặn khung hình canvas bất kể kích thước map ($8\times8$, $11\times20$, $30\times30$...).
- **Chế độ hỗ trợ:**
  - Bật / tắt đường lưới phân cách pixel (Grid lines).
  - Hover hiển thị Tooltip thông số ô: Tọa độ $(x, y)$, Type màu, Mã Hex.
  - Nút chuyển nhanh `Level trước (◀)` / `Level sau (▶)`.
  - Xuất ảnh `PNG` độ phân giải cao phục vụ tài liệu / icon.

---

## 3. Cấu trúc thư mục & Giải thích Source Code

```
clever-carson/
├── index.html                      # Redirect entry point vào level_tracker
├── test_runner.mjs                 # Script kiểm thử tự động toàn bộ logic cốt lõi (Node.js)
├── LEVEL_DESIGN_BLUEPRINT.md       # Tài liệu đặc tả chuẩn thiết kế TPTC & Ma trận tiến trình
├── README.md                       # Tài liệu hướng dẫn tổng quan (File này)
│
└── level_tracker/                  # Phân hệ Web App chính
    ├── index.html                  # Giao diện chính (HTML5 Semantic, CSS Grid/Flexbox)
    ├── css/
    │   └── style.css               # Hệ thống Style Dark/Light theme, Gaming UI, Responsive
    │
    ├── sample_levels/              # Bộ level mẫu dùng kiểm thử
    │   ├── 1.json                  # Level 1 chuẩn (11x20)
    │   ├── 2.json                  # Level 2 hình trái tim (9x9)
    │   ├── 3.json                  # Level 3 hình thanh kiếm (8x12)
    │   └── error_level.json        # File mẫu chứa lỗi Invariant & Type màu rác
    │
    └── js/                         # Bộ mã nguồn JavaScript (Native ES Modules)
        ├── app.js                  # Central Controller & State Manager toàn ứng dụng
        ├── palette.js              # Nguồn chân lý duy nhất (Single Source of Truth) 36 màu
        ├── jsonParser.js           # Parser bóc tách dữ liệu level JSON & tính toán invariants
        ├── filterEngine.js         # Bộ máy lọc đa điều kiện AND, sorting & search
        ├── levelConfig.js          # Cấu hình danh mục Mechanics, Icons, Tiers & Caps
        ├── levelStorage.js         # Quản lý lưu trữ/nạp cache 400+ levels vào LocalStorage
        ├── designIntent.js         # Định nghĩa 7 Atomic Intents, 10 Profiles & Generator
        ├── rebalancer.js           # Thuật toán tái cân bằng tỷ lệ đạn và sắp xếp xe
        ├── mechanicMapRenderer.js  # Render Ma trận Mechanic Timeline & kiểm tra vi phạm
        ├── mechanicMapEditsStorage.js # Lưu trữ các chỉnh sửa ghi chú / override của Designer
        ├── playtestEngine.js       # Core logic mô phỏng gameplay (BFS, Raycast, Tray)
        ├── playtestRenderer.js     # Render giao diện tương tác chơi thử trên Canvas
        ├── shooterMapRenderer.js   # Render trực quan bãi đỗ xe và hướng di chuyển
        ├── pixelArtRenderer.js     # Render tranh Pixel Art, Tooltip & xuất PNG
        ├── tableRenderer.js        # Render bảng dữ liệu Level Explorer & cảnh báo lỗi
        ├── fileImport.js           # Xử lý Drag & Drop, File Reader API
        ├── analyticsImporter.js    # Parse & chuẩn hóa dữ liệu Analytics log JSON
        ├── analyticsDashboard.js   # Quản lý biểu đồ Chart.js, KPI cards & phân tích chéo
        └── csvExporter.js          # Bộ xuất dữ liệu ra định dạng CSV/Excel
```

---

## 4. Bảng Palette 36 màu chuẩn (0 - 35)

Toàn bộ gameplay và công cụ sử dụng thống nhất bảng màu 36 ID sau:

| ID | Mã Hex | Xem trước | ID | Mã Hex | Xem trước | ID | Mã Hex | Xem trước |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **0** | `#F1383A` | 🔴 Đỏ cờ | **12** | `#FABFFC` | 🌸 Hồng nhạt | **24** | `#FF8F79` | 🍑 Cam san hô |
| **1** | `#FF8331` | 🟠 Cam tươi | **13** | `#1E7C1B` | 🌲 Xanh lá đậm | **25** | `#26ACA5` | 🌊 Xanh mòng két |
| **2** | `#FFC917` | 🟡 Vàng tươi | **14** | `#FFD58F` | 🌾 Vàng kem | **26** | `#274268` | 🌌 Xanh Navy |
| **3** | `#30CFFF` | 🔵 Xanh da trời | **15** | `#CE863F` | 🪵 Nâu caramel | **27** | `#305D50` | 🪨 Xanh rêu tối |
| **4** | `#2D64E6` | 🔷 Xanh dương | **16** | `#2DE6D0` | 🩵 Xanh ngọc | **28** | `#CAA317` | 🪙 Vàng kim |
| **5** | `#41EC19` | 🟢 Xanh nõn chuối | **17** | `#CA246B` | 🌺 Hồng sen | **29** | `#CDABCD` | 🪻 Tím hoa cà nhạt |
| **6** | `#278D49` | 🌿 Xanh lục | **18** | `#B9F4FA` | 🧊 Băng thanh | **30** | `#A1FFA1` | 🍃 Bạc hà sáng |
| **7** | `#FF65CD` | 💖 Hồng neon | **19** | `#A7E21D` | 🍏 Xanh chanh | **31** | `#B0A89B` | 📜 Xám xi măng |
| **8** | `#A73CFF` | 🟣 Tím | **20** | `#665DD2` | 🍇 Tím biếc | **32** | `#979CB4` | 🌫️ Xám tro |
| **9** | `#FFFFFF` | ⚪ Trắng | **21** | `#959597` | 🔘 Xám trung tính | **33** | `#FFD2B4` | 🥐 Nude pastel |
| **10** | `#3F3F3F` | ⚫ Đen xám | **22** | `#9A2538` | 🍷 Đỏ mận | **34** | `#BE7B85` | 🪵 Hồng đất |
| **11** | `#79573D` | 🟤 Nâu gỗ | **23** | `#FA4B6F` | 🌹 Đỏ dâu tây | **35** | `#657842` | 🫒 Xanh ô-liu |

> **Ghi chú:** Giá trị `type = -1` là ô trống / nền trong suốt (không tính là block cần tiêu thụ).

---

## 5. Quy chuẩn Framework TPTC & Density Cap

### 5.1. Chu trình 4 bước TPTC
1. **TEACH (T):** Giới thiệu cô lập cơ chế mới. Map đơn giản (200-300 blocks), không trộn cơ chế phụ khác.
2. **PRACTICE (P):** Luyện tập mở rộng (kéo dài 2-3 levels) để định hình tư duy.
3. **TEST (Tst):** Thử thách độc lập (Mastery Checkpoint), thường đặt ở các mốc màn Hard để kiểm tra năng lực người chơi.
4. **COMBINE (C):** Phối hợp đa cơ chế đã học nhằm tạo chiều sâu chiến thuật.

### 5.2. Giới hạn mật độ (Density Cap)
- **Normal Levels:** Tối đa **4 Mechanics/màn** (2 Core + 2 Secondary).
- **Hard / SuperHard Levels:** Tối đa **5 Mechanics/màn** (2 Core + 3 Secondary).
- **Peak / Climax Levels (mỗi 50 levels):** Tối đa **6 - 8 Mechanics/màn** (Mega Resource Sink).

---

## 6. Hướng dẫn cài đặt & Khởi chạy

Do ứng dụng xây dựng trên chuẩn **Native ES Modules**, bạn chỉ cần phục vụ thư mục qua bất kỳ HTTP static server nào:

### Cách 1: Sử dụng Python 3 (Tiện lợi nhất)
Chạy lệnh sau tại thư mục gốc `clever-carson`:
```bash
python3 -m http.server 8080
```
Mở trình duyệt tại: `http://localhost:8080/level_tracker/` (hoặc `http://localhost:8080`).

### Cách 2: Sử dụng Node.js (`npx serve` hoặc `http-server`)
```bash
npx serve .
# Hoặc:
npx http-server -p 8080
```

### Cách 3: Sử dụng Extension VSCode
- Cài extension **Live Server** trong Visual Studio Code.
- Chuột phải vào file `clever-carson/level_tracker/index.html` chọn **Open with Live Server**.

---

## 7. Chạy Automated Test Suite

Dự án đi kèm bộ kiểm thử tự động toàn diện kiểm tra các module: Palette, JSON Parser, Invariant Validator, Filter/Sort Engine, Playtest Simulation BFS.

Chạy lệnh bằng Node.js:
```bash
node test_runner.mjs
```

**Kết quả kỳ vọng:**
```text
🧪 Bắt đầu kiểm thử Level Tracker...

--- 1. Kiểm tra Palette (36 màu) ---
✅ Palette test PASS!

--- 2. Kiểm tra Parser với sample_levels/1.json ---
Level: 1
Grid Size: 11x20 (Total: 220)
Active Blocks: 43
Fill Ratio: 19.55%
Invariant Valid: true
✅ Parser 1.json test PASS!

--- 3. Kiểm tra Parser với sample_levels/error_level.json ---
Invariant Valid: false (Mong đợi: false)
Invalid Types: [ 99 ]
✅ Parser error_level.json test PASS!

--- 4. Kiểm tra Filter & Sort Engine ---
✅ Filter & Sort test PASS!

--- 5. Kiểm tra Playtest Engine ---
Exposed ban đầu Type 2: 3, Type 5: 3
Trạng thái sau khi chơi: isWin=true, isLose=false, blocks còn lại=0
✅ Playtest Engine test PASS!

🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐÃ THÀNH CÔNG RỰC RỠ!
```

---

## 8. Quy trình làm việc khuyến nghị cho Game Designer (GD Workflow)

```
       [ BƯỚC 1 ]                  [ BƯỚC 2 ]                  [ BƯỚC 3 ]                  [ BƯỚC 4 ]
   Import Level JSON          Kiểm tra Invariant          Kiểm tra TPTC Map           Design Intent Tuning
 ┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
 │ Kéo thả file JSON │ ────► │ Bôi đỏ cảnh báo?  │ ────► │ Xem tab Mechanic  │ ────► │ Mở Side Panel     │
 │ vào Level Explorer│       │ Lệch màu / Sai ID │       │ Kiểm tra vi phạm  │       │ Chọn Intent mẫu   │
 └───────────────────┘       └───────────────────┘       └───────────────────┘       └───────────────────┘
                                                                                               │
                                     [ BƯỚC 6 ]                                [ BƯỚC 5 ]      ▼
                             Xuất File & Đưa vào Game                   Playtest Giả lập tức thời
                             ┌─────────────────────────┐               ┌─────────────────────────┐
                             │ Tải JSON đã sinh mới    │ ◄──────────── │ Chạy Playtest trực tiếp │
                             │ Copy vào Unity Project  │   (Đã verify) │ Auto-play kiểm tra Win  │
                             └─────────────────────────┘               └─────────────────────────┘
```

1. **Import & Rà soát:** Thả file level mới thiết kế vào tab **Level Explorer**. Quan sát cột `Invariant` để đảm bảo không bị thiếu/thừa đạn.
2. **Kiểm tra Tiến trình:** Chuyển sang tab **Mechanic Map** xem level có vi phạm Density Cap hoặc làm gãy chuỗi TPTC hay không.
3. **Điều chỉnh Ý đồ:** Mở **Side Panel**, chọn hồ sơ Intent phù hợp (vd: *Tight Tray Squeeze* hoặc *Frozen Core*), nhấn **Tạo Shooter theo Ý đồ**.
4. **Playtest kiểm chứng:** Bấm tab **Playtest**, chạy Auto Play để xác nhận màn chơi có thể giải được mà không bị rơi vào thế cờ bí (Deadlock).
5. **Xuất bản:** Tải file `.json` đã được tái cấu trúc và đưa vào thư mục `Assets/__PixelHunt/Resources/LevelData/` của Unity.

---
*Phát triển và bảo trì bởi Game Design & Tech Team.*
