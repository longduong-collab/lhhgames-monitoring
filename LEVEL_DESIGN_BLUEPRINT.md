# TÀI LIỆU THIẾT KẾ LEVEL DESIGN & MA TRẬN PHÂN BỔ MECHANIC
## Dự án: Hole Em All — Core Gameplay Pixel Hunt
**Phiên bản:** 2.0 (Proposed TPTC Framework & Retention Risk Sequencing)  
**Tác giả:** Game Design Team  

---

## 1. TỔNG QUAN TRIẾT LÝ THIẾT KẾ (LEVEL DESIGN PHILOSOPHY)

### 1.1. Triết lý thiết kế Level Design cho Casual Puzzle
Core gameplay của **Pixel Hunt** phối hợp giữa tư duy chọn góc bắn đạn súng xe (Shooter Grid) và dọn dẹp các khối bưu kiện pixel màu (Block Grid). Để duy trì chỉ số Giữ chân người chơi (Retention Rate) cao ở dòng game Casual Puzzle, thiết kế level tuân thủ 3 trụ cột:
1. **Dễ tiếp cận - Khó thành thục (Easy to Learn, Hard to Master):** Giới thiệu cơ chế trực quan, không bắt đọc text dài; độ khó tăng tiến mịn qua hành vi người chơi thay vì chỉ tăng số lượng khối bẻ lái thô bạo.
2. **Luồng cảm xúc hình sin (Emotional Pacing Wave):** Xen kẽ giữa các màn **Căng thẳng nhận thức (Cognitive Tension)** và các màn **Giải tỏa xúc giác (Tactile Relief / WOW Moment)**.
3. **Mục tiêu rõ ràng & Quyền kiểm soát của người chơi (Player Agency):** Thắng nhờ suy tính và quan sát chứ không phải do may rủi ngẫu nhiên (RNG).

---

### 1.2. Khung lý thuyết TPTC (Teach – Practice – Test – Combine)
Mỗi cơ chế gameplay (Mechanic) khi xuất hiện phải đi qua chu trình 4 bước bắt buộc:

```
┌────────────────┐      ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│   1. TEACH     │ ───► │  2. PRACTICE   │ ───► │    3. TEST     │ ───► │   4. COMBINE   │
│ (Level Cô lập) │      │ (2-3 Lvl Tăng) │      │ (Level Solo)   │      │ (Phối hợp Cap) │
└────────────────┘      └────────────────┘      └────────────────┘      └────────────────┘
```

- **Pha 1: TEACH (T) — Giới thiệu cô lập:**
  - **Mục tiêu:** Giúp người chơi hiểu cơ chế vận hành của Mechanic mới mà không bị phân tâm bởi các cơ chế khác.
  - **Quy tắc:** Chỉ chứa Mechanic mới + Mechanic Core căn bản. 0-1 đối thủ cạnh tranh. Số lượng block nhẹ (200-300 blocks). Người chơi không thể thua trừ khi cố tình làm sai.
- **Pha 2: PRACTICE (P) — Luyện tập củng cố (2-3 levels):**
  - **Mục tiêu:** Khắc sâu quy tắc hoạt động, nâng dần độ phức tạp hình học và màu sắc.
  - **Quy tắc:** Thêm 1-2 biến thể nhẹ (ví dụ: xoay hướng xe, tăng kích thước khối). Chưa trộn lẫn với các Mechanic nâng cao khác.
- **Pha 3: TEST (Tst) — Đo lường Mastery độc lập (1 level):**
  - **Mục tiêu:** Thử thách người chơi giải đố hoàn toàn dựa trên Mechanic đó để khẳng định đã thành thục (Mastery Checkpoint).
  - **Quy tắc:** Thường đặt tại mốc màn **Hard (..5)** hoặc **SuperHard (..0)** dạng Solo Mechanic.
- **Pha 4: COMBINE (C) — Phối hợp đa tầng (Từ level sau Test trở đi):**
  - **Mục tiêu:** Ghép nối Mechanic đã học với các Mechanic cũ để tạo ra các câu đố chiều sâu.
  - **Quy tắc:** Tuân thủ triệt để **Density Cap** và **Cụm chủ đề xoay vòng (Micro Cluster)**.

---

