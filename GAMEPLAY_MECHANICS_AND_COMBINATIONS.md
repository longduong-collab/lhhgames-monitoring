# TÀI LIỆU ĐẶC TẢ LOGIC GAMEPLAY, CƠ CHẾ VẬN HÀNH & MA TRẬN PHỐI HỢP (COMBINE)
## Dự án: Hole Em All — Core Gameplay Pixel Ball (Chủ đề: Logistics & Parcel Shipping)
**Phiên bản:** 3.0 (Narrative Overhaul & Loader Stack Dynamic Intent)  
**Tác giả:** Game Design Team  

---

## 📑 MỤC LỤC
1. [Bối Cảnh Chủ Đề & Core Gameplay Loop (Chủ Đề Vận Chuyển Hàng)](#1-bối-cảnh-chủ-đề--core-gameplay-loop-chủ-đề-vận-chuyển-hàng)
2. [Các Cơ Chế Trên Bức Tranh Pixel Art (Parcel Block Mechanics)](#2-các-cơ-chế-trên-bức-tranh-pixel-art-parcel-block-mechanics)
   - [2.1. Cơ Chế Loader Stack (Phun Thùng Lấp Chỗ Trống)](#21-cơ-chế-loader-stack-phun-thùng-lấp-chỗ-trống-)
   - [2.2. Các Cơ Chế Khác Trên Bức Tranh Pixel Art](#22-các-cơ-chế-khác-trên-bức-tranh-pixel-art)
3. [Chi Tiết Cơ Chế Hoạt Động Của Dàn Xe Tải & Bãi Đỗ (Truck Fleet)](#3-chi-tiết-cơ-chế-hoạt-động-của-dàn-xe-tải--bãi-đỗ-truck-fleet)
   - [3.1. Nhóm 1: Cơ Chế Biến Đổi Xe Tải (Truck Modifiers)](#31-nhóm-1-cơ-chế-biến-đổi-xe-tải-truck-modifiers)
   - [3.2. Nhóm 2: Các Loại Xe Tải & Chướng Ngại Đặc Biệt (Special Trucks & Spawners)](#32-nhóm-2-các-loại-xe-tải--chướng-ngại-đặc-biệt-special-trucks--spawners)
4. [Trọng Tâm Tư Duy & Áp Lực Chiến Thuật (Core Logistics Tension)](#4-trọng-tâm-tư-duy--áp-lực-chiến-thuật-core-logistics-tension)
5. [Nguyên Tắc Lựa Chọn Khi Combine & Bộ Lọc Anti-Patterns](#5-nguyên-tắc-lựa-chọn-khi-combine--bộ-lọc-anti-patterns)
6. [DANH MỤC TOÀN BỘ CÁC BỘ COMBINE 2 MECHANICS KHẢ THI (DUAL COMBOS)](#6-danh-mục-toàn-bộ-các-bộ-combine-2-mechanics-khả-thi-dual-combos)
7. [DANH MỤC TOÀN BỘ CÁC BỘ BA COMBINE KHẢ THI (3-MECHANIC TRIADS — HARD ..5)](#7-danh-mục-toàn-bộ-các-bộ-ba-combine-khả-thi-3-mechanic-triads--hard-5)
8. [DANH MỤC TOÀN BỘ CÁC BỘ TỨ COMBINE KHẢ THI (4-MECHANIC QUADS — SUPER HARD ..0)](#8-danh-mục-toàn-bộ-các-bộ-tứ-combine-khả-thi-4-mechanic-quads--super-hard-0)
9. [DANH MỤC CÁC BỘ MEGA CLIMAX (5-MECHANIC COMBOS — PEAK SINK MỖI 50 LEVELS)](#9-danh-mục-các-bộ-mega-climax-5-mechanic-combos--peak-sink-mỗi-50-levels)
10. [Bảng Ma Trận Tương Thích Toàn Diện (Full Synergy Matrix)](#10-bảng-ma-trận-tương-thích-toàn-diện-full-synergy-matrix)

---

## 1. BỐI CẢNH CHỦ ĐỀ & CORE GAMEPLAY LOOP (CHỦ ĐỀ VẬN CHUYỂN HÀNG)

### 🚚 Câu chuyện & Góc nhìn mới:
Game lấy bối cảnh **Trung tâm Điều Phối Vận Chuyển Hàng Hóa (Logistics Cargo Hub)**.
- **Bức tranh Pixel Art:** Là một kho hàng khổng lồ được tạo nên từ **hàng trăm công nhân ôm các thùng hàng bưu kiện màu sắc** (`[0..35]`) xếp thành bức tranh nghệ thuật.
- **Bến Bốc Hàng (Loading Dock / Tray):** Gồm **4 đến 5 khoang chờ**. Xe tải từ bãi đỗ sẽ chạy lên bến này để tiếp nhận hàng.
- **Hành động Bốc Hàng:** **Người ôm thùng hàng có màu tương ứng ở rìa ngoài kho sẽ tự động chạy vào thùng xe**. 
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PIXEL PARCEL ART (Kho Hàng Bưu Kiện)                      │
│     Đội ngũ công nhân ôm thùng hàng màu [0..35] xếp thành bức tranh pixel nghệ thuật   │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           ▲
                                           │ (Công nhân ôm thùng hàng ở rìa tự chạy lên xe cùng màu)
                                           │
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              LOADING DOCK (Bến Bốc Hàng: 4 - 5 Khoang)                 │
│  • Nơi xe tải đỗ để nhận người ôm thùng hàng.                                          │
│  • Khi xe nhận ĐỦ SỐ LƯỢNG THÙNG (Capacity = 0) ──► Xe lập tức KHỞI HÀNH rời bến.     │
│  • Nếu KÍN TẤT CẢ KHOANG mà KHÔNG CÓ XE NÀO CÓ MÀU TRÙNG VỚI HÀNG Ở RÌA                │
│    ──► NGHẼN BẾN (DEADLOCK) ──► THUA CUỘC.                                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           ▲
                                           │ (Người chơi điều phối xe ở hàng đầu bãi đỗ lên bến)
                                           │
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              TRUCK YARD (Bãi Đỗ Xe Tải Chờ Lệnh)                       │
│     Các xe tải chở hàng xếp theo làn đường có chiều sâu; xe sau bị xe trước chặn lối   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Quy tắc Game Loop 3 bước chuẩn xác:
1. **Tại Bãi Đỗ Xe (Truck Yard):**
   - Chỉ những xe tải ở **hàng đầu tiên** không bị xe khác hoặc chốt chặn cản đường (`isReadyToClick == true`) mới có thể được người chơi điều động.
   - Khi click, xe tải nổ máy chạy lên **Bến Bốc Hàng (Loading Dock)**.
2. **Tại Bến Bốc Hàng (Loading Dock):**
   - Bến có sức chứa **4 đến 5 khoang xe**.
   - Xe tải vừa vào khoang sẽ kiểm tra xem ở **mép ngoài cùng của kho hàng** có công nhân nào đang ôm **thùng hàng cùng màu** (`type`) với xe hay không:
     - **Nếu Có:** Các công nhân ôm thùng hàng cùng màu đó sẽ lần lượt chạy ùa vào thùng xe (`CurrentCapacity -= 1`), giải phóng các ô vị trí trên tranh theo thuật toán loang BFS.
     - **Nếu Chưa Có:** Xe đứng yên tại khoang, **chiếm dụng 1 khoang chờ** cho đến khi các xe khác bốc xong lớp ngoài để lộ ra màu hàng mà nó cần.
   - Khi xe nhận đủ số lượng thùng hàng thiết kế (`CurrentCapacity == 0`), xe tải lập tức **khởi hành xuất bến**, giải phóng lại 1 khoang trống trên bến.
3. **Điều Kiện Thắng / Thua:**
   - 🏆 **THẮNG (Clear):** Toàn bộ công nhân và thùng hàng trên bức tranh được bốc hết lên xe xuất bến ($100\%$).
   - 💀 **THUA (Deadlock):** Bến bốc hàng bị **lấp đầy kín mọi khoang** nhưng **không có chiếc xe nào trên bến nhận màu của các thùng hàng đang đứng chờ ở rìa kho** $\rightarrow$ Hàng không thể bốc, xe không thể xuất bến $\rightarrow$ Đình trệ toàn bộ trung tâm vận chuyển.

---

## 2. CÁC CƠ CHẾ TRÊN BỨC TRANH PIXEL ART (PARCEL BLOCK MECHANICS)

### 2.1. Cơ Chế Loader Stack (Phun Thùng Lấp Chỗ Trống) 📦

`Loader Stack` là một **cơ chế nâng cao nằm trên chính bức tranh Pixel Art** (không nằm ở bãi xe).

```
  [BƯỚC 1: BỐC HÀNG]                 [BƯỚC 2: STACK PHUN THÙNG]           [KẾT QUẢ Ý ĐỒ]
 Công nhân ôm thùng vàng             Loader Stack nằm phía sau            Dải màu vàng tái lập,
  chạy lên Xe Tải vàng               lập tức BẮN THÙNG HÀNG RA            buộc xe phải gom tiếp
 ┌───┬───┬───┐                      ┌───┬───┬───┐                        ┌───┬───┬───┐
 │ 📦│ 📦│ 📦│ ──► (Chạy lên xe) ──►│ 💥│ 💥│ 💥│ ──► (Lấp chỗ trống) ──►│ 📦│ 📦│ 📦│
 └───┴───┴───┘                      └───┴───┴───┘                        └───┴───┴───┘
```

#### A. Logic vận hành thực tế:
- Khi người chơi điều một xe tải lên bến bốc hàng, xe bắt đầu thu hút các công nhân ôm thùng hàng ở dải ngoài chạy vào thùng xe.
- Đáng lẽ khi công nhân chạy đi, mảng màu đó sẽ biến mất và lộ ra lớp màu bên trong. **Tuy nhiên, nếu bên dưới/bên cạnh có khối `Loader Stack`**, cỗ máy này sẽ lập tức **bắn/nhả ra một đợt thùng hàng mới lấp đầy lại đúng các ô vừa trống**!
- Điều này khiến dải màu cũ được tái lập ngay lập tức, ngăn không cho lớp màu bên trong lộ diện cho đến khi toàn bộ số thùng hàng dự trữ trong `Loader Stack` bị tiêu thụ hết.

#### B. 4 Ý Đồ Thiết Kế Chiến Thuật Của `Loader Stack`:
1. **Tạo Đợt Sóng Hàng Hóa Bất Ngờ (Cargo Surge Wave):**
   - *Ý đồ:* Người chơi nhìn thấy trên map chỉ có 4 kiện hàng màu Xanh, tưởng rằng 1 xe tải tải trọng 4 là bốc sạch. Nhưng khi bốc xong 4 kiện, Stack lại phun thêm 4 kiện nữa $\rightarrow$ Ép người chơi phải chuẩn bị sẵn **2 xe tải màu Xanh** liên tiếp hoặc điều phối xe có tải trọng lớn.
2. **Phá Vỡ Tính Toán Ăn Liền (Disrupt Instant Clearing):**
   - *Ý đồ:* Ngăn người chơi "ăn thông" vào lớp lõi bên trong quá sớm. Stack đóng vai trò như một chiếc van điều tiết nhịp độ, buộc người chơi phải kiên nhẫn bốc hết các đợt hàng phụ trước khi chạm vào màu cốt lõi.
3. **Bẫy Nghẽn Khoang Chờ (Dock Capacity Trap):**
   - *Ý đồ:* Kết hợp giữa `Loader Stack` và `Connected Trucks ⭐`. Xe đôi chiếm 2 khoang bến tưởng chừng sẽ giải phóng đường đi, nhưng Stack phun thêm hàng làm xe thứ hai chưa thể đón hàng ngay $\rightarrow$ Đẩy người chơi vào thế ngàn cân treo sợi tóc.
4. **Cảm Giác Bốc Hàng Liên Hoàn (High Tactile Loading Rush):**
   - *Ý đồ:* Khi một chiếc xe tải công suất lớn đứng trên bến, Stack phun hàng ra đến đâu, công nhân chạy liên tục vào xe đến đó $\rightarrow$ Tạo hiệu ứng thị giác và âm thanh dồn dập cực kỳ thỏa mãn (WOW Moment).

---

### 2.3. Các Cơ Chế Khác Trên Bức Tranh Pixel Art

- **`Hard Parcel` (Kiện Hàng Quá Khổ 🛡️):** Kiện hàng lớn $2\times2$ hoặc $3\times3$ cần cả một nhóm công nhân phối hợp bốc nhiều lượt mới nâng lên xe được $\rightarrow$ Nơi tiêu thụ tải trọng cho các xe tải hạng nặng.
- **`Solid Wood` (Kiện Hàng Đóng Thùng Gỗ 🪵):** Thùng gỗ kiên cố cản đường, công nhân không thể di chuyển qua hướng này $\rightarrow$ Ép người chơi phải điều xe bốc các kiện hàng bên cánh hông để dọn đường vòng.
- **`Mystery Parcel` (Kiện Hàng Chưa Dán Nhãn ❓):** Kiện hàng bọc kín, chỉ khi các công nhân xung quanh đã bốc hàng chạy đi thì nhãn màu thực sự của kiện hàng mới lộ diện.

---

## 3. CHI TIẾT CƠ CHẾ HOẠT ĐỘNG CỦA DÀN XE TẢI & BÃI ĐỖ (TRUCK FLEET)

---

### 3.1. Nhóm 1: Cơ Chế Biến Đổi Xe Tải (Truck Modifiers)

#### 1. `ShooterMechanicUnknow` (Xe Tải Ẩn Tem Màu 🕶️)
- **Cơ chế:** Khi đứng sâu trong bãi đỗ, thùng xe hiển thị dấu `?`, chưa rõ sẽ tiếp nhận hàng màu gì.
- **Kích hoạt:** Chỉ khi tiến lên **hàng đầu tiên**, tem màu và tải trọng của xe mới hiển thị.
- **Tác động:** Buộc người chơi phải quan sát viền xe hoặc giữ bến bốc hàng luôn có chỗ trống để sẵn sàng tiếp nhận xe bất kỳ.

#### 2. `ShooterMechanicLinked` (Xe Tải Nối Toa Đôi ⭐)
- **Cơ chế:** Hai chiếc xe tải nối liền nhau bằng khớp nối kéo.
- **Kích hoạt:** Click 1 xe thì **cả 2 xe cùng chạy lên bến bốc hàng một lúc** $\rightarrow$ Chiếm trọn **2 khoang bến**.
- **Tác động:** Thách thức quản lý khoang bến cực hạn. Nếu 1 trong 2 xe không có hàng bốc ngay, bến bốc hàng 4 khoang chỉ còn lại 2 khoang cơ động.

#### 3. `ShooterMechanicIce` (Xe Tải Đóng Băng Động Cơ ❄️)
- **Cơ chế:** Xe tải bị đóng băng két nước/động cơ với độ cứng $N$.
- **Kích hoạt:** Khi lên bến, xe **chưa thể nhận hàng ngay**. Mỗi khi có một xe tải khác bốc đủ hàng và xuất bến, động cơ ấm dần lên (giảm 1 bậc). Khi đủ $N$ lượt xuất bến, xe mới rã băng và mở thùng nhận hàng.
- **Tác động:** Chiếm dụng 1 khoang bến tĩnh trong suốt $N$ lượt, ép người chơi phải tính toán vòng xoay của các xe khác.

#### 4. `ShooterMechanicCurtains` (Bạt Phủ Góc Bãi Đỗ 🎪)
- **Cơ chế:** Tấm bạt che phủ kín **cụm xe tải $2\times2$** trong bãi đỗ.
- **Kích hoạt:** Sau khi người chơi điều động đủ $N$ chuyến xe bên ngoài bạt, bạt tự động kéo lên, mở khóa cùng lúc 4 xe tải bên dưới.
- **Tác động:** Ẩn giấu một phân khu bãi đỗ ở đầu trận, mở rộng phương án điều phối ở giữa trận.

---

### 3.2. Nhóm 2: Các Loại Xe Tải & Chướng Ngại Đặc Biệt (Special Trucks & Spawners)

#### 1. `ShooterBomb` (Xe Hàng Hỏa Tốc Hẹn Giờ 💣)
- **Cơ chế:** Xe tải chở đơn hàng khẩn cấp có đồng hồ đếm ngược $N$ lượt (Fuse).
- **Kích hoạt:** Mỗi lần người chơi điều động **bất kỳ xe nào** lên bến, số đếm giảm 1.
- **Tác động:** **Áp lực giao hàng hỏa tốc.** Nếu số đếm về 0 mà xe chưa được đưa lên bến để bốc hàng xuất bến $\rightarrow$ **Trễ đơn, thua cuộc ngay lập tức.**

#### 2. `ShooterKeyLong` (Barie / Then Chắn Cơ Học 🗝️)
- **Cơ chế:** Thanh chắn barie dài nằm ngang hoặc dọc đè lên đầu nhiều làn xe tải phía sau.
- **Kích hoạt:** Người chơi click để thanh barie trượt rút ra mép bãi đỗ, giải phóng toàn bộ các làn xe đang bị chặn.
- **Tác động:** Nút thắt phân luồng giao thông bãi đỗ.

#### 3. `ShooterKey` & `ShooterLock` (Cặp Xe Tải Khóa Xích & Chìa Khóa 🔑)
- **Cơ chế:** Xe Tải Khóa (`ShooterLock`) bị xích bánh xe, không thể di chuyển.
- **Kích hoạt:** Phải điều động Xe Tải Chìa Khóa (`ShooterKey`) lên bến trước $\rightarrow$ Mở khóa bánh cho Xe Khóa $\rightarrow$ Xe Khóa sẵn sàng lăn bánh.
- **Tác động:** Chuỗi nhiệm vụ điều phối tiền đề: *Mở Khóa Xe Tải Chủ Lực*.

#### 4. `ShooterPipe` (Cầu Cẩu Cấp Xe Tuần Tự FIFO 🧪)
- **Cơ chế:** Một cầu cẩu cấp xe cố định chứa hàng đợi xe tải bên trong theo thứ tự *Vào trước - Ra trước*.
- **Kích hoạt:** Mỗi khi ô bãi đỗ trước miệng cầu cẩu trống, cầu cẩu sẽ hạ 1 xe tải mới xuống tiếp ứng.
- **Tác động:** Nguồn cấp xe đều đặn theo hàng đơn.

#### 5. `ShooterTunnel` (Hầm Ngầm Xuất Xe Tự Động 🚇)
- **Cơ chế:** Cửa hầm ngầm kết nối với kho xe dự trữ lớn dưới lòng đất.
- **Kích hoạt:** Bất cứ khi nào bãi đỗ xuất hiện **bất kỳ ô trống nào**, hầm ngầm sẽ lập tức đẩy 1 xe tải mới trồi lên lấp kín ô đó. Khi kho ngầm hết xe, công trình hầm sập biến mất, trả lại mặt bằng thông thoáng.
- **Tác động:** Nguồn tiếp ứng xe diện rộng, vừa tạo áp lực "lấp kín lối đi" vừa đem lại cảm giác giải phóng lớn khi cạn xe.

#### 6. `ShooterWall` (Vách Bê Tông Bãi Đỗ 🧱)
- **Cơ chế:** Tường phân làn cố định, uốn nắn luồng di chuyển của dàn xe tải theo thiết kế.

---

## 4. TRỌNG TÂM TƯ DUY & ÁP LỰC CHIẾN THUẬT (CORE LOGISTICS TENSION)

Mọi màn chơi trong Pixel Ball đều xoay quanh sự giằng co giữa **3 trục áp lực**:

1. **Trục Mở Hàng Rìa Kho (Parcel Exposure):** Công nhân ôm thùng màu gì đang đứng ở rìa ngoài? $\rightarrow$ Quyết định màu xe tải nào được phép lên bến.
2. **Trục Ngân Sách Khoang Bến (Dock Slot Budget):** Bến chỉ có 4–5 khoang. Mỗi quyết định đưa 1 xe chưa thể bốc hàng ngay lên bến là một canh bạc làm nghẽn bến.
3. **Trục Giải Phóng Bãi Đỗ (Depot Traffic Routing):** Làm sao lái được chiếc xe tải cần thiết ở hàng sâu khi các chướng ngại *Barie, Xe Băng, Xe Đôi, Đơn Hỏa Tốc, Hầm Ngầm* đang chặn lối?

---

## 5. NGUYÊN TẮC LỰA CHỌN KHI COMBINE & BỘ LỌC ANTI-PATTERNS

### 5.1. Bộ Lọc Thiết Kế: Loại Bỏ Các Kết Hợp Xấu (Anti-Patterns)
- ❌ **Loại bỏ `Pipe` + `Tunnel` trên cùng phân khu:** Hai nguồn sinh xe liên tục làm tràn bãi đỗ, tước đoạt quyền kiểm soát của người chơi (Loss of Agency).
- ❌ **Loại bỏ `Curtains` + `Hidden` trên cùng cụm xe:** Quá nhiều lớp che giấu biến game giải đố trí tuệ thành trò "đoán mò may rủi" (RNG).
- ❌ **Loại bỏ `Frozen` + `Bomb` (đứng độc lập không có xe đệm):** Xe bị đóng băng chiếm khoang bến trong khi đơn hỏa tốc đếm ngược rất dễ tạo ra "cái chết tức tưởi không thể tránh" (Unfair Soft-lock).
- ❌ **Loại bỏ `Long Key` + `Key & Lock` trên cùng một làn xe:** Trùng lặp logic "khóa & mở" gây thừa thãi và rối mắt.

### 5.2. Cấu Trúc Phân Tầng Phối Hợp
| Cấp độ Màn | Số Mechanic Combine | Cấu trúc Phối hợp (Archetype Formula) |
|---|:---:|---|
| **Normal (Thường)** | **2 Mechanics** | `1 Core / Blocker` + `1 Secondary Pressure` |
| **Hard (..5)** | **3 Mechanics (Triad)** | `1 Blocker` + `1 Urgency/Pressure` + `1 Slot/Info Modifier` |
| **SuperHard (..0)** | **4 Mechanics (Quad)** | `1 Gatekeeper` + `1 Urgency` + `1 Information` + `1 Slot Constraint` |
| **Peak Sink (Mỗi 50 lvls)** | **5 Mechanics** | **Mega Puzzle:** Toàn bộ hệ thống cơ chế phối hợp đa tầng (Resource Sink) |

---

## 6. DANH MỤC TOÀN BỘ CÁC BỘ COMBINE 2 MECHANICS KHẢ THI (DUAL COMBOS)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        4 HỌ CHỦ ĐỀ KẾT HỢP ĐÔI (DUAL COMBOS)                           │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ HỌ A: ÁP LỰC HỎA TỐC     │ HỌ B: NGÂN SÁCH KHOANG   │ HỌ C: NHỊP ĐỘ & THÔNG TIN        │
│ (Time & Urgency - Bomb)  │ (Slot & Traffic - Conn.) │ (Flow & Info - Ice/Curt/Hidden)  │
├──────────────────────────┴──────────────────────────┴──────────────────────────────────┤
│ HỌ D: ĐIỀU PHỐI KHÔNG GIAN & ĐỊNH TUYẾN (Spatial & Routing - Long Key/Tunnel/Pipe/Wall) │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.1. Họ A: Áp Lực Hỏa Tốc & Thời Gian (Time & Urgency — Bomb Based)

#### 1. `Bomb 💣` + `Long Key 🗝️` — **The Urgent Clearance (Gỡ Đơn Hỏa Tốc Sau Barie)**
- **Cơ chế tương tác:** Xe chở đơn hàng hỏa tốc ($N$ lượt) bị nhốt sau thanh chắn barie Long Key.
- **Ý đồ thiết kế:** Ép người chơi phải ưu tiên dọn đường rút barie trước khi đơn hàng bị trễ hạn.
- **Độ khó:** Hard (L95 - L130).

#### 2. `Bomb 💣` + `Connected ⭐` — **The Tandem Rush (Chuyến Xe Đôi Hỏa Tốc)**
- **Cơ chế tương tác:** Xe chở đơn hỏa tốc hoặc xe dọn đường là một cặp xe nối đôi (Linked).
- **Ý đồ thiết kế:** Đánh đổi khoang bến. Người chơi phải hy sinh cùng lúc 2 khoang bến để đưa xe vào nhận hàng hỏa tốc kịp giờ.
- **Độ khó:** Hard (L92 - L140).

#### 3. `Bomb 💣` + `Tunnel 🚇` — **The Underground Dispatch (Đơn Hỏa Tốc Từ Hầm Ngầm)**
- **Cơ chế tương tác:** Xe từ hầm Tunnel trồi lên bất ngờ mang theo đơn hàng hỏa tốc đếm ngược.
- **Ý đồ thiết kế:** Đổi nhịp bất ngờ (Pacing Shock). Chuyển trạng thái trung tâm logistics sang "Chế độ khẩn cấp".
- **Độ khó:** Hard / SuperHard (L200+).

#### 4. `Bomb 💣` + `Curtains 🎪` — **The Blind Rush (Báo Động Sau Bạt Phủ)**
- **Cơ chế tương tác:** Bạt phủ $2\times2$ mở ra sau $N$ lượt hé lộ một xe hàng hỏa tốc đang đếm ngược.
- **Ý đồ thiết kế:** Thử thách khả năng phản xạ và điều phối bến bốc hàng khi thông tin mới lộ diện.
- **Độ khó:** Hard (L145 - L180).

#### 5. `Bomb 💣` + `Key & Lock 🔑` — **The Locked Cargo Rush (Giải Cứu Xe Hỏa Tốc)**
- **Cơ chế tương tác:** Xe tải cần để bốc đơn hỏa tốc đang bị khóa bánh. Phải điều xe Chìa Khóa lên bến trước.
- **Ý đồ thiết kế:** Chuỗi nhiệm vụ 2 bước rõ ràng: *Tìm Chìa $\rightarrow$ Mở Khóa $\rightarrow$ Bốc Hàng Hỏa Tốc*.
- **Độ khó:** Hard (L165 - L190).

#### 6. `Bomb 💣` + `Pipe 🧪` — **The Conveyor Rush (Băng Chuyền Đơn Hỏa Tốc)**
- **Cơ chế tương tác:** Chiếc xe tải cần dùng nằm ở vị trí thứ 2 hoặc thứ 3 bên trong cầu cẩu Pipe.
- **Ý đồ thiết kế:** Ép người chơi phải điều động nhanh các xe đầu ống để kéo chiếc xe hỏa tốc ra ngoài.
- **Độ khó:** Hard (L125 - L160).

---

### 6.2. Họ B: Áp Lực Ngân Sách Khoang Bến & Bãi Đỗ (Slot & Traffic — Connected Based)

#### 7. `Connected ⭐` + `Frozen ❄️` — **The Dock Gridlock (Nghẽn Bến Bốc Hàng Cực Hạn)**
- **Cơ chế tương tác:** 1 cặp xe đôi và 1 xe tải đóng băng cùng xuất hiện.
- **Ý đồ thiết kế:** Quản lý ngân sách khoang bến. Bến 4 khoang chỉ còn 1 khoang tự do, đòi hỏi từng chuyến xe điều lên phải bốc được hàng ngay.
- **Độ khó:** Normal cao / Hard (L38 - L110).

#### 8. `Connected ⭐` + `Long Key 🗝️` — **The Heavy Convoy (Đoàn Xe Đôi Sau Barie)**
- **Cơ chế tương tác:** Thanh barie Long Key chặn đầu cặp xe tải nối đôi.
- **Ý đồ thiết kế:** Sau khi rút barie, người chơi phải chuẩn bị sẵn 2 khoang bến trống để đón cả 2 xe cùng lúc.
- **Độ khó:** Normal / Hard (L108 - L140).

#### 9. `Connected ⭐` + `Curtains 🎪` — **The Blind Tandem (Đoàn Xe Đôi Sau Bạt Phủ $2\times2$)**
- **Cơ chế tương tác:** Dưới bạt phủ $2\times2$ chứa 1 hoặc 2 cặp xe tải nối đôi.
- **Ý đồ thiết kế:** Kéo bạt tạo áp lực khoang bến tức thì. Người chơi phải dọn thoáng bến trước khi mở bạt.
- **Độ khó:** Normal / Hard (L142 - L170).

#### 10. `Connected ⭐` + `Key & Lock 🔑` — **The Chained Giant (Mở Khóa Cặp Xe Khủng)**
- **Cơ chế tương tác:** Ổ khóa xích chặt một cặp xe đôi mang tải trọng thùng hàng cực lớn.
- **Ý đồ thiết kế:** Phần thưởng chiến lược. Tìm chìa khóa để giải phóng cặp xe đôi dọn sạch mảng hàng lớn nhất trên kho.
- **Độ khó:** Hard (L163 - L195).

#### 11. `Connected ⭐` + `Hidden 🕶️` — **The Mystery Twin (Xe Đôi Ẩn Tem Màu)**
- **Cơ chế tương tác:** Cặp xe nối đôi có 1 xe bị ẩn tem màu `?`.
- **Ý đồ thiết kế:** Điều 1 xe đã biết màu lên bến và chấp nhận rủi ro xe đi kèm có màu chưa biết.
- **Độ khó:** Normal (L15 - L40).

#### 12. `Connected ⭐` + `Tunnel 🚇` — **The Twin Fleet Spawner (Hầm Bơm Xe Đôi)**
- **Cơ chế tương tác:** Xe từ hầm Tunnel trồi lên chiếm 2 ô bãi đỗ liền kề dạng xe đôi.
- **Ý đồ thiết kế:** Áp lực chiếm dụng mặt bằng bãi xe và tiêu hao khoang bến.
- **Độ khó:** Hard (L200+).

#### 13. `Connected ⭐` + `Pipe 🧪` — **The Tandem Feeder (Cầu Cẩu Cấp Xe Đôi)**
- **Cơ chế tương tác:** Cầu cẩu Pipe hạ xuống các cặp xe tải nối đôi.
- **Ý đồ thiết kế:** Nguồn tải trọng dồi dào nhưng đòi hỏi người chơi luôn duy trì tối thiểu 2 khoang bến trống.
- **Độ khó:** Hard (L124 - L155).

---

### 6.3. Họ C: Nhịp Độ & Khai Phá Thông Tin (Flow & Information — Frozen / Curtains / Hidden)

#### 14. `Frozen ❄️` + `Long Key 🗝️` — **The Cold Storage (Xe Đông Lạnh Sau Barie)**
- **Cơ chế tương tác:** Barie chặn đầu xe bị đóng băng động cơ.
- **Ý đồ thiết kế:** Trình tự 2 bước: Rút barie $\rightarrow$ Đưa xe đông lạnh lên bến và cho các xe khác xuất bến để làm ấm động cơ.
- **Độ khó:** Hard (L108 - L135).

#### 15. `Frozen ❄️` + `Pipe 🧪` — **The Frozen Feeder (Cầu Cẩu Đóng Băng)**
- **Cơ chế tương tác:** Chiếc xe tải đầu tiên ở miệng cầu cẩu bị đóng băng 3 lượt.
- **Ý đồ thiết kế:** Chặn nguồn tiếp ứng ở đầu trận. Rã băng xe đầu để kích hoạt chuỗi xe phía sau lăn bánh.
- **Độ khó:** Hard (L124 - L150).

#### 16. `Frozen ❄️` + `Tunnel 🚇` — **The Cryo Depot (Kho Ngầm Đông Lạnh)**
- **Cơ chế tương tác:** Xe trồi lên từ Tunnel bị đóng băng động cơ.
- **Ý đồ thiết kế:** Kiểm soát nhịp độ, ngăn người chơi bốc hàng quá nhanh từ hầm ngầm.
- **Độ khó:** Hard (L200+).

#### 17. `Frozen ❄️` + `Key & Lock 🔑` — **The Frozen Key (Chìa Khóa Trong Băng)**
- **Cơ chế tương tác:** Xe Tải mang Chìa Khóa bị đóng băng.
- **Ý đồ thiết kế:** Người chơi phải điều các xe khác xuất bến để rã băng chìa khóa trước khi mở xe khóa.
- **Độ khó:** Hard (L163 - L185).

#### 18. `Frozen ❄️` + `Curtains 🎪` — **The Stage Freeze (Bạt Che Xe Đông Lạnh)**
- **Cơ chế tương tác:** Dưới bạt phủ $2\times2$ có chứa xe tải bị đóng băng.
- **Ý đồ thiết kế:** Đòi hỏi người chơi tính toán số lượt xuất bến trước và sau khi kéo bạt.
- **Độ khó:** Hard (L142 - L175).

#### 19. `Curtains 🎪` + `Pipe 🧪` — **The Hidden Feeder (Cầu Cẩu Sau Bạt Phủ)**
- **Cơ chế tương tác:** Bạt phủ $2\times2$ che kín miệng cầu cẩu Pipe.
- **Ý đồ thiết kế:** Khám phá & Giải tỏa (WOW Moment). Kéo bạt để đón nhận nguồn xe tiếp ứng dồi dào.
- **Độ khó:** Normal / Hard (L142 - L165).

#### 20. `Curtains 🎪` + `Tunnel 🚇` — **The Phantom Tunnel (Cửa Hầm Sau Bạt Phủ $2\times2$)**
- **Cơ chế tương tác:** Cửa hầm Tunnel nằm ẩn dưới bạt phủ.
- **Ý đồ thiết kế:** Tạo tính bất ngờ khi kéo bạt và thấy hầm ngầm bắt đầu kích hoạt đẩy xe lên bãi.
- **Độ khó:** Hard (L200+).

#### 21. `Curtains 🎪` + `Long Key 🗝️` — **The Curtained Barrier (Barie Ẩn Giấu)**
- **Cơ chế tương tác:** Bạt che giấu điểm tựa trượt của thanh barie Long Key.
- **Ý đồ thiết kế:** Kéo bạt để tìm điểm rút barie giải phóng bãi đỗ.
- **Độ khó:** Hard (L142 - L180).

#### 22. `Curtains 🎪` + `Key & Lock 🔑` — **The Hidden Keymaster (Bạt Che Xe Chìa Khóa)**
- **Cơ chế tương tác:** Xe Tải Chìa Khóa nằm ẩn dưới bạt phủ $2\times2$.
- **Ý đồ thiết kế:** Hành trình tìm kiếm: *Kéo Bạt $\rightarrow$ Thấy Chìa $\rightarrow$ Mở Khóa Xe Chủ Lực*.
- **Độ khó:** Hard (L163 - L190).

#### 23. `Hidden 🕶️` + `Long Key 🗝️` — **The Blind Sluice (Rút Barie Soi Tem Màu)**
- **Cơ chế tương tác:** Barie đè lên các xe tải bị ẩn tem màu `?`.
- **Ý đồ thiết kế:** Rút barie để các xe tiến lên hàng đầu và hé lộ màu nhận hàng thật sự.
- **Độ khó:** Normal (L108 - L130).

#### 24. `Hidden 🕶️` + `Pipe 🧪` — **The Feeder Roulette (Cầu Cẩu Xe Ẩn Màu)**
- **Cơ chế tương tác:** Xe tải xếp hàng trong cầu cẩu Pipe bị ẩn tem màu.
- **Ý đồ thiết kế:** Thử thách khả năng ứng biến nhanh khi xe hạ xuống bãi đỗ.
- **Độ khó:** Normal / Hard (L124 - L150).

#### 25. `Hidden 🕶️` + `Tunnel 🚇` — **The Foggy Fleet (Hầm Ngầm Xe Ẩn Tem)**
- **Cơ chế tương tác:** Xe từ Tunnel trồi lên ở trạng thái ẩn tem màu `?`.
- **Ý đồ thiết kế:** Tăng độ kịch tính và hồi hộp khi bãi đỗ liên tục được lấp đầy bởi các xe bí ẩn.
- **Độ khó:** Hard (L200+).

#### 26. `Hidden 🕶️` + `Key & Lock 🔑` — **The Mystery Key (Chìa Khóa Ẩn Tem Màu)**
- **Cơ chế tương tác:** Xe mang chìa khóa bị ẩn tem màu nhận hàng.
- **Ý đồ thiết kế:** Người chơi biết đó là xe chìa khóa nhưng phải tính toán màu hàng khi đưa lên bến.
- **Độ khó:** Normal / Hard (L163 - L185).

---

### 6.4. Họ D: Điều Phối Không Gian & Định Tuyến (Spatial & Routing — Long Key / Tunnel / Pipe / Wall)

#### 27. `Long Key 🗝️` + `Tunnel 🚇` — **The Sluice Gate (Mở Cửa Xả Hầm Ngầm)**
- **Cơ chế tương tác:** Barie Long Key chắn ngang cửa hầm Tunnel.
- **Ý đồ thiết kế:** Nén áp lực $\rightarrow$ Xả xe liên hoàn. Rút barie để hầm ngầm bắt đầu phun xe ra bãi đỗ.
- **Độ khó:** Hard / SuperHard (L200+).

#### 28. `Long Key 🗝️` + `Pipe 🧪` — **The Gated Feeder (Barie Chặn Cầu Cẩu)**
- **Cơ chế tương tác:** Thanh barie Long Key chặn ngay trước miệng cầu cẩu Pipe.
- **Ý đồ thiết kế:** Khóa nguồn tiếp viện cho đến khi người chơi giải quyết xong bãi đỗ phụ.
- **Độ khó:** Hard (L124 - L150).

#### 29. `Key & Lock 🔑` + `Tunnel 🚇` — **The Vault in the Deep (Chìa Khóa Đáy Hầm Ngầm)**
- **Cơ chế tương tác:** Chiếc chìa khóa mở xe chủ lực nằm ở chiếc xe tải cuối cùng trong hầm Tunnel.
- **Ý đồ thiết kế:** Tạo mục tiêu dài hạn: Dọn sạch xe trong hầm để lấy chiếc chìa khóa quyết định.
- **Độ khó:** Hard (L200+).

#### 30. `Key & Lock 🔑` + `Pipe 🧪` — **The Feeder Vault (Chìa Khóa Trong Cầu Cẩu)**
- **Cơ chế tương tác:** Xe chìa khóa nằm sâu bên trong cầu cẩu Pipe.
- **Ý đồ thiết kế:** Ép người chơi phải điều các xe đầu cầu cẩu lên bến để kéo xe chìa khóa ra ngoài.
- **Độ khó:** Hard (L163 - L190).

#### 31. `Shooter Wall 🧱` + `Long Key 🗝️` — **The Warehouse Maze (Mê Cung Bãi Đỗ Barie)**
- **Cơ chế tương tác:** Vách ngăn chia bãi đỗ thành các khe hẹp, barie Long Key nằm chắn ngang khe.
- **Ý đồ thiết kế:** Thử thách tư duy hình học không gian thuần túy.
- **Độ khó:** Normal / Hard (L50 - L100).

#### 32. `Shooter Wall 🧱` + `Tunnel 🚇` — **The Channeled Logistics (Hành Lang Xe Hầm Ngầm)**
- **Cơ chế tương tác:** Vách ngăn định hướng các xe mới trồi lên từ Tunnel phải chạy theo một hành lang hẹp.
- **Ý đồ thiết kế:** Ngăn xe tràn lan bừa bãi, tạo luồng di chuyển có trật tự.
- **Độ khó:** Hard (L200+).

---

## 7. DANH MỤC TOÀN BỘ CÁC BỘ BA COMBINE KHẢ THI (3-MECHANIC TRIADS — HARD ..5)

Áp dụng cho các màn **Hard (..5)** hoặc **Mid-Boss Checkpoint**:

#### 1. `Long Key 🗝️` + `Connected ⭐` + `Shooter Bomb 💣`
- **Tên ý đồ:** **The High-Stakes Squeeze (Cân Não Kép)**
- **Mô hình tương tác:** `Long Key` chặn `Connected` $\rightarrow$ Xe thoát ra chiếm 2 khoang bến ngay lúc `Bomb` đếm ngược đơn hỏa tốc.
- **Ý đồ:** Thử thách tối thượng về tối ưu hóa từng khoang bến bốc hàng dưới áp lực thời gian.

#### 2. `Tunnel 🚇` + `Long Key 🗝️` + `Shooter Bomb 💣`
- **Tên ý đồ:** **Subterranean Rescue (Giải Cứu Từ Lòng Đất)**
- **Mô hình tương tác:** `Long Key` khóa xe mặt đất $\rightarrow$ Rút barie để kích hoạt `Tunnel` đẩy xe lên bốc đơn `Bomb` hỏa tốc.
- **Ý đồ:** Định tuyến bắt buộc (Forced Sequencing), tạo nhịp chơi nghẹt thở.

#### 3. `Pipe 🧪` + `Curtains 🎪` + `Shooter Bomb 💣`
- **Tên ý đồ:** **The Conveyor Bomb Squad (Biệt Đội Gỡ Đơn Sau Bạt)**
- **Mô hình tương tác:** `Curtains` $2\times2$ che giấu cầu cẩu `Pipe` $\rightarrow$ Kéo bạt để kéo xe nhận đơn `Bomb` ra ngoài.
- **Ý đồ:** Khám phá nhanh và xử lý khủng hoảng thời gian.

#### 4. `Key & Lock 🔑` + `Curtains 🎪` + `Shooter Bomb 💣`
- **Tên ý đồ:** **Hostage Rescue Infiltration (Đột Kích Mở Khóa Đơn Hỏa Tốc)**
- **Mô hình tương tác:** `Curtains` che giấu Xe Chìa Khóa `Key` $\rightarrow$ Kéo bạt lấy chìa mở `Lock` cho xe bốc đơn `Bomb`.
- **Ý đồ:** Chuỗi giải đố 3 bước kịch tính.

#### 5. `Connected ⭐` + `Frozen ❄️` + `Long Key 🗝️`
- **Tên ý đồ:** **The Frozen Deadbolt Gridlock (Bến Bốc Hàng Đóng Băng)**
- **Mô hình tương tác:** `Long Key` đè lên `Connected` và `Frozen`.
- **Ý đồ:** Bài toán quản lý khoang bến thuần túy: Bến chỉ có 4 khoang, người chơi phải xoay xở giữa xe đôi và xe đông lạnh.

#### 6. `Curtains 🎪` + `Key & Lock 🔑` + `Connected ⭐`
- **Tên ý đồ:** **Vault Infiltration (Đột Kích Kho Báu)**
- **Mô hình tương tác:** Kéo `Curtains` $\rightarrow$ Lấy `Key` $\rightarrow$ Mở khóa cặp xe đôi `Connected` mang tải trọng cực lớn.
- **Ý đồ:** Thỏa mãn tâm lý: *Khám phá $\rightarrow$ Tìm công cụ $\rightarrow$ Thưởng lớn*.

#### 7. `Pipe 🧪` + `Frozen ❄️` + `Hidden 🕶️`
- **Tên ý đồ:** **The Frozen Pipeline Mystery (Cầu Cẩu Băng Giá)**
- **Mô hình tương tác:** Miệng `Pipe` bị `Frozen` 3 lượt $\rightarrow$ Xe bên trong `Pipe` bị `Hidden` tem màu.
- **Ý đồ:** Giai đoạn 1 kiên nhẫn rã băng $\rightarrow$ Giai đoạn 2 xe trồi ra liên tục với tem màu bất ngờ.

#### 8. `Tunnel 🚇` + `Connected ⭐` + `Frozen ❄️`
- **Tên ý đồ:** **The Polar Express Spawner (Đoàn Xe Băng Nghẽn Bến)**
- **Mô hình tương tác:** `Tunnel` đẩy xe đôi `Connected` bị bọc trong lớp băng `Frozen` lên bãi.
- **Ý đồ:** Thử thách kiểm soát không gian bãi đỗ và khoang bến ở đẳng cấp cao.

#### 9. `Tunnel 🚇` + `Curtains 🎪` + `Long Key 🗝️`
- **Tên ý đồ:** **The Underground Stage Reveal (Màn Bạt Ga Ngầm)**
- **Mô hình tương tác:** Kéo `Curtains` $2\times2$ $\rightarrow$ Lộ ra `Long Key` $\rightarrow$ Rút barie kích hoạt `Tunnel`.
- **Ý đồ:** Mở rộng không gian bãi đỗ theo 2 tầng liên tiếp.

#### 10. `Long Key 🗝️` + `Pipe 🧪` + `Hidden 🕶️`
- **Tên ý đồ:** **The Blind Sluice Conveyor (Cầu Cẩu Xe Ẩn Tem Sau Barie)**
- **Mô hình tương tác:** `Long Key` chặn miệng `Pipe` chứa dàn xe `Hidden`.
- **Ý đồ:** Mở barie đón dòng xe ẩn tem, kiểm tra phản xạ ứng biến.

---

## 8. DANH MỤC TOÀN BỘ CÁC BỘ TỨ COMBINE KHẢ THI (4-MECHANIC QUADS — SUPER HARD ..0)

Dành riêng cho các mốc màn **SuperHard (..0)**:

#### 1. `Long Key 🗝️` + `Connected ⭐` + `Frozen ❄️` + `Shooter Bomb 💣`
- **Tên ý đồ:** **The Mastermind Grid (Ma Trận Toàn Diện)**
- **Cấu trúc 4 tầng:** `Long Key` (Không gian) $\rightarrow$ `Connected` (Khoang bến 2 slots) $\rightarrow$ `Frozen` (Thời gian chờ 3 lượt) $\rightarrow$ `Bomb` (Đơn hỏa tốc 8 lượt).
- **Ý đồ thiết kế:** Đòi hỏi người chơi phải tính toán chuẩn xác toàn bộ bàn cờ từ chuyến xe đầu tiên.

#### 2. `Tunnel 🚇` + `Curtains 🎪` + `Long Key 🗝️` + `Shooter Bomb 💣`
- **Tên ý đồ:** **The Subway Infiltration Crisis (Khủng Hoảng Ga Ngầm)**
- **Cấu trúc 4 tầng:** Kéo `Curtains` $2\times2$ $\rightarrow$ Thấy `Long Key` chắn cửa `Tunnel` $\rightarrow$ Rút barie để `Tunnel` đẩy xe lên nhận đơn `Bomb`.
- **Ý đồ thiết kế:** Màn chơi mang cấu trúc phiêu lưu điện ảnh (Cinematic Logistics Flow).

#### 3. `Curtains 🎪` + `Key & Lock 🔑` + `Connected ⭐` + `Shooter Bomb 💣`
- **Tên ý đồ:** **The Citadel Breach Protocol (Đột Kích Bốc Đơn Hỏa Tốc)**
- **Cấu trúc 4 tầng:** Kéo `Curtains` $\rightarrow$ Lấy `Key` $\rightarrow$ Mở khóa cặp xe đôi `Connected` $\rightarrow$ Dùng xe đôi bốc trọn kiện hàng `Bomb` khổng lồ.
- **Ý đồ thiết kế:** Cảm giác thỏa mãn cực độ khi giải cứu thành công xe chủ lực để hoàn thành đơn hàng.

#### 4. `Pipe 🧪` + `Long Key 🗝️` + `Frozen ❄️` + `Connected ⭐`
- **Tên ý đồ:** **The Heavy Industrial Pipeline (Dây Chuyền Vận Tải Hạng Nặng)**
- **Cấu trúc 4 tầng:** Rút `Long Key` giải phóng miệng `Pipe` $\rightarrow$ Cầu cẩu hạ xe đôi `Connected` bị `Frozen`.
- **Ý đồ thiết kế:** Bài toán quản lý khoang bến và lưu lượng xe ở độ khó cao nhất mà không cần yếu tố thời gian.

#### 5. `Tunnel 🚇` + `Long Key 🗝️` + `Connected ⭐` + `Hidden 🕶️`
- **Tên ý đồ:** **The Subterranean Shadow Fleet (Hạm Đội Xe Ngầm Bí Ẩn)**
- **Cấu trúc 4 tầng:** Rút `Long Key` $\rightarrow$ `Tunnel` phun các cặp xe đôi `Connected` bị `Hidden` tem màu.
- **Ý đồ thiết kế:** Màn chơi nhịp độ cao, đòi hỏi sự linh hoạt tối đa trước các màu sắc bất ngờ.

---

## 9. DANH MỤC CÁC BỘ MEGA CLIMAX (5-MECHANIC COMBOS — PEAK SINK MỖI 50 LEVELS)

Dành riêng cho các màn **PEAK Climax (Level 50, 100, 150, 200, 250...)** — Màn chơi tổng kết Chapter và tiêu thụ Booster:

#### 1. `Tunnel 🚇` + `Long Key 🗝️` + `Connected ⭐` + `Frozen ❄️` + `Shooter Bomb 💣` *(Signature Peak Level 100 & 200)*
- **Tên ý đồ:** **The Grand Chapter Climax (Đại Thử Thách Cuối Chương)**
- **Bố cục chiến trường 2 Cánh (Dual-Wing Layout):**
  - **Cánh Trái (Không gian & Khoang bến):** `Long Key` khóa chặt dàn xe `Connected`.
  - **Cánh Phải (Nguồn cấp & Đông lạnh):** `Tunnel` liên tục đẩy các xe bị `Frozen`.
  - **Trung Tâm (Tử huyệt):** Xe `Shooter Bomb` đếm ngược đơn hỏa tốc 10 lượt.
- **Ý đồ thiết kế:** Tổng kết toàn bộ kỹ năng người chơi đã học. Đỉnh cao hưng phấn và là nơi thúc đẩy sử dụng Booster (*Claw, Hand, Shuffle*) tự nhiên nhất.

#### 2. `Curtains 🎪` + `Pipe 🧪` + `Key & Lock 🔑` + `Connected ⭐` + `Shooter Bomb 💣` *(Signature Peak Level 150 & 250)*
- **Tên ý đồ:** **The Citadel Grand Assault (Đại Công Phá Trung Tâm Logistics)**
- **Bố cục chiến trường 3 Phân Khu:**
  - **Phân khu 1:** Bạt `Curtains` $2\times2$ che giấu toàn bộ cầu cẩu tiếp ứng `Pipe`.
  - **Phân khu 2:** Xe `Key & Lock` xích cặp xe đôi `Connected`.
  - **Phân khu 3:** Xe `Shooter Bomb` đếm ngược đơn hỏa tốc 9 lượt ở tiền tuyến.
- **Ý đồ thiết kế:** Đại tiệc phối hợp đa cơ chế, mang lại trải nghiệm mãn nhãn khi giải tỏa toàn bộ kho hàng.

---

## 10. BẢNG MA TRẬN TƯƠNG THÍCH TOÀN DIỆN (FULL SYNERGY MATRIX)

| Mechanic | Hidden 🕶️ | Connected ⭐ | Frozen ❄️ | Bomb 💣 | Long Key 🗝️ | Pipe 🧪 | Curtains 🎪 | Key/Lock 🔑 | Tunnel 🚇 | Wall 🧱 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Hidden 🕶️** | ❌ Trùng | ✅ Tốt | ✅ Tốt | ⚠️ Rủi ro | 🌟 Rất Tốt | 🌟 Rất Tốt | ❌ Quá Mù | ✅ Tốt | 🌟 Rất Tốt | ✅ Tốt |
| **Connected ⭐**| ✅ Tốt | ❌ Nghẽn | 🌟 Squeeze | 🌟 Căng thẳng | 🌟 Rất Tốt | ✅ Tốt | 🌟 Bất ngờ | 🌟 Rất Tốt | 🌟 Tốt | ✅ Tốt |
| **Frozen ❄️** | ✅ Tốt | 🌟 Squeeze | ❌ Chờ lâu | ❌ Bẫy chết | ✅ Tốt | 🌟 Rất Tốt | ✅ Tốt | 🌟 Rất Tốt | 🌟 Rất Tốt | ✅ Tốt |
| **Bomb 💣** | ⚠️ Rủi ro | 🌟 Căng thẳng | ❌ Bẫy chết | ❌ Loạn | 🌟 Hoàn Hảo | ✅ Tốt | 🌟 Đột kích | 🌟 Hoàn Hảo | 🌟 Hoàn Hảo | ✅ Tốt |
| **Long Key 🗝️**| 🌟 Rất Tốt | 🌟 Rất Tốt | ✅ Tốt | 🌟 Hoàn Hảo | ❌ Trùng | 🌟 Rất Tốt | ✅ Tốt | ❌ Trùng lặp | 🌟 Hoàn Hảo | 🌟 Rất Tốt |
| **Pipe 🧪** | 🌟 Rất Tốt | ✅ Tốt | 🌟 Rất Tốt | ✅ Tốt | 🌟 Rất Tốt | ❌ Trùng | 🌟 Hoàn Hảo | 🌟 Rất Tốt | ❌ Loạn sàn | ✅ Tốt |
| **Curtains 🎪** | ❌ Quá Mù | 🌟 Bất ngờ | ✅ Tốt | 🌟 Đột kích | ✅ Tốt | 🌟 Hoàn Hảo | ❌ Trùng | 🌟 Rất Tốt | 🌟 Rất Tốt | ✅ Tốt |
| **Key/Lock 🔑**| ✅ Tốt | 🌟 Rất Tốt | 🌟 Rất Tốt | 🌟 Hoàn Hảo | ❌ Trùng lặp | 🌟 Rất Tốt | 🌟 Rất Tốt | ❌ Trùng | 🌟 Hoàn Hảo | ✅ Tốt |
| **Tunnel 🚇** | 🌟 Rất Tốt | 🌟 Tốt | 🌟 Rất Tốt | 🌟 Hoàn Hảo | 🌟 Hoàn Hảo | ❌ Loạn sàn | 🌟 Rất Tốt | 🌟 Hoàn Hảo | ❌ Trùng | 🌟 Rất Tốt |
| **Wall 🧱** | ✅ Tốt | ✅ Tốt | ✅ Tốt | ✅ Tốt | 🌟 Rất Tốt | ✅ Tốt | ✅ Tốt | ✅ Tốt | 🌟 Rất Tốt | ❌ Trùng |

---
*Tài liệu được lưu trữ tại `clever-carson/GAMEPLAY_MECHANICS_AND_COMBINATIONS.md` phục vụ công tác thiết kế level và vận hành bộ công cụ Clever Carson.*
