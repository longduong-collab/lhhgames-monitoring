# Game Level Analytics & Pixel Art Tracker 🎮

Công cụ Web chuyên dụng cho Game Designer & Developer để:
1. **Import hàng loạt file JSON Level** (chọn file / kéo thả / trích xuất số level tự động qua regex).
2. **Trích xuất & Tính toán 15+ chỉ số Level** (Grid size, Active blocks, Fill ratio %, Unique types, Shooters & Slots breakdown, Total shots by type).
3. **Kiểm tra tính toàn vẹn (Invariant Verification)**: So khớp 100% giữa số blocks trên map và tổng số shots từ súng cho từng type. Tự động **bôi đỏ cảnh báo** toàn bộ hàng có lỗi invariant hoặc chứa type ngoài danh mục `[0..35]`.
4. **Bộ lọc & Sắp xếp động (Dynamic Filter & Sort)**: Lọc đa điều kiện AND theo bất kỳ property nào với toán tử thích ứng theo kiểu dữ liệu (số, boolean, chuỗi), hiển thị filter chip xoá nhanh, sort trực tiếp trên header bảng.
5. **Render Pixel Art Canvas**: Tái tạo hình ảnh pixel art từ `blockData` theo đúng 36 mã màu palette chuẩn của game, tự động co giãn kích thước, hỗ trợ bật/tắt lưới, xem tooltip chi tiết `(x, y, type, hex)` khi hover và chuyển nhanh Prev/Next giữa các level.

---

## 📁 Cấu trúc thư mục

```
level_tracker/
├── index.html                  # Giao diện chính (DOM semantic + ES module imports)
├── css/
│   └── style.css               # Dark theme hiện đại, responsive, gaming UI
├── js/
│   ├── palette.js              # Nguồn duy nhất định nghĩa 36 màu PALETTE (ID 0-35)
│   ├── jsonParser.js           # Parser & tính toán toàn bộ properties & invariants
│   ├── filterEngine.js         # Logic lọc đa điều kiện AND & sorting engine
│   ├── pixelArtRenderer.js     # Render Canvas pixel art, hover tooltip, export PNG
│   ├── tableRenderer.js        # Render bảng dữ liệu, cảnh báo đỏ, popups so khớp
│   ├── fileImport.js           # Xử lý File Input, Drag & Drop, đọc file JSON
│   └── app.js                  # Entry point & điều phối state toàn ứng dụng
└── sample_levels/              # Dữ liệu mẫu kiểm thử
    ├── 1.json                  # Level 1 chuẩn (11x20)
    ├── 2.json                  # Level 2 hình trái tim (9x9)
    ├── 3.json                  # Level 3 hình thanh kiếm (8x12)
    └── error_level.json        # Level mẫu có lỗi Invariant lệch & type 99 ngoài palette
```

---

## 🚀 Hướng dẫn khởi chạy

Do ứng dụng sử dụng **Native ES Modules** (`import` / `export`), bạn có thể chạy bằng một trong các cách sau:

### Cách 1: Sử dụng Python (khuyến nghị, có sẵn trên hầu hết các máy)
Chạy lệnh sau tại thư mục dự án:
```bash
python3 -m http.server 8080
```
Sau đó mở trình duyệt tại: `http://localhost:8080/level_tracker/` (hoặc `http://localhost:8080`)

### Cách 2: Sử dụng Node.js (npx serve hoặc http-server)
```bash
npx serve .
```

### Cách 3: Sử dụng VSCode Extension
- Cài đặt extension **Live Server** trên VSCode.
- Nhấn chuột phải vào `level_tracker/index.html` → chọn **Open with Live Server**.

---

## 🎨 Bảng mã màu Palette chuẩn (36 màu — ID 0-35)

| ID | Hex | ID | Hex | ID | Hex |
|---|---|---|---|---|---|
| **0** | `#F1383A` | **12** | `#FABFFC` | **24** | `#FF8F79` |
| **1** | `#FF8331` | **13** | `#1E7C1B` | **25** | `#26ACA5` |
| **2** | `#FFC917` | **14** | `#FFD58F` | **26** | `#274268` |
| **3** | `#30CFFF` | **15** | `#CE863F` | **27** | `#305D50` |
| **4** | `#2D64E6` | **16** | `#2DE6D0` | **28** | `#CAA317` |
| **5** | `#41EC19` | **17** | `#CA246B` | **29** | `#CDABCD` |
| **6** | `#278D49` | **18** | `#B9F4FA` | **30** | `#A1FFA1` |
| **7** | `#FF65CD` | **19** | `#A7E21D` | **31** | `#B0A89B` |
| **8** | `#A73CFF` | **20** | `#665DD2` | **32** | `#979CB4` |
| **9** | `#FFFFFF` | **21** | `#959597` | **33** | `#FFD2B4` |
| **10** | `#3F3F3F` | **22** | `#9A2538` | **34** | `#BE7B85` |
| **11** | `#79573D` | **23** | `#FA4B6F` | **35** | `#657842` |

`type = -1` là ô trống / nền trong suốt.