### 1.3. Quản lý Tải nhận thức (Cognitive Load Management) & Density Cap
Để tránh gây quá tải não (Cognitive Overload) cho người chơi casual:
- **Giới hạn Mật độ Mechanic (Density Cap):**
  - **Level Thường (Normal):** Tối đa **4 Mechanics/màn** (2 Core Mechanics + tối đa 2 Secondary Mechanics).
  - **Level Khó / Siêu Khó (Hard / SuperHard):** Tối đa **5 Mechanics/màn** (2 Core Mechanics + 3 Secondary Mechanics).
  - **Level PEAK Climax (Mỗi 50 levels):** Tối đa **6-8 Mechanics/màn** (Bào tài nguyên / Mega Sink).
- **Quy tắc Vắng mặt Công bằng (Fair Idle-Time Rotation):**
  - Một Secondary Mechanic sau khi học xong không được "ngâm" quá 25 levels mà không xuất hiện lại. Hệ thống ưu tiên chọn Mechanic có thời gian vắng mặt (Idle Time) lâu nhất vào pha Combine.

---

### 1.4. Nhịp độ Retention (Retention Sequencing & Mega-Challenge Sinks)

```
Level Range      Trọng tâm Retention & Pacing
───────────      ─────────────────────────────────────────────────────────────
L1  - L7         Onboarding & Căn bản (Học thao tác click bắn đạn, đổi màu)
L8  - L15        [D1 Retention Risk Window] Dạy Core 1 (Hidden) & Core 2 (Connected) + Boosters
L16 - L30        [D7 Retention Savior] Relief WOW Mechanic (Loader Stack) cứu Drop-rate
L31 - L100       Mid-game Core Loop: TPTC tuần hoàn Secondary Mechanics (Hard, Wood, Mystery, Ice, Bomb)
L101 - L200+     Veteran Progression: Advanced Mechanics (Long Key, Pipe, Curtains, Key Hunt, Tunnel)
```

- **Mốc D1 Retention (L8 - L15):** Điểm rớt người chơi cao nhất nằm ở Ngày 1. Cần đưa 2 Core Mechanics hấp dẫn nhất (`Hidden Truck` L8 và `Connected Trucks` L14) để giữ chân người chơi.
- **Mốc D7 Retention (L20 - L30):** Ngay sau màn SuperHard L20 đầu tiên, đưa `Loader Stack` (L21) làm **WOW / Relief Mechanic** giúp giải tỏa căng thẳng với cảm giác xả đạn giòn tan.
- **Mega-Challenge Sinks (L50, L100, L150, L200...):** Cứ mỗi 50 level tạo một màn PEAK cực kỳ thử thách để tiêu thụ Booster, tạo đòn bẩy Monetization (IAP / Rewarded Ads).

---

## 2. HỆ THỐNG CƠ CHẾ CHƠI (MECHANIC TAXONOMY & CLUSTERS)

### 2.1. Phân cấp Mechanic (Tier Taxonomy)

| Tier | Tên Mechanic | Loại | Icon | Dạy tại (Teach) | Vai trò & Đặc tính hành vi |
|---|---|---|---|---|---|
| **BOOSTER** | Claw Booster | Booster | 🧲 | Level 7 | Cứu nguy khẩn cấp: Gắp 1 khối bưu kiện khỏi bàn chơi |
| **BOOSTER** | Hand Booster | Booster | 🖐️ | Level 13 | Đổi vị trí 2 xe súng để điều chỉnh luồng đạn |
| **BOOSTER** | Shuffle Booster | Booster | 🔀 | Level 15 | Xáo trộn lại màu sắc đạn của dàn súng chờ |
| **BOOSTER** | Super Shooter | Booster | 🚀 | Level 18 | Súng siêu cấp bắn dọn dẹp diện rộng cho màn PEAK |
| **TIER 1 CORE** | 1. Hidden Truck | Shooter | 🕶️ | Level 8 | **Hành vi A (Suy đoán & Quan sát viền):** Ẩn màu đạn, buộc soi viền màu |
| **TIER 1 CORE** | 2. Connected Trucks | Shooter | ⭐ | Level 14 | **Hành vi C (Quản lý Slot & Nước đi đôi):** 2 xe dính liền di chuyển cùng lúc |
| **TIER 2 SECONDARY**| 3. Loader Stack | Block | 🔫 | Level 21 | **Hành vi B (Xả đạn & Relief):** Bắn trúng sinh ra khối mới, thỏa mãn xúc giác |
| **TIER 2 SECONDARY**| 4. Frozen Truck | Shooter | ❄️ | Level 32 | **Hành vi B' (Mục tiêu phụ & Băng vỡ):** Xe bị đóng băng cần giải cứu |
| **TIER 2 SECONDARY**| 5. Solid Wood Parcel | Block | 🛡️ | Level 51 | **Hành vi D (Định tuyến không gian):** Tường gỗ chặn đạn, ép bắn vòng hông |
| **TIER 2 SECONDARY**| 6. Mystery Parcel | Block | ❓ | Level 63 | **Hành vi A' (Suy đoán & Mở lõi):** Ẩn màu pixel bên trong, mở biên để lật |
| **TIER 2 SECONDARY**| 7. Hard Parcel Block | Block | 🧱 | Level 76 | **Hành vi C' (Dồn đạn tích trữ):** Khối bưu kiện 2x2, 3x3 nhiều máu |
| **TIER 2 SECONDARY**| 8. Shooter Bomb | Shooter | 💣 | Level 92 | **Hành vi E (Khẩn cấp Protocol):** Bom đếm ngược lượt bắn, ép xử lý ưu tiên |
| **TIER 2 SECONDARY**| 9. Long Key | Shooter | 🗝️ | Level 108 | **Hành vi E' (Chuỗi phụ thuộc):** Rút then cài giải phóng xe bị chặn |
| **TIER 2 SECONDARY**| 10. Truck Pipe | Shooter | 🧪 | Level 124 | **Hành vi D' (Quản lý hàng đợi FIFO):** Cấp xe liên tục qua ống tiếp ứng |
| **TIER 2 SECONDARY**| 11. Curtains | Shooter | 🎪 | Level 141 | **Hành vi A'' (Khám phá & Thư giãn thị giác):** Rèm che khuất tầm nhìn xe |
| **TIER 2 SECONDARY**| 12. Key Hunt | Paired | 🔑 | Level 163 | **Hành vi E'' (Mở khóa đa tầng):** Thu thập chìa khóa để mở xe khóa |
| **TIER 3 SITUATIONAL**| 13. Truck Tunnel | Shooter | 🚇 | Level 201 | **Hành vi D'' (Dự đoán không gian ngầm):** Đoàn xe chạy ngầm dưới sàn đấu |

---

### 2.2. Các Cụm chủ đề Lối chơi (Micro Clusters)
Để các màn chơi trong giai đoạn Combine có bản sắc và không bị trộn lẫn lộn xộn, game chia thành **4 Cụm chủ đề lối chơi (Micro Clusters)** xoay vòng theo chu kỳ 5-8 levels:

```
┌────────────────────────────────────────────────────────────────────────┐
│ CỤM A: ÁP LỰC KHÔNG GIAN & ĐỊNH TUYẾN (Spatial & Routing)              │
│ Mechanics: Hidden Truck (🕶️), Connected (⭐), Wood Wall (🛡️), Curtains (🎪)│
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ CỤM B: XẢ ĐẠN & XÚC GIÁC GIẢI TỎA (Tactile Burst & Relief)            │
│ Mechanics: Loader Stack (🔫), Frozen Truck (❄️), Mystery Parcel (❓)   │
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ CỤM C: CHUỖI PHỤ THUỘC & TÍCH LŨY TÀI NGUYÊN (Dependency & Resource) │
│ Mechanics: Connected (⭐), Hard Parcel (🧱), Long Key (🗝️), Key Hunt (🔑) │
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ CỤM D: KHẨN CẤP & QUẢN LÝ HÀNG ĐỢI (Emergency & Queue Management)      │
│ Mechanics: Shooter Bomb (💣), Truck Pipe (🧪), Frozen (❄️), Tunnel (🚇) │
└────────────────────────────────────────────────────────────────────────┘
```

- **Macro Cycle 1 (L20 - L50):** Luân phiên giữa **Cụm A** (Định tuyến) và **Cụm B** (Xúc giác xả đạn).
- **Macro Cycle 2 (L51 - L90):** Luân phiên **B ➔ C ➔ A**.
- **Macro Cycle 3 (L91 - L140):** Luân phiên **D ➔ C ➔ B**.
- **Macro Cycle 4 (L141 - L200+):** Xoay vòng full 4 cụm **D ➔ A ➔ C ➔ B** cho người chơi Veteran.

---

## 3. LỘ TRÌNH DẠY VÀ PHÁT TRIỂN MECHANIC (TPTC PROGRESSION MAP)

Dưới đây là chi tiết lộ trình TPTC thiết kế chuẩn cho toàn bộ 13 Gameplay Mechanics & 4 Booster Tutorials (Tuyệt đối không dạy ở màn Hard/Super Hard):

```
LEVEL PROGRESSION TIMELINE (L1 ➔ L200+)
════════════════════════════════════════════════════════════════════════════════════════════════
L7: 🧲 Claw Booster (Emergency Rescue Tutorial)
L8: 🕶️ 1. Hidden Truck (Teach) ➔ L9-11 (Practice) ➔ L12 (Test Hard) ➔ L14+ (Combine)
L13: 🖐️ Hand Booster (Positional Swap Tutorial)
L14: ⭐ 2. Connected Trucks (Teach) ➔ L15-17 (Practice) ➔ L18 (Test Hard) ➔ L20+ (Combine Climax)
L15: 🔀 Shuffle Booster (Reroll State Tutorial)
L18: 🚀 Super Shooter Booster (Mega Clear Tutorial)
L21: 🔫 3. Loader Stack (Teach WOW) ➔ L22-24 (Practice) ➔ L25 (Test Hard) ➔ L28+ (Combine)
L32: ❄️ 4. Frozen Truck (Teach) ➔ L33-34 (Practice) ➔ L35 (Test Hard) ➔ L38+ (Combine)
L51: 🛡️ 5. Solid Wood Parcel (Teach) ➔ L52-54 (Practice) ➔ L55 (Test Hard) ➔ L58+ (Combine)
L63: ❓ 6. Mystery Parcel (Teach) ➔ L64-66 (Practice) ➔ L68 (Test Hard) ➔ L70+ (Combine Climax)
L76: 🧱 7. Hard Parcel Block (Teach) ➔ L77-79 (Practice) ➔ L80 (Test SuperHard) ➔ L84+ (Combine)
L92: 💣 8. Shooter Bomb (Teach) ➔ L93-95 (Practice) ➔ L98 (Test Hard) ➔ L100+ (Combine PEAK L100)
L108:🗝️ 9. Long Key (Teach) ➔ L109-112 (Practice) ➔ L113 (Test Hard) ➔ L114+ (Combine)
L124:🧪 10. Truck Pipe (Teach) ➔ L125-127 (Practice) ➔ L128 (Test Hard) ➔ L130+ (Combine)
L141:🎪 11. Curtains (Teach) ➔ L142-143 (Practice) ➔ L144 (Test Hard) ➔ L146+ (Combine PEAK L150)
L163:🔑 12. Key Hunt (Teach) ➔ L164-166 (Practice) ➔ L167 (Test Hard) ➔ L169+ (Combine)
L201:🚇 13. Truck Tunnel (Teach Endgame) ➔ L202-204 (Practice) ➔ L205 (Test Hard) ➔ L208+ (Endgame)
════════════════════════════════════════════════════════════════════════════════════════════════
```

---

### Chi tiết thiết kế từng Mechanic:

#### 1. Hidden Truck (🕶️ Xe Ẩn Màu) — Tier 1 Core
- **Teach:** Level 8 | **Practice:** Level 9, 10, 11 | **Test:** Level 12 (Hard) | **Combine Start:** Level 14
- **Ý đồ thiết kế (Intent):** Buộc người chơi hình thành thói quen quan sát viền/pattern màu của xe súng trước khi click chọn, tạo yếu tố suy đoán có căn cứ.
- **Biến đổi hành vi (Behavioral Change):** Chuyển từ "click tự do ngẫu nhiên" sang "quan sát viền màu và suy tính rủi ro (risk vs reward)".
- **Chiến lược Retention:** Đưa vào ngay Level 8 để giải quyết rủi ro rớt người chơi D1 (D1 Retention Risk) trước mốc Level 10.

#### 2. Connected Trucks (⭐ Xe Liên Kết) — Tier 1 Core
- **Teach:** Level 14 | **Practice:** Level 15, 16, 17 | **Test:** Level 18 (Hard) | **Combine Start:** Level 20
- **Ý đồ thiết kế (Intent):** 2 xe dính liền di chuyển cùng lúc, chiếm slot kép, dễ gây kẹt lane nếu không tính trước 1 nước đi.
- **Biến đổi hành vi (Behavioral Change):** Học cách tính toán nước đi đôi và quản lý không gian slot chờ trước khi xả súng.
- **Chiến lược Retention:** Climax kết hợp Core 1 (Hidden) + Core 2 (Connected) tại màn SuperHard L20 làm cột mốc thử thách đầu tiên.

#### 3. Loader Stack (🔫 Khối Phát Sinh Đạn) — Tier 2 Secondary
- **Teach:** Level 21 | **Practice:** Level 22, 23, 24 | **Test:** Level 25 (Hard) | **Combine Start:** Level 28
- **Ý đồ thiết kế (Intent):** Bắn trúng phát sinh ra khối bưu kiện mới, tạo cảm giác xả đạn liên tục đã mắt đã tai, giải tỏa áp lực đạn.
- **Biến đổi hành vi (Behavioral Change):** Tận hưởng nhịp xả đạn nhanh, nạp lại năng lượng tích cực sau màn khó.
- **Chiến lược Retention:** Đặt tại Level 21 (ngay sau SuperHard L20) đóng vai trò **WOW / Relief Mechanic** giúp cứu drop-rate D7.

#### 4. Frozen Truck (❄️ Xe Đóng Băng) — Tier 2 Secondary
- **Teach:** Level 32 | **Practice:** Level 33, 34 | **Test:** Level 35 (Hard) | **Combine Start:** Level 38
- **Ý đồ thiết kế (Intent):** Xe bị đóng băng cần bắn giải cứu trước khi dùng được; chiếm dụng slot chờ tạm thời tạo bài toán nhịp độ.
- **Biến đổi hành vi (Behavioral Change):** Phân chia mục tiêu phụ (giải cứu xe) trước khi bắn mục tiêu chính; cảm nhận âm thanh băng vỡ giòn tan.
- **Chiến lược Retention:** Tạo thử thách nhịp độ slot nhẹ nhàng, giải tỏa xúc giác băng vỡ.

#### 5. Solid Wood Parcel (🛡️ Tường Gỗ Bất Hoại) — Tier 2 Secondary
- **Teach:** Level 51 | **Practice:** Level 52, 53, 54 | **Test:** Level 55 (Hard) | **Combine Start:** Level 58
- **Ý đồ thiết kế (Intent):** Tường gỗ bất hoại chặn đường đạn trực diện, ép người chơi tìm hướng bắn vòng từ bên hông hoặc phía sau.
- **Biến đổi hành vi (Behavioral Change):** Thay đổi tư duy định tuyến không gian (Spatial Routing).
- **Chiến lược Retention:** Đặt tại Level 51 (ngay sau SuperHard L50) mở màn Act 2 tươi mới.

#### 6. Mystery Parcel (❓ Khối Bí Ẩn) — Tier 2 Secondary
- **Teach:** Level 63 | **Practice:** Level 64, 65, 66 | **Test:** Level 68 (Hard) | **Combine Start:** Level 70
- **Ý đồ thiết kế (Intent):** Che giấu màu pixel bên trong, buộc dọn các khối xung quanh để "lật mở" thông tin.
- **Biến đổi hành vi (Behavioral Change):** Khám phá và dọn dẹp vùng biên trước khi chạm vào lõi bí ẩn.
- **Chiến lược Retention:** Giãn cách 12 levels sau Wood Wall để tránh trùng lặp gánh nặng nhận thức.

#### 7. Hard Parcel Block (🧱 Khối Bưu Kiện Kiên Cố) — Tier 2 Secondary
- **Teach:** Level 76 | **Practice:** Level 77, 78, 79 | **Test:** Level 80 (SuperHard 3x3) | **Combine Start:** Level 84
- **Ý đồ thiết kế (Intent):** Khối bưu kiện lớn 2x2, 3x3 đòi hỏi dồn nhiều lượt bắn cùng màu để phá hủy hoàn toàn.
- **Biến đổi hành vi (Behavioral Change):** Học cách tích trữ tài nguyên đạn cùng màu để chuẩn bị công phá khối lớn.
- **Chiến lược Retention:** Rèn luyện kỹ năng dồn tài nguyên đạn trước khi bước vào cơ chế áp lực thời gian Bomb.

#### 8. Shooter Bomb (💣 Xe Bom Khẩn Cấp) — Tier 2 Secondary
- **Teach:** Level 92 | **Practice:** Level 93, 94, 95 | **Test:** Level 98 (Hard) | **Combine Start:** Level 100
- **Ý đồ thiết kế (Intent):** Chế độ khẩn cấp (Emergency Protocol): Tìm đường tiếp cận và giải nổ quả bom trước khi hết số lượt bắn.
- **Biến đổi hành vi (Behavioral Change):** Đảo lộn hoàn toàn thứ tự ưu tiên: Chuyển từ thong thả sang tập trung tuyệt đối vào quả bom.
- **Chiến lược Retention:** Tạo cao trào kịch tính cho cột mốc **PEAK L100 CLIMAX** (kết hợp Bomb + Pipe).

#### 9. Long Key (🗝️ Xe Chìa Khóa Dài) — Tier 2 Secondary
- **Teach:** Level 108 | **Practice:** Level 109-112 | **Test:** Level 113 (Hard - Pattern Break) | **Combine Start:** Level 114
- **Ý đồ thiết kế (Intent):** Thu thập xe ở đầu chốt để rút thanh khóa dài mở đường cho các xe phía sau.
- **Biến đổi hành vi (Behavioral Change):** Phân tích chuỗi phụ thuộc cơ học (Dependency Chain) của dàn xe.
- **Chiến lược Retention:** Phá nhịp chu kỳ .5 bằng màn Test L113, Climax tại SuperHard L119.

#### 10. Truck Pipe (🧪 Ống Tiếp Ứng FIFO) — Tier 2 Secondary
- **Teach:** Level 124 | **Practice:** Level 125-127 | **Test:** Level 128 (Hard) | **Combine Start:** Level 130
- **Ý đồ thiết kế (Intent):** Đoàn xe tiếp tế trong ống theo thứ tự trước-sau (FIFO), thu gọn diện tích bàn chơi.
- **Biến đổi hành vi (Behavioral Change):** Lập kế hoạch tiêu thụ đạn theo thứ tự xuất hiện trong ống.
- **Chiến lược Retention:** Relief L120 ➔ Teach L124 ➔ Test L128 ➔ Climax SuperHard L135.

#### 11. Curtains (🎪 Rèm Che Khuất) — Tier 2 Secondary
- **Teach:** Level 141 | **Practice:** Level 142-143 | **Test:** Level 144 (Hard) | **Combine Start:** Level 146
- **Ý đồ thiết kế (Intent):** Rèm che khuất tầm nhìn xe, tạo sự bất ngờ nhẹ nhàng và đổi gió thị giác.
- **Biến đổi hành vi (Behavioral Change):** Khám phá và thư giãn thị giác (Visual Relief).
- **Chiến lược Retention:** Tạo khoảng thở (Breathing Room) ngay trước Mega PEAK L150.

#### 12. Key Hunt (🔑 Bộ Đôi Khóa & Chìa) — Tier 2 Secondary (Paired)
- **Teach:** Level 163 | **Practice:** Level 164-166 | **Test:** Level 167 (Hard) | **Combine Start:** Level 169
- **Ý đồ thiết kế (Intent):** Thu thập khối chìa khóa để giải phóng xe khóa tương ứng trên bàn chơi.
- **Biến đổi hành vi (Behavioral Change):** Giải đố mở khóa đa tầng cho giai đoạn Mid-Late game.

#### 13. Truck Tunnel (🚇 Hầm Xe Liên Hoàn Ngầm) — Tier 3 Situational
- **Teach:** Level 201 (Endgame Relief) | **Practice:** Level 202-204 | **Test:** Level 205 (Hard) | **Combine Start:** Level 208
- **Ý đồ thiết kế (Intent):** Đoàn xe di chuyển liên hoàn ngầm dưới sàn đấu, xuất hiện ở các cổng hầm khác nhau.
- **Biến đổi hành vi (Behavioral Change):** Phán đoán điểm xuất hiện và lặp lại của đoàn xe ngầm.
- **Chiến lược Retention:** Đỉnh cao thử thách Endgame Climax sau mốc Level 200, hội tụ đủ 13 Mechanics.

---

## 4. BÁO CÁO KIỂM TOÁN VÀ GIẢI PHÁP ĐỊNH HƯỚNG (GD AUDIT & COMPARISON)

### 4.1. Phân tích 4 sai lầm cốt lõi của Map thực tế cũ

```
🔴 SAI LẦM 1: DỒN DẬP ONBOARDING TRONG 18 LEVEL ĐẦU
Map cũ dạy 6 lần liên tiếp trong 11 màn (L7 Claw, L8 LoaderStack, L10 Linked, L13 Hand, L15 Shuffle, L18 SuperShooter).
➔ Hậu quả: Người chơi chưa kịp hiểu cơ chế trước đã bị nạp cơ chế mới, gây quá tải tâm lý và bỏ game ngay D1.

🔴 SAI LẦM 2: NHẢY VỌT ĐỘ KHÓ (SPARK SPIKES) KHÔNG QUA PRACTICE
• Hard Block: Level 30 (650 blocks) ➔ Level 31 vọt lên 1.865 blocks (GẮP 3 LẦN).
• Shooter Bomb: Level 70 (244 blocks) ➔ Level 71 vọt lên 1.500 blocks (GẮP 6 LẦN).
➔ Hậu quả: Người chơi cảm thấy bị game "chơi xỏ" do không có màn Luyện tập (Practice) tăng tải từ từ.

🔴 SAI LẦM 3: DẠY XONG BỎ RƠI MECHANIC (MISSING RECIRCULATION)
• Shooter Bomb dạy L70, xuất hiện lại ở L71, L75 rồi BIẾN MẤT 165 LEVELS cho tới tận Level 235.
• Long Key dạy L80 chỉ có 1 màn L81 rồi biến mất hoàn toàn.
➔ Hậu quả: Lãng phí công sức làm code/art mechanic; người chơi quên sạch cách chơi khi gặp lại.

🔴 SAI LẦM 4: TRÙNG LẶP XUNG ĐỘT NHẬN THỨC (BEHAVIORAL CLASHING)
Dạy Truck Pipe (L101) và Truck Tunnel (L150) quá gần nhau khi cả hai đều thay đổi luồng cấp xe từ hầm/ống.
➔ Hậu quả: Làm suy giảm cảm giác tươi mới (Freshness) của Mechanic mới.
```

---

### 4.2. Bảng so sánh đối chiếu: Map Cũ (Actual) vs. Map Đề Xuất Mới (Proposed TPTC)

| Mechanic | Tier | Vị trí Cũ | Vị trí Đề Xuất | Chu trình TPTC Mới | Đánh giá thay đổi & Tác động Retention |
|---|---|---|---|---|---|
| **1. Hidden Truck** | Core | L23 | **L8** | **T:** L8 ➔ **P:** 9-11 ➔ **Tst:** 12 ➔ **C:** 14+ | **Đẩy sớm:** Giữ chân người chơi ngay mốc D1 retention risk (L8-L12). |
| **2. Connected Trucks** | Core | L10 | **L14** | **T:** L14 ➔ **P:** 15-17 ➔ **Tst:** 18 ➔ **C:** 20+ | **Giãn nhẹ:** Cho người chơi 6 levels master Hidden trước khi học Connected. |
| **3. Loader Stack** | Secondary | L8 | **L21** | **T:** L21 ➔ **P:** 22-24 ➔ **Tst:** 25 ➔ **C:** 28+ | **Tạo WOW:** Đặt ngay sau SuperHard L20 làm màn xả đạn cứu drop-rate D7. |
| **4. Frozen Truck** | Secondary | L60 | **L32** | **T:** L32 ➔ **P:** 33-34 ➔ **Tst:** 35 ➔ **C:** 38+ | **Thư giãn xúc giác:** Đưa lên sớm làm vùng thở sau SuperHard L30. |
| **5. Solid Wood Parcel** | Secondary | L41 | **L51** | **T:** L51 ➔ **P:** 52-54 ➔ **Tst:** 55 ➔ **C:** 58+ | **Đặt đúng Milestone:** Đổi mới tư duy định tuyến không gian mở màn Act 2. |
| **6. Mystery Parcel** | Secondary | L50 | **L63** | **T:** L63 ➔ **P:** 64-66 ➔ **Tst:** 68 ➔ **C:** 70+ | **Giãn cách:** Tránh đụng độ nhận thức với Wood Wall L51. |
| **7. Hard Parcel Block**| Secondary | L30 | **L76** | **T:** L76 ➔ **P:** 77-79 ➔ **Tst:** 80 ➔ **C:** 84+ | **Tăng tải chuẩn:** Đặt trước Bomb để rèn kỹ năng dồn tài nguyên đạn. |
| **8. Shooter Bomb** | Secondary | L70 | **L92** | **T:** L92 ➔ **P:** 93-95 ➔ **Tst:** 98 ➔ **C:** 100+ | **Khẩn cấp Climax:** Dời về L92 để phục vụ màn Climax PEAK L100. |
| **9. Long Key** | Secondary | L80 | **L108** | **T:** L108 ➔ **P:** 109-112 ➔ **Tst:** 113 ➔ **C:** 114+ | **Phá nhịp Mid-game:** Phá chu kỳ .5 ở L113 cho người chơi Veteran. |
| **10. Truck Pipe** | Secondary | L101 | **L124** | **T:** L124 ➔ **P:** 125-127 ➔ **Tst:** 128 ➔ **C:** 130+ | **Tạo khoảng thở:** Thở ở L120 ➔ Dạy L124 ➔ Climax SH L135. |
| **11. Curtains** | Secondary | L90 | **L141** | **T:** L141 ➔ **P:** 142-143 ➔ **Tst:** 144 ➔ **C:** 146+ | **Visual Relief:** Đổi gió thị giác trước màn Mega PEAK L150. |
| **12. Key Hunt** | Secondary | L120 | **L163** | **T:** L163 ➔ **P:** 164-166 ➔ **Tst:** 167 ➔ **C:** 169+ | **Thử thách Đa tầng:** Đặt ở Late-game thử thách giải đố sâu. |
| **13. Truck Tunnel** | Situational | L150 | **L201** | **T:** L201 ➔ **P:** 202-204 ➔ **Tst:** 205 ➔ **C:** 208+ | **Endgame PEAK:** Mốc sau L200 ra mắt Mechanic cuối cùng hội tụ 13 Mechanics. |

---

## 5. QUY TẮC PHÂN BỔ VÀ VẬN HÀNH MAP (OPERATIONAL RULES FOR LEVEL DESIGNERS)

Các Level Designer khi sáng tạo màn chơi mới bắt buộc phải tuân thủ các quy tắc kiểm duyệt (Validation Checklist) sau:

### 5.1. Quy tắc Density Cap & Fair Idle-Time Rotation
1. **Normal Level Check:** Đảm bảo không quá 4 Mechanics xuất hiện đồng thời (2 Cores + 2 Secondaries).
2. **Hard / SuperHard Level Check:** Tối đa 5 Mechanics. Ưu tiên chọn Mechanic có **Idle Time vắng mặt dài nhất** trong danh sách chờ.
3. **Pacing Rule:** Sau 1 màn SuperHard (..0), màn tiếp theo (..1) phải là màn Normal/Relief có tải lượng nhẹ (250-400 blocks).

### 5.2. Công thức tạo màn PEAK / Mega-Challenge Sink (L50, L100, L150, L200)
Màn PEAK là công cụ thúc đẩy doanh thu (Monetization Driver), được thiết kế theo công thức:
- **Thành phần:** 2 Core Mechanics + 4-6 Secondary Mechanics đã học + 1 Quả Bom đếm ngược / Cổng hầm ngầm.
- **Mục tiêu tải lượng:** 1.200 - 1.800 blocks, giới hạn lượt bắn gắt gao (Tight Move Limit).
- **Kỳ vọng hành vi:** Ép người chơi sử dụng ít nhất 1-2 Boosters (`Claw`, `Hand`, `Shuffle` hoặc `Super Shooter`) hoặc xem Quảng cáo hồi lượt (Rewarded Video Retry) để hoàn thành.

### 5.3. Checklist Kiểm Thử Level (Difficulty Validation Checklist)
- [ ] Level có nằm trong khung TPTC chuẩn không? (Nếu là màn Teach, có chứa mechanic chưa học khác không? ➔ Nếu có: **REJECT**).
- [ ] Mật độ Mechanic có vượt quá Density Cap me không? (Màn Normal > 4 mechanics ➔ **REJECT**).
- [ ] Số lượng khối block có bị vọt quá 100% so với level trước không? (Ví dụ L30 600 blocks ➔ L31 1.500 blocks ➔ **REJECT**).
- [ ] Đã có màn Relief ngay sau màn SuperHard chưa? (Nếu L20 SuperHard ➔ L21 vẫn là SuperHard ➔ **REJECT**).
- [ ] Các Mechanic xuất hiện có thuộc đúng **Micro Cluster** đại diện của level đó không?

---
*Tài liệu này là chuẩn mực thiết kế Level Design chính thức áp dụng cho dự án Hole Em All (Pixel Hunt Core).*
