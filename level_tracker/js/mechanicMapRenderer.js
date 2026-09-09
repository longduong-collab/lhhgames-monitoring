/**
 * mechanicMapRenderer.js
 * Hiển thị Timeline / Heatmap phân phối các Mechanic (Block Types & Shooter Types)
 * qua toàn bộ các Level trong game theo thứ tự Tutorial Unlock (Lvl 8 ➔ 150).
 * Sử dụng icon ảnh PNG trong ./assets/mechanics/ (có fallback emoji),
 * Hỗ trợ Ma trận Đề xuất Mới (Proposed LD Blueprint / TPTC Framework), Báo cáo Kiểm toán GD,
 * và tính năng Hover Inspector xem toàn bộ mechanics của từng level.
 */

import { getColor } from './palette.js';
import { calculatePixelArtBounds } from './pixelArtRenderer.js';

export const MECHANIC_DEFINITIONS = {
  block: {
    7: { id: 'b_7', type: 7, name: 'Loader Stack', icon: '🔫', iconPath: './assets/mechanics/block_loader_stack.png', category: 'SECONDARY', desc: 'BlockShooter (Súng phát sinh block khi bắn trúng)', tutLevel: 8, order: 1 },
    1: { id: 'b_1', type: 1, aliasTypes: [2, 3, 4], name: 'Hard Parcel Block', icon: '🧱', iconPath: './assets/mechanics/block_hard_parcel.png', category: 'SECONDARY', desc: 'BlockBig (Khối bưu kiện lớn đa hit 2x2, 2x3, 3x2, 3x3)', tutLevel: 30, order: 4 },
    8: { id: 'b_8', type: 8, name: 'Solid Wood Parcel', icon: '🛡️', iconPath: './assets/mechanics/block_wood_wall.png', category: 'SECONDARY', desc: 'BlockWall (Tường chắn gỗ bất hoại)', tutLevel: 41, order: 5 },
    6: { id: 'b_6', type: 6, name: 'Mystery Parcel', icon: '❓', iconPath: './assets/mechanics/block_mystery.png', category: 'SECONDARY', desc: 'BlockUnknown (Khối bí ẩn / Ẩn màu)', tutLevel: 50, order: 6 },
    5: { id: 'b_5', type: 5, name: 'Key Hunt Block', icon: '🔑', iconPath: './assets/mechanics/block_key.png', category: 'SECONDARY', desc: 'BlockKey (Khối chìa khoá)', tutLevel: 120, order: 12 },
  },
  shooter: {
    'connected': { id: 's_connected', type: 'connected', name: 'Connected Trucks', icon: '⭐', iconPath: './assets/mechanics/shooter_connected.png', category: 'CORE', desc: 'ShooterLinked (Xe liên kết di chuyển/bắn cùng nhau)', tutLevel: 10, order: 2 },
    'hidden': { id: 's_hidden', type: 'hidden', name: 'Hidden Truck', icon: '🕶️', iconPath: './assets/mechanics/shooter_hidden.png', category: 'CORE', desc: 'ShooterHidden (Xe ẩn màu ban đầu)', tutLevel: 23, order: 3 },
    'frozen': { id: 's_frozen', type: 'frozen', name: 'Frozen Truck', icon: '❄️', iconPath: './assets/mechanics/shooter_frozen.png', category: 'SECONDARY', desc: 'ShooterIce (Xe bị đóng băng cần giải cứu)', tutLevel: 60, order: 7 },
    'bomb_truck': { id: 's_bomb_truck', type: 'bomb_truck', name: 'Bomb Truck', icon: '💣', iconPath: './assets/mechanics/shooter_bomb.png', category: 'SECONDARY', desc: 'ShooterBomb (Xe bom nổ phá huỷ block xung quanh)', tutLevel: 70, order: 8 },
    'long_key': { id: 's_long_key', type: 'long_key', name: 'Long Key', icon: '🗝️', iconPath: './assets/mechanics/shooter_long_key.png', category: 'SECONDARY', desc: 'ShooterKeyLong (Xe chìa khóa dài mở cổng)', tutLevel: 80, order: 9 },
    'curtains': { id: 's_curtains', type: 'curtains', name: 'Curtains', icon: '🎪', iconPath: './assets/mechanics/shooter_curtains.png', category: 'SECONDARY', desc: 'ShooterCurtains (Rèm che khuất tầm nhìn xe)', tutLevel: 90, order: 10 },
    'pipe': { id: 's_pipe', type: 'pipe', name: 'Truck Pipe', icon: '🧪', iconPath: './assets/mechanics/shooter_pipe.png', category: 'SECONDARY', desc: 'ShooterPipe (Ống dẫn đoàn xe tiếp ứng)', tutLevel: 101, order: 11 },
    'key_truck': { id: 's_key', type: 'key_truck', name: 'Key Hunt Truck', icon: '🔒', iconPath: './assets/mechanics/shooter_key_truck.png', category: 'SECONDARY', desc: 'ShooterLock (Xe khóa)', tutLevel: 120, order: 13 },
    'tunnel': { id: 's_tunnel', type: 'tunnel', name: 'Truck Tunnel', icon: '🚇', iconPath: './assets/mechanics/shooter_tunnel.png', category: 'SITUATIONAL', desc: 'ShooterTunnel (Hầm xe bắn liên hoàn)', tutLevel: 150, order: 14 },
  },
};


export const MECHANIC_COLORS = {
  // Block mechanics
  'b_7':         { dot: '#f97316', bar: 'rgba(249, 115, 22, 0.85)' },    // Orange — Loader Stack
  'b_1':         { dot: '#8b5cf6', bar: 'rgba(139, 92, 246, 0.85)' },    // Purple — Hard Parcel
  'b_8':         { dot: '#64748b', bar: 'rgba(100, 116, 139, 0.85)' },   // Slate — Wood Wall
  'b_6':         { dot: '#a855f7', bar: 'rgba(168, 85, 247, 0.85)' },    // Violet — Mystery
  'b_5':         { dot: '#eab308', bar: 'rgba(234, 179, 8, 0.85)' },     // Yellow — Key Block
  'pair_key_hunt': { dot: '#f59e0b', bar: 'rgba(245, 158, 11, 0.85)' }, // Amber — Key Hunt (Lock & Key Pair)
  // Shooter mechanics
  's_connected': { dot: '#3b82f6', bar: 'rgba(59, 130, 246, 0.85)' },    // Blue — Connected
  's_hidden':    { dot: '#06b6d4', bar: 'rgba(6, 182, 212, 0.85)' },     // Cyan — Hidden
  's_frozen':    { dot: '#67e8f9', bar: 'rgba(103, 232, 249, 0.85)' },   // Light Cyan — Frozen
  's_bomb_truck':{ dot: '#ef4444', bar: 'rgba(239, 68, 68, 0.85)' },     // Red — Bomb Truck
  's_long_key':  { dot: '#f59e0b', bar: 'rgba(245, 158, 11, 0.85)' },    // Amber — Long Key
  's_curtains':  { dot: '#ec4899', bar: 'rgba(236, 72, 153, 0.85)' },    // Pink — Curtains
  's_pipe':      { dot: '#10b981', bar: 'rgba(16, 185, 129, 0.85)' },    // Emerald — Pipe
  's_key':       { dot: '#d97706', bar: 'rgba(217, 119, 6, 0.85)' },     // Amber dark — Key Truck
  's_tunnel':    { dot: '#6366f1', bar: 'rgba(99, 102, 241, 0.85)' },    // Indigo — Tunnel
};

export const BOOSTER_DEFINITIONS = {
  7:  { id: 'b_claw', name: 'Claw Booster', icon: '🧲', iconPath: './assets/mechanics/booster_claw.png', tutLevel: 7, desc: 'Gắp 1 block khẩn cấp khỏi bàn chơi' },
  13: { id: 'b_hand', name: 'Hand Booster', icon: '🖐️', iconPath: './assets/mechanics/booster_hand.png', tutLevel: 13, desc: 'Đổi vị trí 2 xe súng' },
  15: { id: 'b_shuffle', name: 'Shuffle Booster', icon: '🔀', iconPath: './assets/mechanics/booster_shuffle.png', tutLevel: 15, desc: 'Xáo trộn lại toàn bộ màu súng' },
  18: { id: 'b_super', name: 'Super Shooter Booster', icon: '🚀', iconPath: './assets/mechanics/booster_super.png', tutLevel: 18, desc: 'Biến 1 súng thành Súng Siêu Cấp bắn liên hoàn' }
};

export const MICRO_CLUSTERS = {
  A: { id: 'A', name: 'Áp lực không gian & Định tuyến', mechs: ['s_hidden', 's_connected', 'b_8', 's_curtains'] },
  B: { id: 'B', name: 'Xả đạn & Xúc giác giải tỏa', mechs: ['b_7', 'b_6', 's_frozen'] },
  C: { id: 'C', name: 'Chuỗi phụ thuộc & Giải đố khóa', mechs: ['s_connected', 'b_1', 's_long_key', 's_key', 'b_5'] },
  D: { id: 'D', name: 'Khẩn cấp & Quản lý hàng đợi', mechs: ['s_bomb_truck', 's_pipe', 's_frozen', 's_tunnel'] }
};

/**
 * Trả về Cụm chủ đề lối chơi (Micro Cluster) dựa vào Level Num và Macro Cycle
 */
export function getActiveClusterForLevel(levelNum) {
  if (levelNum < 20) return null; // Phase Onboarding chưa chia Cluster

  // Macro Cycle 1 (L20 - L50): Alternating A (Spatial) vs B (Tactile Burst)
  if (levelNum <= 50) {
    return (Math.floor(levelNum / 5) % 2 === 0) ? MICRO_CLUSTERS.A : MICRO_CLUSTERS.B;
  }
  // Macro Cycle 2 (L51 - L90): Alternating B (Tactile) vs C (Dependency) vs A
  if (levelNum <= 90) {
    const step = Math.floor(levelNum / 6) % 3;
    return step === 0 ? MICRO_CLUSTERS.B : (step === 1 ? MICRO_CLUSTERS.C : MICRO_CLUSTERS.A);
  }
  // Macro Cycle 3 (L91 - L140): Alternating D (Emergency Queue) vs C (Dependency) vs B
  if (levelNum <= 140) {
    const step = Math.floor(levelNum / 7) % 3;
    return step === 0 ? MICRO_CLUSTERS.D : (step === 1 ? MICRO_CLUSTERS.C : MICRO_CLUSTERS.B);
  }
  // Macro Cycle 4 (L141 - L200+): Rotating D -> A -> C -> B (Veteran Full Variety)
  const step = Math.floor(levelNum / 8) % 4;
  if (step === 0) return MICRO_CLUSTERS.D;
  if (step === 1) return MICRO_CLUSTERS.A;
  if (step === 2) return MICRO_CLUSTERS.C;
  return MICRO_CLUSTERS.B;
}

export const PROPOSED_BOOSTER_BLUEPRINT = [
  {
    id: 'bst_claw',
    name: 'Claw Booster',
    icon: '🧲',
    iconPath: './assets/mechanics/booster_claw.png',
    tier: 'BOOSTER',
    teachLevel: 7,
    intent: 'Cho phép gắp 1 khối bưu kiện khẩn cấp khỏi bàn chơi khi kẹt đường bắn.',
    behaviorChange: 'Hành vi Cứu nguy (Emergency Rescue): Giải tỏa tức thì tình huống bế tắc.'
  },
  {
    id: 'bst_hand',
    name: 'Hand Booster',
    icon: '🖐️',
    iconPath: './assets/mechanics/booster_hand.png',
    tier: 'BOOSTER',
    teachLevel: 13,
    intent: 'Đổi vị trí giữa 2 xe súng để thay đổi thứ tự ưu tiên xả đạn.',
    behaviorChange: 'Hành vi Điều chỉnh Vị trí (Positional Swap): Sắp xếp lại luồng xe.'
  },
  {
    id: 'bst_shuffle',
    name: 'Shuffle Booster',
    icon: '🔀',
    iconPath: './assets/mechanics/booster_shuffle.png',
    tier: 'BOOSTER',
    teachLevel: 15,
    intent: 'Xáo trộn ngẫu nhiên màu sắc của các súng chờ khi bị kẹt hết màu khớp.',
    behaviorChange: 'Hành vi Xóa cờ kẹt (Reroll State): Làm mới lựa chọn đạn.'
  },
  {
    id: 'bst_super',
    name: 'Super Shooter',
    icon: '🚀',
    iconPath: './assets/mechanics/booster_super.png',
    tier: 'BOOSTER',
    teachLevel: 18,
    intent: 'Kích hoạt Súng Siêu Cấp bắn dọn hàng loạt block không phân biệt màu.',
    behaviorChange: 'Hành vi Công phá Đỉnh cao (Mega Clear): Dọn dẹp diện rộng cho màn PEAK.'
  }
];

export const PROPOSED_MECHANIC_BLUEPRINT = [
  {
    id: 's_hidden',
    name: 'Hidden Truck',
    icon: '🕶️',
    iconPath: './assets/mechanics/shooter_hidden.png',
    tier: 'CORE',
    groupType: 'shooter',
    type: 'hidden',
    coreComboPartner: 's_connected',
    intent: 'Buộc player quan sát viền/pattern màu cần tìm, cân nhắc rủi ro (risk vs reward), ghi nhớ đường chọn xe.',
    behaviorChange: 'Hành vi A (Suy đoán & Khám phá): Chọn xe có suy tính thay vì click tự do; học cách suy đoán màu.',
    teachLevel: 8,
    practiceLevels: [9, 10, 11],
    testLevel: 12,
    combineStartLevel: 15,
    pacingNote: 'Dạy tại L8 (ngay trước mốc D1 retention risk L10), rèn luyện kỹ năng quan sát viền màu. Practice solo tại Super Hard L10.',
    riskMitigation: 'Giúp player hình thành thói quen quan sát ngay trước điểm rớt D1 (L10).'
  },
  {
    id: 's_connected',
    name: 'Connected Trucks',
    icon: '⭐',
    iconPath: './assets/mechanics/shooter_connected.png',
    tier: 'CORE',
    groupType: 'shooter',
    type: 'connected',
    coreComboPartner: 's_hidden',
    intent: '2 xe liên kết di chuyển cùng lúc, chiếm slot kép, dễ gây kẹt lane (stuck) nếu không nhìn trước 1 nước.',
    behaviorChange: 'Hành vi C (Quản lý slot & Tính toán): Quan sát slot và không gian chờ trước khi click; tính toán nước đi đôi.',
    teachLevel: 14,
    practiceLevels: [15, 16, 17],
    testLevel: 18,
    combineStartLevel: 20,
    pacingNote: 'Dạy tại L14 sau khi đã test xong Hidden ở L12. Climax Core Combine tại Super Hard L20.',
    riskMitigation: 'Tạo thử thách thú vị trước mốc D7 (L15-L20).'
  },
  {
    id: 'b_7',
    name: 'Loader Stack',
    icon: '🔫',
    iconPath: './assets/mechanics/block_loader_stack.png',
    tier: 'SECONDARY',
    groupType: 'block',
    type: 7,
    intent: 'Bắn trúng phát sinh block mới, tạo cảm giác tactile "xả đạn" liên tục đã tai đã mắt, giảm áp lực hết đạn.',
    behaviorChange: 'Hành vi B (Xả đạn & Xúc giác thỏa mãn): Tận hưởng nhịp xả đạn nhanh, giải tỏa căng thẳng sau màn khó.',
    teachLevel: 21,
    practiceLevels: [22, 23, 24],
    testLevel: 25,
    combineStartLevel: 28,
    pacingNote: 'Dạy tại L21 (Relief level ngay sau SuperHard L20) đóng vai trò Wow / Relief Mechanic. Test tại Hard L25.',
    riskMitigation: 'Cứu drop rate sau màn SuperHard đầu tiên (L20).'
  },
  {
    id: 'b_1',
    name: 'Hard Parcel Block',
    icon: '🧱',
    iconPath: './assets/mechanics/block_hard_parcel.png',
    tier: 'SECONDARY',
    groupType: 'block',
    type: 1,
    aliasTypes: [2, 3, 4],
    intent: 'Khối bưu kiện lớn nhiều hit (2x2, 3x3), đòi hỏi dồn nhiều lượt bắn cùng màu để phá vỡ.',
    behaviorChange: 'Hành vi C (Dồn tài nguyên & Tích trữ): Lên kế hoạch tích trữ đạn cùng màu để phá khối kiên cố.',
    teachLevel: 35,
    practiceLevels: [36, 37, 38],
    testLevel: 40,
    combineStartLevel: 42,
    pacingNote: 'Dạy tại L35 (giãn cách nhẹ củng cố Core), tăng dần tải lượng và test khối 3x3 tại SuperHard L40.',
    riskMitigation: 'Tạo milestone độ khó rõ ràng với quy tắc tăng dần tải lượng.'
  },
  {
    id: 'b_8',
    name: 'Solid Wood Parcel',
    icon: '🛡️',
    iconPath: './assets/mechanics/block_wood_wall.png',
    tier: 'SECONDARY',
    groupType: 'block',
    type: 8,
    intent: 'Tường gỗ bất hoại chặn đường đạn trực diện, ép player tìm hướng tiếp cận vòng từ bên hông hoặc phía sau.',
    behaviorChange: 'Hành vi D (Định tuyến không gian): Thay đổi tư duy định tuyến không gian (Spatial Routing).',
    teachLevel: 51,
    practiceLevels: [52, 53, 54],
    testLevel: 55,
    combineStartLevel: 58,
    pacingNote: 'Dạy tại L51 (Relief level ngay sau SuperHard L50) thay đổi tư duy sang Spatial Routing. Test tại Hard L55.',
    riskMitigation: 'Làm mới trải nghiệm giữa game, tạo nhịp thở mở đầu Act 2 ngay sau mốc L50.'
  },
  {
    id: 'b_6',
    name: 'Mystery Parcel',
    icon: '❓',
    iconPath: './assets/mechanics/block_mystery.png',
    tier: 'SECONDARY',
    groupType: 'block',
    type: 6,
    intent: 'Che giấu màu pixel bên trong, buộc người chơi dọn các pixel xung quanh để "lật mở" thông tin.',
    behaviorChange: 'Hành vi A (Suy đoán & Mở vùng biên): Khám phá và giải tỏa vùng biên trước khi chạm vào lõi bí ẩn.',
    teachLevel: 63,
    practiceLevels: [64, 65, 66],
    testLevel: 68,
    combineStartLevel: 70,
    pacingNote: 'Dạy tại L63 (giãn 12 level sau Wood Wall), luyện 64-66, test tại Hard L68, Combine Climax tại SH L70.',
    riskMitigation: 'Kích thích tính tò mò và bất ngờ mà không làm ngợp não.'
  },
  {
    id: 's_frozen',
    name: 'Frozen Truck',
    icon: '❄️',
    iconPath: './assets/mechanics/shooter_frozen.png',
    tier: 'SECONDARY',
    groupType: 'shooter',
    type: 'frozen',
    intent: 'Xe bị đóng băng cần giải cứu trước khi dùng được; hiệu ứng âm thanh băng vỡ giòn tan thỏa mãn.',
    behaviorChange: 'Hành vi B (Mục tiêu phụ ngắn hạn & Xúc giác): Giải phóng xe đóng băng trước khi bắn target chính.',
    teachLevel: 76,
    practiceLevels: [77, 78, 79],
    testLevel: 80,
    combineStartLevel: 84,
    pacingNote: 'Dạy tại L76 mang lại cảm giác tactile thỏa mãn khi đập băng, test tại SuperHard L80 trước khi vào Bomb.',
    riskMitigation: 'Giảm căng thẳng nhận thức trước khi gặp cơ chế đếm ngược/bom.'
  },
  {
    id: 's_bomb_truck',
    name: 'Shooter Bomb',
    icon: '💣',
    iconPath: './assets/mechanics/shooter_bomb.png',
    tier: 'SECONDARY',
    groupType: 'shooter',
    type: 'bomb_truck',
    intent: 'Chế độ khẩn cấp (Emergency Protocol): tìm đường tiếp cận và giải nổ bom trước khi hết lượt.',
    behaviorChange: 'Hành vi E (Ưu tiên khẩn cấp): Đảo lộn hoàn toàn thứ tự ưu tiên: từ thong thả sang tập trung tuyệt đối vào quả bom.',
    teachLevel: 92,
    practiceLevels: [93, 94, 95],
    testLevel: 98,
    combineStartLevel: 100,
    pacingNote: 'Dạy tại L92 (gap 16 level sau Ice) -> Practice 93-95 -> Test 98. Climax kết hợp Bomb tại Mega PEAK L100.',
    riskMitigation: 'Tạo khoảng cách xa để tạo hiệu ứng Wow bất ngờ cho Emergency Protocol.'
  },
  {
    id: 's_long_key',
    name: 'Long Key',
    icon: '🗝️',
    iconPath: './assets/mechanics/shooter_long_key.png',
    tier: 'SECONDARY',
    groupType: 'shooter',
    type: 'long_key',
    intent: 'Giải phóng then cài: thu thập xe ở đầu chốt (Key Head) để rút thanh khóa mở đường cho các xe bị chặn.',
    behaviorChange: 'Hành vi E (Chuỗi phụ thuộc): Phân tích chuỗi phụ thuộc (dependency chain) của các hàng xe.',
    teachLevel: 108,
    practiceLevels: [109, 110, 111, 112],
    testLevel: 113,
    combineStartLevel: 114,
    pacingNote: 'Dạy tại L108 (Long Key), test tại Hard L113 (phá nhịp đuôi .5), Climax tại SH L119.',
    riskMitigation: 'Phá nhịp 5/10 sau L100, kích thích tư duy giải đố cho player veteran.'
  },
  {
    id: 's_pipe',
    name: 'Truck Pipe',
    icon: '🧪',
    iconPath: './assets/mechanics/shooter_pipe.png',
    tier: 'SECONDARY',
    groupType: 'shooter',
    type: 'pipe',
    intent: 'Đoàn xe tiếp tế trong ống dạng hàng đợi (FIFO), thu gọn số xe trên bàn chơi, tăng kích thước xe hiển thị.',
    behaviorChange: 'Hành vi D (Quản lý hàng đợi FIFO): Lập kế hoạch tiêu thụ đạn theo thứ tự tiếp ứng trong ống.',
    teachLevel: 124,
    practiceLevels: [125, 126, 127],
    testLevel: 128,
    combineStartLevel: 130,
    pacingNote: 'Dạy tại L124 (Thở/Relief), test tại Hard L128, Climax tại SH L135.',
    riskMitigation: 'Tạo nhịp thở dễ chịu ở L120 trước khi dạy Pipe ở L124.'
  },
  {
    id: 's_curtains',
    name: 'Curtains',
    icon: '🎪',
    iconPath: './assets/mechanics/shooter_curtains.png',
    tier: 'SECONDARY',
    groupType: 'shooter',
    type: 'curtains',
    intent: 'Rèm che khuất tầm nhìn, tạo sự bất ngờ nhẹ nhàng và đổi gió thị giác.',
    behaviorChange: 'Hành vi A (Khám phá & Thư giãn thị giác): Khám phá dần dần các xe phía sau rèm.',
    teachLevel: 141,
    practiceLevels: [142, 143],
    testLevel: 144,
    combineStartLevel: 146,
    pacingNote: 'Dạy tại L141 (Visual Relief), luyện 142-143, test tại Hard L144, Climax tại Mega PEAK L150.',
    riskMitigation: 'Tạo nhịp nghỉ (breathing room) trước mốc Mega Climax L150.'
  },
  {
    id: 's_key',
    name: 'Key Hunt',
    icon: '🔑',
    iconPath: './assets/mechanics/shooter_key_truck.png',
    tier: 'SECONDARY',
    groupType: 'shooter',
    type: 'key_truck',
    tutLevel: 120,
    intent: 'Thu thập chìa khóa để giải phóng xe khóa tương ứng.',
    behaviorChange: 'Hành vi E (Mở khóa đa tầng): Tìm kiếm và dọn màu chìa khóa trước khi tiếp cận các pixel mục tiêu phía sau.',
    teachLevel: 163,
    practiceLevels: [164, 165, 166],
    testLevel: 167,
    combineStartLevel: 169,
    pacingNote: 'Dạy tại L163 (Key Hunt), test tại Hard L167, Combine Climax tại SH L172.',
    riskMitigation: 'Thử thách giải đố đa tầng cho player giai đoạn mid-late game.'
  },
  {
    id: 's_tunnel',
    name: 'Truck Tunnel',
    icon: '🚇',
    iconPath: './assets/mechanics/shooter_tunnel.png',
    tier: 'SITUATIONAL',
    groupType: 'shooter',
    type: 'tunnel',
    intent: 'Hầm xe di chuyển liên hoàn ngầm dưới sàn đấu, tạo biến thể không gian cấp cao.',
    behaviorChange: 'Hành vi D (Dự đoán không gian ngầm): Phán đoán điểm xuất hiện và vòng lặp của đoàn xe hầm.',
    teachLevel: 201,
    practiceLevels: [202, 203, 204],
    testLevel: 205,
    combineStartLevel: 208,
    pacingNote: 'Dạy tại L201 (Relief level ngay sau Mega PEAK L200), luyện 202-204, test tại Hard L205, Combine tại L208+.',
    riskMitigation: 'Đỉnh cao biến thể cho player đã master toàn bộ core & secondary.'
  }
];

/**
 * Trả về thông tin độ khó đề xuất cho từng Level:
 * - L1..L100: Giữ nguyên nhịp 5/10 (Modulo % 5 = Hard, % 10 = SuperHard).
 * - L101+: Phá nhịp pattern theo mốc Mechanic thực tế (Key Hunt, Pipe, Curtains, Long Key, Tunnel).
 */
export function getProposedLevelDifficultyInfo(levelNum) {
  if (levelNum <= 100) {
    if (levelNum % 50 === 0) return { type: 'PEAK', isSuperHard: true, isHard: false, text: `⚡ PEAK Climax L${levelNum}` };
    if (levelNum % 10 === 0) return { type: 'SUPER_HARD', isSuperHard: true, isHard: false, text: `💀 Super Hard L${levelNum}` };
    if (levelNum % 10 === 5) return { type: 'HARD', isSuperHard: false, isHard: true, text: `🔥 Hard Level L${levelNum}` };
    if (levelNum % 10 === 1 || levelNum === 21) return { type: 'RELIEF', isSuperHard: false, isHard: false, text: `🟢 Normal (Teach / Relief)` };
    return { type: 'NORMAL', isSuperHard: false, isHard: false, text: `🟢 Normal` };
  }

  // L101+: Pattern breaking động
  const superHardLevels = [119, 135, 172];
  const hardLevels = [113, 128, 144, 156, 167, 178, 197, 205];
  const peakLevels = [150, 200];
  const reliefLevels = [101, 108, 120, 124, 141, 151, 163, 201];

  if (peakLevels.includes(levelNum) || (levelNum % 50 === 0 && levelNum > 200)) {
    return { type: 'PEAK', isSuperHard: true, isHard: false, text: `⚡ PEAK L${levelNum} (Mega Challenge Sink)` };
  }
  if (superHardLevels.includes(levelNum)) {
    return { type: 'SUPER_HARD', isSuperHard: true, isHard: false, text: `💀 Super Hard L${levelNum} (Mechanic Climax)` };
  }
  if (hardLevels.includes(levelNum)) {
    return { type: 'HARD', isSuperHard: false, isHard: true, text: `🔥 Hard Level L${levelNum} (Mechanic Test — Pattern Break)` };
  }
  if (reliefLevels.includes(levelNum)) {
    return { type: 'RELIEF', isSuperHard: false, isHard: false, text: `🟢 Normal (Teach / Relief)` };
  }

  // Generic fallback cho L101+ nếu không thuộc danh sách đặc biệt trên:
  if (levelNum % 20 === 0) return { type: 'SUPER_HARD', isSuperHard: true, isHard: false, text: `💀 Super Hard L${levelNum}` };
  if (levelNum % 7 === 0) return { type: 'HARD', isSuperHard: false, isHard: true, text: `🔥 Hard Level L${levelNum}` };

  return { type: 'NORMAL', isSuperHard: false, isHard: false, text: `🟢 Normal` };
}

export class MechanicMapRenderer {
  constructor(containerEl, callbacks = {}) {
    this.container = containerEl;
    this.callbacks = callbacks; // { onSelectLevel: (lvl) => {} }
    this.rawLevels = [];
    this.groupBy = 'both'; // 'blockType' | 'shooterType' | 'both'
    this.displayMode = 'fit'; // 'fit' (Full Width Fit) | 'scroll' (Scrollable)
    this.activeView = 'actual'; // 'actual' | 'proposed' | 'audit'
    this.minLevel = 1;
    this.maxLevel = 2000;
    this.hoveredInfo = null;
    this.selectedLevelForPreview = null;
    this.editMode = false;
    this.editsMap = new Map();
    this.tooltipHideTimer = null;

    this.initSkeleton();
  }

  getLevelComment(levelNum) {
    const directEdit = this.editsMap.get(`${levelNum}_#level_comment`);
    if (directEdit && directEdit.comment) return directEdit.comment;

    for (const edit of this.editsMap.values()) {
      if (edit && edit.levelNum === levelNum && edit.comment) {
        return edit.comment;
      }
    }
    return '';
  }

  cancelHideTooltip() {
    if (this.tooltipHideTimer) {
      clearTimeout(this.tooltipHideTimer);
      this.tooltipHideTimer = null;
    }
  }

  scheduleHideTooltip(delay = 300) {
    this.cancelHideTooltip();
    this.tooltipHideTimer = setTimeout(() => {
      const tooltip = this.container.querySelector('#mmapTooltip') || document.getElementById('mmapTooltip');
      if (tooltip) tooltip.style.display = 'none';
    }, delay);
  }

  initSkeleton() {
    this.container.innerHTML = `
      <div class="mechanic-map-wrapper">
        <!-- Main Mode Switcher Bar -->
        <div class="mmap-view-switcher-bar">
          <div class="view-switcher-left">
            <button id="btnViewActual" class="btn-mmap-view active" data-view="actual">
              <span>🗺️</span> Phân bố Thực tế (Actual Levels)
            </button>
            <button id="btnViewProposed" class="btn-mmap-view" data-view="proposed">
              <span>📐</span> Ma trận Đề xuất Mới (Proposed LD Blueprint)
            </button>
            <button id="btnViewAudit" class="btn-mmap-view" data-view="audit">
              <span>⚖️</span> Kiểm toán GD & So sánh (Audit & Gaps)
            </button>
          </div>
          <div class="view-switcher-right">
            <span class="view-mode-hint" id="mmapViewHint">💡 Framework TPTC & Retention Risk Sequencing</span>
            <button id="btnToggleEditMode" class="btn btn-sm btn-mmap-edit-toggle" style="display: none;" title="Bật/Tắt chế độ chỉnh sửa ma trận">
              ✏️ Chỉnh sửa Blueprint
            </button>
            <button id="btnExportCSV" class="btn btn-sm btn-mmap-export-csv" style="display: none;" title="Xuất toàn bộ ma trận ra file CSV">
              📥 Xuất CSV
            </button>
          </div>
        </div>

        <!-- Controls Bar -->
        <div class="mechanic-controls-bar">
          <div class="controls-left">
            <div class="ctrl-group" id="groupFilterCtrl">
              <label class="ctrl-label">Phân nhóm:</label>
              <select id="mmapGroupBy" class="form-control form-control-sm">
                <option value="both">Tất cả Gameplay Mechanics (14 loại)</option>
                <option value="blockType">Chỉ Block Mechanics (5 loại)</option>
                <option value="shooterType">Chỉ Shooter Mechanics (9 loại)</option>
              </select>
            </div>
          </div>

          <div class="controls-right">
            <div class="ctrl-group">
              <label class="ctrl-label">Hiển thị:</label>
              <div class="btn-group-toggle">
                <button id="btnModeFit" class="btn btn-sm btn-secondary active" title="Tự động co giãn toàn bộ dải level theo chiều ngang màn hình">
                  ↔️ Full Width
                </button>
                <button id="btnModeScroll" class="btn btn-sm btn-secondary" title="Dạng cuộn ngang">
                  📜 Cuộn
                </button>
              </div>
            </div>

            <div class="ctrl-group">
              <label class="ctrl-label">Dải Level:</label>
              <input type="number" id="mmapMinLevel" class="form-control form-control-sm input-num" value="1" min="1" style="width: 70px;">
              <span>đến</span>
              <input type="number" id="mmapMaxLevel" class="form-control form-control-sm input-num" value="500" min="1" style="width: 70px;">
              <button id="btnApplyZoom" class="btn btn-sm btn-secondary">Áp dụng</button>
              <button id="btnResetZoom" class="btn btn-sm btn-secondary">Tất cả</button>
            </div>
          </div>
        </div>

        <!-- Stats Overview Bar -->
        <div id="mmapStatsBar" class="mmap-stats-bar"></div>

        <!-- Layout Wrapper: Timeline + Inline Preview Panel -->
        <div class="mmap-layout-wrapper">
          <div class="mmap-main-panel">
            <div class="mmap-canvas-container" id="mmapCanvasContainer">
              <div id="mmapTimelineMatrix" class="mmap-matrix fit-full-width"></div>
            </div>
          </div>

          <!-- Inline Preview Panel -->
          <div class="mmap-preview-panel" id="mmapPreviewPanel" style="display: none;">
            <div class="preview-header">
              <span id="mmapPreviewTitle" class="preview-title">Level -</span>
              <button id="mmapPreviewClose" class="btn-close-preview" title="Đóng preview">&times;</button>
            </div>
            
            <div class="preview-canvas-wrapper">
              <canvas id="mmapPreviewCanvas" width="240" height="240"></canvas>
            </div>
            
            <div id="mmapPreviewStats" class="preview-stats"></div>
            
            <div class="preview-actions">
              <button id="mmapGoToExplorer" class="btn btn-sm btn-secondary">
                Xem đầy đủ trong Explorer →
              </button>
            </div>
          </div>
        </div>

        <!-- Legend Footer -->
        <div id="mmapLegendFooter" class="mmap-legend-footer">
          <!-- Rendered dynamically depending on view -->
        </div>
      </div>
      <!-- Tooltip -->
      <div id="mmapTooltip" class="mmap-tooltip" style="display: none;"></div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const tooltip = (this.container && this.container.querySelector) ? this.container.querySelector('#mmapTooltip') : (typeof document !== 'undefined' ? document.getElementById('mmapTooltip') : null);
    if (tooltip) {
      tooltip.addEventListener('mouseenter', () => {
        this.cancelHideTooltip();
      });
      tooltip.addEventListener('mouseleave', () => {
        this.scheduleHideTooltip(250);
      });
    }

    // View mode switcher buttons
    const btnViewActual = this.container.querySelector('#btnViewActual');
    const btnViewProposed = this.container.querySelector('#btnViewProposed');
    const btnViewAudit = this.container.querySelector('#btnViewAudit');
    const viewButtons = [btnViewActual, btnViewProposed, btnViewAudit];

    const btnToggleEditMode = this.container.querySelector('#btnToggleEditMode');
    const btnExportCSV = this.container.querySelector('#btnExportCSV');

    viewButtons.forEach((btn) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        viewButtons.forEach((b) => b && b.classList.remove('active'));
        btn.classList.add('active');
        this.activeView = btn.getAttribute('data-view') || 'actual';

        const isProposed = this.activeView === 'proposed';
        if (btnToggleEditMode) btnToggleEditMode.style.display = isProposed ? 'inline-flex' : 'none';
        if (btnExportCSV) btnExportCSV.style.display = isProposed ? 'inline-flex' : 'none';

        if (this.callbacks.onViewChange) {
          this.callbacks.onViewChange(this.activeView);
        }

        this.render();
      });
    });

    if (btnToggleEditMode) {
      btnToggleEditMode.addEventListener('click', () => {
        this.editMode = !this.editMode;
        btnToggleEditMode.classList.toggle('active', this.editMode);
        btnToggleEditMode.innerHTML = this.editMode ? '🔒 Thoát Edit' : '✏️ Chỉnh sửa Blueprint';
        this.render();
      });
    }

    if (btnExportCSV) {
      btnExportCSV.addEventListener('click', () => {
        if (this.callbacks.onExportCSV) {
          this.callbacks.onExportCSV(this.minLevel, this.maxLevel);
        }
      });
    }

    const groupBySel = this.container.querySelector('#mmapGroupBy');
    if (groupBySel) {
      groupBySel.addEventListener('change', (e) => {
        this.groupBy = e.target.value;
        this.render();
      });
    }

    const btnModeFit = this.container.querySelector('#btnModeFit');
    const btnModeScroll = this.container.querySelector('#btnModeScroll');

    if (btnModeFit && btnModeScroll) {
      btnModeFit.addEventListener('click', () => {
        this.displayMode = 'fit';
        btnModeFit.classList.add('active');
        btnModeScroll.classList.remove('active');
        this.render();
      });

      btnModeScroll.addEventListener('click', () => {
        this.displayMode = 'scroll';
        btnModeScroll.classList.add('active');
        btnModeFit.classList.remove('active');
        this.render();
      });
    }

    const minInp = this.container.querySelector('#mmapMinLevel');
    const maxInp = this.container.querySelector('#mmapMaxLevel');
    const btnApply = this.container.querySelector('#btnApplyZoom');
    const btnReset = this.container.querySelector('#btnResetZoom');

    if (btnApply && minInp && maxInp) {
      btnApply.addEventListener('click', () => {
        const min = parseInt(minInp.value, 10) || 1;
        const max = parseInt(maxInp.value, 10) || 2000;
        this.minLevel = Math.min(min, max);
        this.maxLevel = Math.max(min, max);
        this.render();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.resetZoomRange();
        this.render();
      });
    }

    const previewClose = this.container.querySelector('#mmapPreviewClose');
    if (previewClose) {
      previewClose.addEventListener('click', () => {
        const panel = this.container.querySelector('#mmapPreviewPanel');
        if (panel) panel.style.display = 'none';
        this.selectedLevelForPreview = null;
      });
    }

    const btnGoToExplorer = this.container.querySelector('#mmapGoToExplorer');
    if (btnGoToExplorer) {
      btnGoToExplorer.addEventListener('click', () => {
        if (this.selectedLevelForPreview && this.callbacks.onSelectLevel) {
          this.callbacks.onSelectLevel(this.selectedLevelForPreview);
        }
      });
    }
  }

  resetZoomRange() {
    if (this.rawLevels.length === 0) {
      this.minLevel = 1;
      this.maxLevel = 500;
      return;
    }
    const validLevels = this.rawLevels
      .filter((l) => !l.isError && typeof l.level === 'number')
      .map((l) => l.level);
    
    if (validLevels.length > 0) {
      this.minLevel = Math.min(...validLevels);
      this.maxLevel = Math.max(...validLevels);
    } else {
      this.minLevel = 1;
      this.maxLevel = 500;
    }

    const minInp = this.container.querySelector('#mmapMinLevel');
    const maxInp = this.container.querySelector('#mmapMaxLevel');
    if (minInp) minInp.value = this.minLevel;
    if (maxInp) maxInp.value = this.maxLevel;
  }

  /**
   * Set raw level data và render
   */
  render(levelDataArray = null) {
    if (levelDataArray !== null) {
      this.rawLevels = levelDataArray;
      if (this.rawLevels.length > 0 && this.minLevel === 1 && this.maxLevel === 2000) {
        this.resetZoomRange();
      }
    }

    const matrixEl = this.container.querySelector('#mmapTimelineMatrix');
    const statsBarEl = this.container.querySelector('#mmapStatsBar');
    const legendEl = this.container.querySelector('#mmapLegendFooter');
    if (!matrixEl) return;

    if (this.activeView === 'proposed') {
      this.renderProposedBlueprint(matrixEl, statsBarEl, legendEl);
    } else if (this.activeView === 'audit') {
      this.renderAuditReport(matrixEl, statsBarEl, legendEl);
    } else {
      this.renderActualHeatmap(matrixEl, statsBarEl, legendEl);
    }
  }

  renderMechIcon(mech, isSmall = false) {
    if (mech.iconPath) {
      const imgClass = isSmall ? 'mmap-tip-icon-img' : 'mmap-mech-img';
      return `
        <span class="mmap-mech-icon-wrapper">
          <img src="${mech.iconPath}" class="${imgClass}" alt="${mech.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
          <span class="mmap-mech-icon-fallback" style="display:none;">${mech.icon}</span>
        </span>
      `;
    }
    return `<span class="mmap-mech-icon">${mech.icon}</span>`;
  }

  /**
   * RENDER CHẾ ĐỘ 1: PHÂN BỐ THỰC TẾ (ACTUAL LEVELS)
   */
  renderActualHeatmap(matrixEl, statsBarEl, legendEl) {
    const validLevels = this.rawLevels
      .filter((l) => !l.isError && typeof l.level === 'number')
      .filter((l) => l.level >= this.minLevel && l.level <= this.maxLevel)
      .sort((a, b) => a.level - b.level);

    if (validLevels.length === 0) {
      matrixEl.innerHTML = `
        <div class="empty-state" style="padding: 3rem 1rem; text-align: center;">
          <div class="empty-icon" style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
          <h3 style="margin-bottom: 0.5rem;">Chưa có dữ liệu Level thực tế</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem; max-width: 500px; margin-left: auto; margin-right: auto;">
            Hãy nạp dữ liệu Level từ thanh điều khiển hoặc click nút bên dưới để tải các level có sẵn trong project.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button id="mmapBtnLoadSample" class="btn btn-primary">📂 Nạp Level Mẫu (50 levels)</button>
            <button id="mmapBtnLoadAll" class="btn btn-secondary">🚀 Nạp Toàn Bộ Level (439 levels)</button>
            <button id="mmapBtnSwitchBlueprint" class="btn btn-secondary">📐 Xem Ma Trận Đề Xuất (TPTC)</button>
          </div>
        </div>
      `;

      // Attach quick action listeners
      const btnSample = matrixEl.querySelector('#mmapBtnLoadSample');
      const btnAll = matrixEl.querySelector('#mmapBtnLoadAll');
      const btnSwitchBp = matrixEl.querySelector('#mmapBtnSwitchBlueprint');

      if (btnSample) {
        btnSample.addEventListener('click', () => {
          const btn = document.getElementById('btnLoadSampleLevels');
          if (btn) btn.click();
        });
      }
      if (btnAll) {
        btnAll.addEventListener('click', () => {
          const btn = document.getElementById('btnLoadAllLevels');
          if (btn) btn.click();
        });
      }
      if (btnSwitchBp) {
        btnSwitchBp.addEventListener('click', () => {
          const btn = this.container.querySelector('#btnViewProposed');
          if (btn) btn.click();
        });
      }

      if (statsBarEl) statsBarEl.innerHTML = '';
      return;
    }

    // 1. Thu thập danh sách mechanics theo group mode
    const mechanicsList = this.collectMechanics(validLevels);

    // 2. Render stats overview
    if (statsBarEl) {
      statsBarEl.innerHTML = `
        <div class="stat-pill"><strong>${validLevels.length}</strong> Levels hiển thị (${this.minLevel} - ${this.maxLevel})</div>
        <div class="stat-pill"><strong>${mechanicsList.length}</strong> Mechanics xuất hiện (Thứ tự Tutorial thực tế Lvl 8 ➔ 150)</div>
        <div class="stat-pill" style="margin-left: auto; color: var(--accent-color);">💡 Hover vào bất kỳ cột level nào để xem toàn bộ mechanics</div>
      `;
    }

    // 3. Render Matrix Grid
    let html = '<div class="mmap-unified-section">';

    mechanicsList.forEach((mech) => {
      let rowDots = '';
      let totalCountAll = 0;
      let levelsWithMech = 0;
      const color = MECHANIC_COLORS[mech.id] || { dot: '#94a3b8', bar: 'rgba(148, 163, 184, 0.85)' };

      validLevels.forEach((lvl) => {
        const occ = this.getMechanicOccurrence(lvl, mech);
        if (occ && occ.count > 0) {
          totalCountAll += occ.count;
          levelsWithMech++;

          const sizeClass = occ.count > 20 ? 'dot-lg' : (occ.count > 5 ? 'dot-md' : 'dot-sm');
          const intensity = Math.min(1, 0.4 + (occ.count / 30) * 0.6);

          rowDots += `
            <div class="mmap-cell" data-level="${lvl.level}">
              <div class="mmap-dot ${sizeClass}" 
                   style="background: ${color.dot}; opacity: ${intensity.toFixed(2)};"
                   data-level="${lvl.level}"
                   data-mech-id="${mech.id}"
                   data-mech-name="${mech.name}"
                   data-group-type="${mech.groupType}"
                   data-count="${occ.count}"
                   data-first-row="${occ.firstRow ?? '-'}"
                   data-coverage="${occ.coverage ?? '-'}">
              </div>
            </div>
          `;
        } else {
          rowDots += `
            <div class="mmap-cell empty" data-level="${lvl.level}"></div>
          `;
        }
      });

      const iconHtml = this.renderMechIcon(mech);

      html += `
        <div class="mmap-row">
          <div class="mmap-row-header" title="${mech.desc || ''} (Mở khóa ở Level ${mech.tutLevel || 1})">
            ${iconHtml}
            <div class="mmap-mech-info">
              <div class="mmap-mech-title-row">
                <span class="mmap-mech-name" style="border-left: 3px solid ${color.dot}; padding-left: 5px;">${mech.name}</span>
                <span class="mmap-tut-tag">Lvl ${mech.tutLevel || 1}</span>
              </div>
              <span class="mmap-mech-sub">${mech.groupType === 'block' ? `blockType ${mech.type}` : `shooterType ${mech.type}`}</span>
            </div>
          </div>

          <div class="mmap-timeline-track">
            ${rowDots}
          </div>

          <div class="mmap-row-total" title="Xuất hiện trong ${levelsWithMech}/${validLevels.length} levels">
            <span class="total-num" style="color: ${color.dot};">${totalCountAll.toLocaleString()}</span>
            <span class="total-sub">${levelsWithMech} lvls</span>
          </div>
        </div>
      `;
    });

    html += `</div>`;

    // 4. Header Level Numbers
    const totalCount = validLevels.length;
    let tickStep = 1;
    if (totalCount > 300) tickStep = 25;
    else if (totalCount > 150) tickStep = 10;
    else if (totalCount > 60) tickStep = 5;
    else if (totalCount > 30) tickStep = 2;

    let levelHeaders = '';
    validLevels.forEach((lvl, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === totalCount - 1;
      const isStep = (lvl.level % tickStep === 0);
      const showLabel = isFirst || isLast || isStep;

      levelHeaders += `
        <div class="mmap-header-cell" data-level="${lvl.level}">
          ${showLabel ? `<span class="lvl-num">${lvl.level}</span>` : `<span class="lvl-tick">·</span>`}
        </div>
      `;
    });

    const timelineHeader = `
      <div class="mmap-header-row">
        <div class="mmap-row-header-label">Gameplay Mechanic</div>
        <div class="mmap-timeline-track header-track">
          ${levelHeaders}
        </div>
        <div class="mmap-row-total-label">Total</div>
      </div>
    `;

    matrixEl.className = `mmap-matrix ${this.displayMode === 'fit' ? 'fit-full-width' : 'scroll-mode'}`;
    matrixEl.innerHTML = timelineHeader + html;

    // 5. Update legend
    if (legendEl) {
      legendEl.innerHTML = `
        <div class="legend-item">
          <span class="legend-dot" style="background: #3b82f6; width: 6px; height: 12px; border-radius: 2px;"></span>
          <span>Ít block / slot</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #3b82f6; width: 10px; height: 16px; border-radius: 2px;"></span>
          <span>Nhiều block / mật độ cao</span>
        </div>
        <div class="legend-sep">|</div>
        <div class="legend-note">💡 Hover vào bất kỳ cột level nào để xem danh sách toàn bộ mechanics hiện có; click để xem Preview Pixel Art.</div>
      `;
    }

    // 6. Gắn interaction events
    this.attachCellEvents(matrixEl);
  }

  /**
   * Tính toán phân bổ pha (Teach, Practice, Test, Combine) cho từng level theo ma trận đề xuất mới,
   * áp dụng Fair Idle-Time Rotation (đảm bảo mọi secondary mechanic đều xoay vòng xuất hiện ở late game),
   * Density Cap (max 4/normal lvl, max 5/hard lvl) và Mega-Challenge Sinks (chu kỳ mỗi 50 level).
   */
  computeProposedLevelPhases(levels) {
    // Mega-Challenge levels: Mỗi 50 level (L50, L100, L150, L200, L250...) làm mốc cao trào bào resource
    const isMegaLevel = (lvl) => (lvl % 50 === 0);
    const levelMap = new Map();
    const lastActiveLevel = new Map();

    levels.forEach((lvl) => {
      const activeForLvl = [];
      const isMega = isMegaLevel(lvl);
      const diffInfo = getProposedLevelDifficultyInfo(lvl);
      const isHardOrSuperHard = diffInfo.isHard || diffInfo.isSuperHard;

      // 1. Pha Teach / Practice / Test (Ưu tiên tuyệt đối không bị cắt giảm)
      PROPOSED_MECHANIC_BLUEPRINT.forEach((mech) => {
        if (lvl === mech.teachLevel) {
          activeForLvl.push({
            mech,
            phase: 'teach',
            phaseClass: 'phase-teach',
            phaseText: 'T',
            phaseTitle: `Level ${lvl}: Pha TEACH — Giới thiệu cô lập ${mech.name}, độ khó thấp.`,
            priority: 100
          });
        } else if (mech.practiceLevels && mech.practiceLevels.includes(lvl)) {
          activeForLvl.push({
            mech,
            phase: 'practice',
            phaseClass: 'phase-practice',
            phaseText: 'P',
            phaseTitle: `Level ${lvl}: Pha PRACTICE — Luyện tập ${mech.name} một mình, tăng tải nhẹ nhàng.`,
            priority: 90
          });
        } else if (lvl === mech.testLevel) {
          activeForLvl.push({
            mech,
            phase: 'test',
            phaseClass: 'phase-test',
            phaseText: 'Tst',
            phaseTitle: `Level ${lvl}: Pha TEST — Đo lường mastery của ${mech.name} trước khi combine.`,
            priority: 80
          });
        }
      });

      // 2. Ứng viên Pha Combine
      const combineCandidates = [];
      PROPOSED_MECHANIC_BLUEPRINT.forEach((mech) => {
        if (lvl >= mech.combineStartLevel && !activeForLvl.some(a => a.mech.id === mech.id)) {
          let isCandidate = false;
          if (mech.tier === 'CORE') {
            // Core mechanics (Hidden & Connected) luôn sẵn sàng làm nền tảng combine
            isCandidate = true;
          } else {
            // Secondary & Situational (Stack, Key Hunt, Tunnel, Pipe...):
            // Xuất hiện khi level rơi vào đúng Cụm chủ đề (Micro Cluster) của nó hoặc màn Climax (SuperHard/PEAK)
            const activeCluster = getActiveClusterForLevel(lvl);
            if (isHardOrSuperHard || (activeCluster && activeCluster.mechs.includes(mech.id))) {
              isCandidate = true;
            }
          }

          if (isCandidate) {
            // Tải tính toán Idle Time: Mechanic nào "vắng bóng" lâu nhất sẽ được ưu tiên xuất hiện lại trước
            const lastLvl = lastActiveLevel.get(mech.id) || 0;
            const idleTime = lvl - lastLvl;
            combineCandidates.push({
              mech,
              phase: 'combine',
              phaseClass: 'phase-combine',
              phaseText: 'C',
              phaseTitle: `Level ${lvl}: Pha COMBINE — Phối hợp ${mech.name} cùng mechanic đã học (đã vắng mặt ${idleTime} lvls).`,
              idleTime
            });
          }
        }
      });

      if (isMega) {
        // Mega-Challenge level: Cho phép combine đa tầng (4-8 mechanics) tạo đỉnh cao độ khó & bào sink tài nguyên
        combineCandidates.forEach((c) => activeForLvl.push(c));
        PROPOSED_MECHANIC_BLUEPRINT.filter(m => m.tier === 'CORE').forEach((core) => {
          if (lvl >= core.combineStartLevel && !activeForLvl.some(a => a.mech.id === core.id)) {
            activeForLvl.push({
              mech: core,
              phase: 'combine',
              phaseClass: 'phase-combine',
              phaseText: 'C',
              phaseTitle: `Level ${lvl}: Pha COMBINE — Core Climax Combine (${core.name}).`,
              idleTime: 0
            });
          }
        });
      } else {
        // Density Cap theo Pacing:
        // - Pha Teach / Practice / Test: Cách ly cô lập 1 mình để người chơi master cơ chế (0 combine slot)
        // - Pha Combine thông thường: Tối đa 4 mechanics (2 Cores + 2 Secondaries), màn Hard/SuperHard tối đa 5
        const hasTeach = activeForLvl.some(a => a.phase === 'teach');
        const hasPractice = activeForLvl.some(a => a.phase === 'practice');
        const hasTest = activeForLvl.some(a => a.phase === 'test');

        let maxCombineSlots = 0;
        if (hasTeach || hasPractice || hasTest) {
          // TPTC Rule: Teach, Practice, Test xuất hiện cô lập 1 mình, không trộn mechanic khác
          maxCombineSlots = 0;
        } else {
          const maxCap = isHardOrSuperHard ? 5 : 4;
          maxCombineSlots = Math.max(0, maxCap - activeForLvl.length);
        }

        if (maxCombineSlots > 0) {
          const cores = combineCandidates.filter(c => c.mech.tier === 'CORE');
          const activeCluster = getActiveClusterForLevel(lvl);
          // Sắp xếp các mechanic secondary theo Cluster chủ đề (Micro Cluster) và thời gian vắng mặt (Fair Idle-Time)
          const secondaries = combineCandidates.filter(c => c.mech.tier !== 'CORE').sort((a, b) => {
            const inClusterA = activeCluster && activeCluster.mechs.includes(a.mech.id) ? 1 : 0;
            const inClusterB = activeCluster && activeCluster.mechs.includes(b.mech.id) ? 1 : 0;
            if (inClusterA !== inClusterB) return inClusterB - inClusterA; // Ưu tiên thuộc cụm chủ đề hiện tại
            return b.idleTime - a.idleTime; // Tiêu chí phụ: vắng mặt lâu nhất
          });

          let added = 0;
          // 1. Luôn bảo đảm Core Combo (Hidden & Connected)
          for (const core of cores) {
            if (added < maxCombineSlots) {
              activeForLvl.push(core);
              added++;
            }
          }
          // 2. Thêm Secondary mechanics xoay vòng theo Cụm chủ đề
          for (const sec of secondaries) {
            if (added < maxCombineSlots) {
              activeForLvl.push(sec);
              added++;
            }
          }
        }
      }


      // Cập nhật tracker lần xuất hiện cuối cùng của mỗi mechanic
      activeForLvl.forEach(item => {
        lastActiveLevel.set(item.mech.id, lvl);
      });

      levelMap.set(lvl, activeForLvl);
    });

    return levelMap;
  }

  /**
   * RENDER CHẾ ĐỘ 2: MA TRẬN ĐỀ XUẤT MỚI (PROPOSED LD BLUEPRINT)
   */
  renderProposedBlueprint(matrixEl, statsBarEl, legendEl) {
    const minLvl = Math.max(1, this.minLevel);
    // Cho phép mở rộng map không giới hạn theo tham số nhập maxLevel mà không làm thay đổi kết quả các level trước
    const maxLvl = Math.max(minLvl, this.maxLevel || 210);

    // Stats Bar động
    if (statsBarEl) {
      const coreList = PROPOSED_MECHANIC_BLUEPRINT.filter(m => m.tier === 'CORE').map(m => `${m.name} (L${m.teachLevel})`).join(', ');
      const secList = PROPOSED_MECHANIC_BLUEPRINT.filter(m => m.tier === 'SECONDARY').map(m => `${m.name} (L${m.teachLevel})`).join(', ');
      const sitList = PROPOSED_MECHANIC_BLUEPRINT.filter(m => m.tier === 'SITUATIONAL').map(m => `${m.name} (L${m.teachLevel})`).join(', ');

      const editsCount = this.editsMap.size;

      statsBarEl.innerHTML = `
        <div class="stat-pill"><strong style="color: #60a5fa;">Tier 1 Core (2)</strong>: ${coreList}</div>
        <div class="stat-pill"><strong style="color: #a78bfa;">Tier 2 Secondary (10)</strong>: ${secList}</div>
        <div class="stat-pill"><strong style="color: #fbbf24;">Tier 3 Situational (1)</strong>: ${sitList}</div>
        ${editsCount > 0 ? `<div class="stat-pill" style="color: #eab308;">✏️ <strong>${editsCount} Overrides/Comments</strong> đã lưu</div>` : ''}
        <div class="stat-pill" style="margin-left: auto; color: #f43f5e;">⚡ <strong>Mega-Challenge Sinks</strong>: L50, L100, L150, L200... (Fair Rotation Max 4-5/lvl)</div>
      `;
    }

    // Generate Level Array
    const levels = [];
    for (let l = minLvl; l <= maxLvl; l++) levels.push(l);

    const levelPhaseMap = this.computeProposedLevelPhases(levels);

    // Banner Edit Mode nếu đang bật
    let editBannerHtml = '';
    if (this.editMode) {
      editBannerHtml = `
        <div class="mmap-edit-mode-banner">
          <div>
            <strong>✏️ ĐANG TRONG CHẾ ĐỘ CHỈNH SỬA BLUEPRINT</strong>
            <span style="opacity: 0.85; margin-left: 8px;">• Click vào bất kỳ ô nào để Thêm / Bớt Mechanic hoặc Viết Ghi Chú. Mọi chỉnh sửa tự động lưu vào Session data.</span>
          </div>
          <div>
            ${this.editsMap.size > 0 ? `<button id="btnResetAllEdits" class="btn btn-sm btn-danger" style="padding: 2px 8px; font-size: 11px;">🗑️ Xóa tất cả edits (${this.editsMap.size})</button>` : ''}
          </div>
        </div>
      `;
    }

    // Render Milestone Banners (Retention Risk / Pacing & Difficulty Tags)
    let retentionHeaderCells = '';
    levels.forEach((lvl) => {
      let tag = '';
      const boosterDef = BOOSTER_DEFINITIONS[lvl];

      if (boosterDef) {
        tag = `<span class="mmap-tag tag-d1" style="background: rgba(234, 179, 8, 0.2); color: #fbbf24; border: 1px solid #eab308;" title="Mở khóa Booster Tutorial: ${boosterDef.name}">${boosterDef.icon} ${boosterDef.name.split(' ')[0]}</span>`;
      } else if (lvl === 8) tag = '<span class="mmap-tag tag-d1" title="D1 Retention Risk — Teach Core Mechanic Hidden Truck">🎯 Hidden</span>';
      else if (lvl === 10) tag = '<span class="mmap-tag tag-superhard" title="SuperHard L10 (Solo Hidden Practice)">💀 SH L10</span>';
      else if (lvl === 14) tag = '<span class="mmap-tag tag-d1" title="Mastering Core — Teach Connected Trucks">⭐ Connected</span>';
      else if (lvl === 20) tag = '<span class="mmap-tag tag-superhard" title="SuperHard L20 Milestone — Core Combine Climax">💀 SH L20</span>';
      else if (lvl === 21) tag = '<span class="mmap-tag tag-wow" title="D7 Retention Savior — Loader Stack Wow/Relief Teach">⭐ WOW</span>';
      else if (lvl === 35) tag = '<span class="mmap-tag tag-tier2" title="Teach Hard Block (2x2)">🧱 HardBlk</span>';
      else if (lvl === 51) tag = '<span class="mmap-tag tag-tier2" title="Teach Solid Wood Wall (Spatial Routing)">🛡️ Wood</span>';
      else if (lvl === 63) tag = '<span class="mmap-tag tag-tier2" title="Teach Mystery Block">❓ Mystery</span>';
      else if (lvl === 76) tag = '<span class="mmap-tag tag-wow" title="Teach Frozen Truck (Tactile Crunch)">❄️ Ice</span>';
      else if (lvl === 92) tag = '<span class="mmap-tag tag-bomb" title="Teach Bomb Truck (Emergency Protocol)">💣 Bomb</span>';
      else if (lvl === 108) tag = '<span class="mmap-tag tag-tier2" title="Teach Long Key (Dependency Chain)">🗝️ Key</span>';
      else if (lvl === 124) tag = '<span class="mmap-tag tag-pipe" title="Teach Truck Pipe (FIFO Queue)">🧪 Pipe</span>';
      else if (lvl === 141) tag = '<span class="mmap-tag tag-wow" title="Teach Curtains (Visual Relief)">🎪 Curtains</span>';
      else if (lvl === 163) tag = '<span class="mmap-tag tag-tier2" title="Teach Key Hunt (Lock & Key Pair)">🔑 Hunt</span>';
      else if (lvl === 201) tag = '<span class="mmap-tag tag-tier2" title="Teach Truck Tunnel (Underground Routing)">🚇 Tunnel</span>';
      else {
        const diffInfo = getProposedLevelDifficultyInfo(lvl);
        if (diffInfo.type === 'PEAK') tag = `<span class="mmap-tag tag-peak" title="⚡ PEAK Mega-Challenge Climax L${lvl}">⚡ PEAK L${lvl}</span>`;
        else if (diffInfo.isSuperHard) tag = `<span class="mmap-tag tag-superhard" title="SuperHard L${lvl}">💀 SH</span>`;
        else if (diffInfo.isHard) tag = `<span class="mmap-tag tag-hard" title="Hard L${lvl}">🔥 Hard</span>`;
      }

      retentionHeaderCells += `<div class="mmap-header-cell blueprint-header-cell" data-level="${lvl}">${tag}</div>`;
    });

    // Level number cells
    let tickStep = 1;
    if (levels.length > 100) tickStep = 5;
    else if (levels.length > 50) tickStep = 2;

    let levelHeaders = '';
    levels.forEach((lvl, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === levels.length - 1;
      const isStep = (lvl % tickStep === 0);
      const showLabel = isFirst || isLast || isStep;
      const hasComment = Boolean(this.getLevelComment(lvl));

      levelHeaders += `
        <div class="mmap-header-cell blueprint-num-cell" data-level="${lvl}">
          ${showLabel ? `<span class="lvl-num">${lvl}${hasComment ? '💬' : ''}</span>` : `<span class="lvl-tick">${hasComment ? '💬' : '·'}</span>`}
        </div>
      `;
    });

    let html = editBannerHtml + '<div class="mmap-blueprint-section">';

    // Helper render cell badge với overrides
    const renderCell = (lvl, mech, computedEntry, defaultColor, isBooster = false) => {
      const compositeKey = `${lvl}_${mech.id}`;
      const userEdit = this.editsMap.get(compositeKey);

      let phase = computedEntry ? computedEntry.phase : null;
      let phaseText = computedEntry ? computedEntry.phaseText : '';
      let phaseClass = computedEntry ? computedEntry.phaseClass : '';
      let phaseTitle = computedEntry ? computedEntry.phaseTitle : '';

      let extraCellClass = '';
      if (this.editMode) extraCellClass += ' edit-mode-active';

      if (userEdit) {
        if (userEdit.comment) extraCellClass += ' has-comment';

        if (userEdit.overrideType === 'removed') {
          extraCellClass += ' user-removed';
          phaseTitle = `Level ${lvl}: [USER LOẠI BỎ] ${mech.name}` + (userEdit.comment ? `\n💬 Note: ${userEdit.comment}` : '');
        } else if (userEdit.overrideType === 'added' || userEdit.overrideType === 'phase_changed') {
          extraCellClass += ' user-added';
          phase = userEdit.overridePhase || phase || 'combine';
          const phaseMapInfo = {
            teach: { text: 'T', cls: 'phase-teach' },
            practice: { text: 'P', cls: 'phase-practice' },
            test: { text: 'Tst', cls: 'phase-test' },
            combine: { text: 'C', cls: 'phase-combine' }
          };
          const pInfo = phaseMapInfo[phase] || { text: 'C', cls: 'phase-combine' };
          phaseText = pInfo.text;
          phaseClass = pInfo.cls;
          phaseTitle = `Level ${lvl}: [USER THÊM/SỬA] ${mech.name} (${phase.toUpperCase()})` + (userEdit.comment ? `\n💬 Note: ${userEdit.comment}` : '');
        }
      }

      if (userEdit && userEdit.overrideType === 'removed') {
        return `
          <div class="mmap-cell blueprint-cell ${extraCellClass}" data-level="${lvl}" data-mech-id="${mech.id}">
            <div class="blueprint-phase-badge ${phaseClass || 'phase-combine'}" 
                 style="border-color: #ef4444;"
                 data-level="${lvl}"
                 data-mech-id="${mech.id}"
                 data-mech-name="${mech.name}"
                 title="${phaseTitle}">
              ${phaseText || '❌'}
            </div>
          </div>
        `;
      }

      if (phase || (userEdit && userEdit.overrideType !== 'removed')) {
        return `
          <div class="mmap-cell blueprint-cell ${extraCellClass}" data-level="${lvl}" data-mech-id="${mech.id}">
            <div class="blueprint-phase-badge ${phaseClass}" 
                 style="border-color: ${defaultColor};"
                 data-level="${lvl}"
                 data-mech-id="${mech.id}"
                 data-mech-name="${mech.name}"
                 data-phase="${phase}"
                 title="${phaseTitle}">
              ${phaseText}
            </div>
          </div>
        `;
      }

      return `<div class="mmap-cell empty blueprint-cell ${extraCellClass}" data-level="${lvl}" data-mech-id="${mech.id}"></div>`;
    };

    // 1. Render Booster Tutorial Rows Section (Đẩy lên đầu bảng)
    PROPOSED_BOOSTER_BLUEPRINT.forEach((booster) => {
      let rowCells = '';
      const color = '#eab308'; // Yellow/Gold for boosters

      levels.forEach((lvl) => {
        let entry = null;
        if (lvl === booster.teachLevel) {
          entry = {
            phase: 'teach',
            phaseClass: 'phase-booster-teach',
            phaseText: 'B',
            phaseTitle: `Level ${lvl}: Pha BOOSTER TUTORIAL — Giới thiệu ${booster.name}`
          };
        }
        rowCells += renderCell(lvl, booster, entry, color, true);
      });

      const boosterIconHtml = this.renderMechIcon(booster);

      html += `
        <div class="mmap-row blueprint-row booster-row" style="background: rgba(234, 179, 8, 0.04); border-bottom: 1px solid rgba(234, 179, 8, 0.15);">
          <div class="mmap-row-header" title="${booster.intent}">
            ${boosterIconHtml}
            <div class="mmap-mech-info">
              <div class="mmap-mech-title-row">
                <span class="mmap-mech-name" style="border-left: 3px solid ${color}; padding-left: 5px; color: #fbbf24;">${booster.name}</span>
                <span class="mmap-cat-pill booster" style="background: rgba(234, 179, 8, 0.2); color: #fde047; border: 1px solid #eab308; font-size: 9px; padding: 1px 4px;">BOOSTER</span>
              </div>
              <span class="mmap-mech-sub">Teach Lvl ${booster.teachLevel}</span>
            </div>
          </div>

          <div class="mmap-timeline-track">
            ${rowCells}
          </div>

          <div class="mmap-row-total blueprint-meta-col" title="${booster.behaviorChange}">
            <span class="total-num" style="color: ${color};">Unlock L${booster.teachLevel}</span>
            <span class="total-sub">${booster.behaviorChange.slice(0, 20)}...</span>
          </div>
        </div>
      `;
    });

    // 2. Render Gameplay Mechanics Rows Section
    PROPOSED_MECHANIC_BLUEPRINT.forEach((mech) => {
      let rowCells = '';
      const color = MECHANIC_COLORS[mech.id] || { dot: '#94a3b8', bar: 'rgba(148, 163, 184, 0.85)' };

      levels.forEach((lvl) => {
        const activeList = levelPhaseMap.get(lvl) || [];
        const entry = activeList.find(a => a.mech.id === mech.id);
        rowCells += renderCell(lvl, mech, entry, color.dot, false);
      });

      const iconHtml = this.renderMechIcon(mech);
      const tierBadge = `<span class="mmap-cat-pill ${mech.tier.toLowerCase()}">${mech.tier}</span>`;

      html += `
        <div class="mmap-row blueprint-row">
          <div class="mmap-row-header" title="${mech.intent}">
            ${iconHtml}
            <div class="mmap-mech-info">
              <div class="mmap-mech-title-row">
                <span class="mmap-mech-name" style="border-left: 3px solid ${color.dot}; padding-left: 5px;">${mech.name}</span>
                ${tierBadge}
              </div>
              <span class="mmap-mech-sub">Teach Lvl ${mech.teachLevel} • Test Lvl ${mech.testLevel}</span>
            </div>
          </div>

          <div class="mmap-timeline-track">
            ${rowCells}
          </div>

          <div class="mmap-row-total blueprint-meta-col" title="${mech.behaviorChange}">
            <span class="total-num" style="color: ${color.dot};">L${mech.teachLevel} ➔ L${mech.combineStartLevel}+</span>
            <span class="total-sub">${mech.behaviorChange.slice(0, 20)}...</span>
          </div>
        </div>
      `;
    });

    html += `</div>`;

    const timelineHeader = `
      <div class="mmap-header-row blueprint-meta-header">
        <div class="mmap-row-header-label">Retention & Pacing</div>
        <div class="mmap-timeline-track header-track">
          ${retentionHeaderCells}
        </div>
        <div class="mmap-row-total-label">Timeline</div>
      </div>
      <div class="mmap-header-row">
        <div class="mmap-row-header-label">Proposed Mechanic Sequence</div>
        <div class="mmap-timeline-track header-track">
          ${levelHeaders}
        </div>
        <div class="mmap-row-total-label">Progression</div>
      </div>
    `;

    matrixEl.className = `mmap-matrix ${this.displayMode === 'fit' ? 'fit-full-width' : 'scroll-mode'}`;
    matrixEl.innerHTML = timelineHeader + html;

    // Legend for Blueprint
    if (legendEl) {
      legendEl.innerHTML = `
        <div class="legend-item"><span class="blueprint-phase-badge phase-teach" style="width: 18px; height: 18px; font-size: 10px; display: inline-flex; align-items: center; justify-content: center;">T</span> <span><strong>Teach</strong> (Xuất hiện cô lập, độ khó thấp)</span></div>
        <div class="legend-item"><span class="blueprint-phase-badge phase-practice" style="width: 18px; height: 18px; font-size: 10px; display: inline-flex; align-items: center; justify-content: center;">P</span> <span><strong>Practice</strong> (2-3 màn củng cố một mình, tăng tải nhẹ)</span></div>
        <div class="legend-item"><span class="blueprint-phase-badge phase-test" style="width: 18px; height: 18px; font-size: 10px; display: inline-flex; align-items: center; justify-content: center;">Tst</span> <span><strong>Test</strong> (Đo lường năng lực master độc lập)</span></div>
        <div class="legend-item"><span class="blueprint-phase-badge phase-combine" style="width: 18px; height: 18px; font-size: 10px; display: inline-flex; align-items: center; justify-content: center;">C</span> <span><strong>Combine</strong> (Ghép có kiểm soát, max 3/màn thường)</span></div>
        <div class="legend-sep">|</div>
        <div class="legend-item"><span class="mmap-tag tag-peak">⚡ PEAK</span> <span>Mega-Challenge Sink (L50, L100, L150, L200)</span></div>
        <div class="legend-item"><span class="mmap-tag tag-wow">⭐ WOW</span> <span>Giữ chân sau màn SuperHard</span></div>
        <div class="legend-item"><span class="mmap-tag tag-d1">D1 / D7</span> <span>Điểm rớt Retention Risk</span></div>
      `;
    }

    this.attachBlueprintEvents(matrixEl);
  }

  /**
   * RENDER CHẾ ĐỘ 3: BÁO CÁO KIỂM TOÁN GAME DESIGN (AUDIT & GAP ANALYSIS)
   */
  renderAuditReport(matrixEl, statsBarEl, legendEl) {
    if (statsBarEl) {
      statsBarEl.innerHTML = `
        <div class="stat-pill"><strong style="color: #ef4444;">🚨 4 Vấn đề Cốt lõi</strong>: Onboarding quá dày • Nhảy vọt độ khó • Đứt gãy TPTC • Thiếu Pacing Retention</div>
      `;
    }

    matrixEl.className = 'mmap-matrix fit-full-width audit-view-container';
    matrixEl.innerHTML = `
      <div class="audit-report-wrapper">
        <div class="audit-summary-cards">
          <div class="audit-card critical">
            <div class="audit-card-icon">⚡</div>
            <div class="audit-card-content">
              <h4>1. Quá tải nhận thức Onboarding</h4>
              <p>Hiện tại có <strong>6 lần dạy trong 11 màn đầu</strong> (L7 Claw ➔ L8 LoaderStack ➔ L10 Linked ➔ L13 Hand ➔ L15 Shuffle ➔ L18 SuperShooter). Player chưa kịp quen đã bị dồn dập.</p>
              <div class="audit-action">✅ <strong>Khắc phục:</strong> Giãn cách Booster dạy riêng; dời LoaderStack xuống L21 (sau SuperHard) làm Wow mechanic.</div>
            </div>
          </div>

          <div class="audit-card critical">
            <div class="audit-card-icon">📈</div>
            <div class="audit-card-content">
              <h4>2. Nhảy vọt độ khó sau pha Teach (Bỏ qua Practice)</h4>
              <p>• <strong>Hard Block:</strong> L30 có 650 block ➔ L31 vọt lên 1.865 block (<strong>gấp 3 lần</strong>).<br>• <strong>Bomb Truck:</strong> L70 có 244 block ➔ L71 vọt lên 1.500 block (<strong>gấp 6 lần</strong>).</p>
              <div class="audit-action">✅ <strong>Khắc phục:</strong> Bắt buộc 2-3 level Practice tăng tải đều đặn (250 ➔ 350 ➔ 500 ➔ 700 block Test).</div>
            </div>
          </div>

          <div class="audit-card warning">
            <div class="audit-card-icon">🚷</div>
            <div class="audit-card-content">
              <h4>3. Dạy xong bỏ rơi Mechanic (Missing Practice/Test)</h4>
              <p>• <strong>ShooterBomb:</strong> Dạy ở L70, chỉ có 2 màn practice (71, 75) rồi biến mất đến tận <strong>L235 (+165 level)</strong>.<br>• <strong>Long Key:</strong> Dạy ở L80 chỉ có 1 màn L81 rồi mất hút.<br>• <strong>Tunnel:</strong> L150 không có màn khó nào thử thách.</p>
              <div class="audit-action">✅ <strong>Khắc phục:</strong> Đưa vào chu kỳ tuần hoàn Combine định kỳ sau khi Test.</div>
            </div>
          </div>

          <div class="audit-card warning">
            <div class="audit-card-icon">🔄</div>
            <div class="audit-card-content">
              <h4>4. Trùng lặp hành vi (Behavioral Clashing)</h4>
              <p>• <strong>Truck Pipe (L101)</strong> và <strong>Truck Tunnel (L150)</strong> thay đổi cùng 1 hành vi cấp xe từ hầm/ống.<br>• <strong>Loader Stack (L8)</strong> và <strong>Hard Block (L30)</strong> đều tạo cảm giác phải phá nhiều đạn hơn mức bình thường.</p>
              <div class="audit-action">✅ <strong>Khắc phục:</strong> Giãn cách ít nhất 40-50 level; xen kẽ mechanic Thay đổi Không gian (Wood Wall) và Che giấu (Mystery).</div>
            </div>
          </div>
        </div>

        <div class="audit-table-card">
          <h3 class="audit-table-title">📋 Bảng So Sánh Chi Tiết: Hiện Tại vs Đề Xuất Chuẩn TPTC</h3>
          <table class="audit-comparison-table">
            <thead>
              <tr>
                <th>Mechanic</th>
                <th>Tier</th>
                <th>Vị trí Cũ</th>
                <th>Vị trí Đề Xuất</th>
                <th>Chu trình TPTC Mới</th>
                <th>Ý Đồ & Tác Động Hành Vi</th>
              </tr>
            </thead>
            <tbody>
              ${PROPOSED_MECHANIC_BLUEPRINT.map((m) => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <img src="${m.iconPath}" class="mmap-mech-img" alt="${m.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                      <span class="mmap-mech-icon-fallback" style="display:none;">${m.icon}</span>
                      <strong>${m.name}</strong>
                    </div>
                  </td>
                  <td><span class="mmap-cat-pill ${m.tier.toLowerCase()}">${m.tier}</span></td>
                  <td><span class="badge-old">${m.tutLevel !== undefined ? `L${m.tutLevel}` : '-'}</span></td>
                  <td><span class="badge-new">L${m.teachLevel}</span></td>
                  <td>
                    <div class="tptc-steps">
                      <span class="t-step teach">T: L${m.teachLevel}</span> ➔ 
                      <span class="t-step practice">P: L${m.practiceLevels.join(',')}</span> ➔ 
                      <span class="t-step test">Tst: L${m.testLevel}</span> ➔ 
                      <span class="t-step combine">C: L${m.combineStartLevel}+</span>
                    </div>
                  </td>
                  <td class="audit-desc-cell">
                    <div><strong>Hành vi:</strong> ${m.behaviorChange}</div>
                    <div class="audit-subnote">💡 ${m.pacingNote}</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (legendEl) {
      legendEl.innerHTML = `
        <div class="legend-note">💡 Báo cáo kiểm toán này dựa trên các nguyên tắc Level Design thực chiến (Ray's GD Framework & Casual Sequencing).</div>
      `;
    }
  }

  /**
   * TỔNG HỢP TOÀN BỘ MECHANICS CÓ TRONG 1 LEVEL CỤ THỂ
   */
  getAllMechanicsInLevel(lvlData) {
    if (!lvlData) return [];
    const activeMechs = [];

    // Check Block mechanics
    Object.values(MECHANIC_DEFINITIONS.block).forEach((def) => {
      const typesToCheck = [def.type, ...(def.aliasTypes || [])];
      let totalCount = 0;
      let firstRow = null;
      if (lvlData.blockMechanicCounts) {
        for (const t of typesToCheck) {
          const info = lvlData.blockMechanicCounts[t] ?? lvlData.blockMechanicCounts[String(t)];
          if (info && info.count > 0) {
            totalCount += info.count;
            if (info.firstRow !== undefined && (firstRow === null || info.firstRow < firstRow)) {
              firstRow = info.firstRow;
            }
          }
        }
      }
      if (totalCount > 0) {
        const coverage = lvlData.total_cells > 0 ? ((totalCount / lvlData.total_cells) * 100).toFixed(1) + '%' : '-';
        activeMechs.push({
          ...def,
          groupType: 'block',
          count: totalCount,
          firstRow,
          coverage,
          unit: 'blocks'
        });
      }
    });

    // Check Shooter mechanics
    Object.values(MECHANIC_DEFINITIONS.shooter).forEach((def) => {
      const typesToCheck = [def.type, ...(def.aliasTypes || [])];
      let totalCount = 0;
      if (lvlData.shooterMechanicCounts) {
        for (const t of typesToCheck) {
          const info = lvlData.shooterMechanicCounts[t] ?? lvlData.shooterMechanicCounts[String(t)];
          if (info && info.count > 0) {
            totalCount += info.count;
          }
        }
      }
      if (totalCount > 0) {
        activeMechs.push({
          ...def,
          groupType: 'shooter',
          count: totalCount,
          firstRow: null,
          coverage: null,
          unit: 'slots xe'
        });
      }
    });

    // Hợp nhất Key Hunt Block (b_5) và Key Hunt Truck (s_key) thành 1 mechanic duy nhất
    const keyBlockIdx = activeMechs.findIndex((m) => m.id === 'b_5');
    const keyTruckIdx = activeMechs.findIndex((m) => m.id === 's_key');

    if (keyBlockIdx !== -1 && keyTruckIdx !== -1) {
      const blockMech = activeMechs[keyBlockIdx];
      const truckMech = activeMechs[keyTruckIdx];
      const pairedMech = {
        id: 'pair_key_hunt',
        name: 'Key Hunt',
        icon: '🔑',
        iconPath: './assets/mechanics/shooter_key_truck.png',
        category: 'SECONDARY',
        groupType: 'paired',
        count: blockMech.count + truckMech.count,
        detailText: `${blockMech.count} blocks chìa + ${truckMech.count} xe khóa`,
        coverage: blockMech.coverage,
        firstRow: blockMech.firstRow,
        unit: 'items'
      };
      const minIdx = Math.min(keyBlockIdx, keyTruckIdx);
      const maxIdx = Math.max(keyBlockIdx, keyTruckIdx);
      activeMechs.splice(maxIdx, 1);
      activeMechs.splice(minIdx, 1, pairedMech);
    } else if (keyBlockIdx !== -1) {
      activeMechs[keyBlockIdx].name = 'Key Hunt';
      activeMechs[keyBlockIdx].iconPath = './assets/mechanics/shooter_key_truck.png';
    } else if (keyTruckIdx !== -1) {
      activeMechs[keyTruckIdx].name = 'Key Hunt';
      activeMechs[keyTruckIdx].iconPath = './assets/mechanics/shooter_key_truck.png';
    }

    return activeMechs;
  }

  collectMechanics(validLevels) {
    const list = [];
    const includeBlocks = this.groupBy === 'both' || this.groupBy === 'blockType';
    const includeShooters = this.groupBy === 'both' || this.groupBy === 'shooterType';

    if (includeBlocks) {
      Object.values(MECHANIC_DEFINITIONS.block).forEach((def) => {
        const typesToCheck = [def.type, ...(def.aliasTypes || [])];
        const exists = this.rawLevels.some((lvl) => {
          if (!lvl.blockMechanicCounts) return false;
          return typesToCheck.some((t) => {
            const countInfo = lvl.blockMechanicCounts[t] ?? lvl.blockMechanicCounts[String(t)];
            return countInfo && countInfo.count > 0;
          });
        });
        if (exists) {
          list.push({ ...def, groupType: 'block' });
        }
      });
    }

    if (includeShooters) {
      Object.values(MECHANIC_DEFINITIONS.shooter).forEach((def) => {
        const typesToCheck = [def.type, ...(def.aliasTypes || [])];
        const exists = this.rawLevels.some((lvl) => {
          if (!lvl.shooterMechanicCounts) return false;
          return typesToCheck.some((t) => {
            const countInfo = lvl.shooterMechanicCounts[t] ?? lvl.shooterMechanicCounts[String(t)];
            return countInfo && countInfo.count > 0;
          });
        });
        if (exists) {
          list.push({ ...def, groupType: 'shooter' });
        }
      });
    }

    // Khi chọn 'both' (Tất cả), hợp nhất Key Hunt Block và Key Hunt Truck thành 1 dòng mechanic duy nhất
    if (this.groupBy === 'both') {
      const idxB5 = list.findIndex((m) => m.id === 'b_5');
      const idxSKey = list.findIndex((m) => m.id === 's_key');
      if (idxB5 !== -1 || idxSKey !== -1) {
        const pairedDef = {
          id: 'pair_key_hunt',
          name: 'Key Hunt',
          icon: '🔑',
          iconPath: './assets/mechanics/shooter_key_truck.png',
          category: 'SECONDARY',
          desc: 'Key Hunt: Khối Chìa Khóa (BlockKey 5) & Xe Ổ Khóa (ShooterLock 1)',
          tutLevel: 120,
          order: 12,
          groupType: 'paired'
        };
        const filtered = list.filter((m) => m.id !== 'b_5' && m.id !== 's_key');
        filtered.push(pairedDef);
        list.length = 0;
        list.push(...filtered);
      }
    }

    list.sort((a, b) => {
      const tutA = a.tutLevel !== undefined ? a.tutLevel : 999;
      const tutB = b.tutLevel !== undefined ? b.tutLevel : 999;
      if (tutA !== tutB) return tutA - tutB;
      return (a.order || 0) - (b.order || 0);
    });

    return list;
  }

  getMechanicOccurrence(lvl, mech) {
    if (mech.groupType === 'paired') {
      let blockCount = 0;
      let truckCount = 0;
      let firstRow = null;
      if (lvl.blockMechanicCounts) {
        const info = lvl.blockMechanicCounts[5] ?? lvl.blockMechanicCounts['5'];
        if (info && info.count > 0) {
          blockCount = info.count;
          firstRow = info.firstRow;
        }
      }
      if (lvl.shooterMechanicCounts) {
        const sInfo = lvl.shooterMechanicCounts['key_truck'] ?? lvl.shooterMechanicCounts[1];
        if (sInfo && sInfo.count > 0) {
          truckCount = sInfo.count;
        }
      }
      const totalCount = blockCount + truckCount;
      if (totalCount <= 0) return null;
      const coverage = lvl.total_cells > 0 && blockCount > 0 ? ((blockCount / lvl.total_cells) * 100).toFixed(1) + '%' : '-';
      return {
        count: totalCount,
        blockCount,
        truckCount,
        firstRow,
        coverage,
      };
    } else if (mech.groupType === 'block') {
      if (!lvl.blockMechanicCounts) return null;
      let totalCount = 0;
      let firstRow = null;
      const typesToCheck = [mech.type, ...(mech.aliasTypes || [])];
      for (const t of typesToCheck) {
        const info = lvl.blockMechanicCounts[t] ?? lvl.blockMechanicCounts[String(t)];
        if (info && info.count > 0) {
          totalCount += info.count;
          if (info.firstRow !== undefined && (firstRow === null || info.firstRow < firstRow)) {
            firstRow = info.firstRow;
          }
        }
      }
      if (totalCount <= 0) return null;
      const coverage = lvl.total_cells > 0 ? ((totalCount / lvl.total_cells) * 100).toFixed(1) + '%' : '-';
      return {
        count: totalCount,
        firstRow,
        coverage,
      };
    } else {
      if (!lvl.shooterMechanicCounts) return null;
      let totalCount = 0;
      const typesToCheck = [mech.type, ...(mech.aliasTypes || [])];
      for (const t of typesToCheck) {
        const info = lvl.shooterMechanicCounts[t] ?? lvl.shooterMechanicCounts[String(t)];
        if (info && info.count > 0) {
          totalCount += info.count;
        }
      }
      if (totalCount <= 0) return null;
      return {
        count: totalCount,
        firstRow: null,
        coverage: null,
      };
    }
  }

  /**
   * ATTACH CELL EVENTS (HOVER INSPECTOR & CLICK) TRÊN ACTUAL HEATMAP
   */
  attachCellEvents(containerEl) {
    const tooltip = this.container.querySelector('#mmapTooltip') || document.getElementById('mmapTooltip');

    // Hover trên toàn bộ cột header hoặc cell
    const cellsAndHeaders = containerEl.querySelectorAll('.mmap-cell, .mmap-header-cell');

    cellsAndHeaders.forEach((el) => {
      const levelNum = parseInt(el.getAttribute('data-level'), 10);
      if (isNaN(levelNum)) return;

      el.addEventListener('mouseenter', () => {
        this.cancelHideTooltip();
        const lvlData = this.rawLevels.find((l) => l.level === levelNum);
        const allMechs = this.getAllMechanicsInLevel(lvlData);

        let mechsListHtml = '';
        if (allMechs.length > 0) {
          mechsListHtml = allMechs.map((m) => {
            const color = MECHANIC_COLORS[m.id]?.dot || '#3b82f6';
            const iconImg = this.renderMechIcon(m, true);
            const countText = m.detailText ? `<strong>${m.detailText}</strong>` : `<strong>${m.count} ${m.unit}</strong>`;

            return `
              <div class="tip-mech-row">
                <span class="tip-mech-dot" style="background: ${color};"></span>
                ${iconImg}
                <span class="tip-mech-label">${m.name}:</span>
                ${countText}
                ${m.coverage && m.coverage !== '-' ? `<span class="tip-mech-cov">(${m.coverage})</span>` : ''}
              </div>
            `;
          }).join('');
        } else {
          mechsListHtml = '<div class="tip-mech-empty">Standard Core Level (Không chứa gimmick mechanic đặc biệt)</div>';
        }

        const actualDiffBadge = lvlData?.isSuperHard ? '🔴 Super Hard' : (lvlData?.isHard ? '🟠 Hard' : '🟢 Normal');
        const proposedDiff = (levelNum % 10 === 0) ? '🔴 Đề xuất: Super Hard (..0)' : ((levelNum % 10 === 5) ? '🟠 Đề xuất: Hard (..5)' : '🟢 Đề xuất: Normal');
        const activeBlocks = lvlData ? `${lvlData.active_blocks} blocks (${lvlData.fill_ratio_pct}%)` : '-';
        const shooters = lvlData ? `${lvlData.num_shooters} cols (${lvlData.active_slots || lvlData.total_slots} slots)` : '-';

        let tooltipHtml = `
          <div class="tip-header">
            <strong>Level ${levelNum}</strong>
            <div style="display: flex; gap: 4px; align-items: center;">
              <span class="tip-badge">${actualDiffBadge}</span>
            </div>
          </div>
          <div class="tip-meta-grid">
            <div>Grid: <strong>${lvlData?.girdSizeX ?? '-'}×${lvlData?.girdSizeY ?? '-'}</strong></div>
            <div>Blocks: <strong>${activeBlocks}</strong></div>
            <div>Shooters: <strong>${shooters}</strong></div>
          </div>
          <div class="tip-mechs-section">
            <div class="tip-mechs-title">Mechanics hiện có (${allMechs.length}):</div>
            ${mechsListHtml}
          </div>
          <div class="tip-hint">👉 Click để xem Preview Pixel Art & Thống kê chi tiết</div>
        `;

        if (tooltip) {
          tooltip.innerHTML = tooltipHtml;
          tooltip.style.display = 'block';

          const rect = el.getBoundingClientRect();
          tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
          tooltip.style.top = `${rect.top + window.scrollY - 10}px`;
        }
      });

      el.addEventListener('mouseleave', () => {
        this.cancelHideTooltip();
        if (tooltip) tooltip.style.display = 'none';
      });

      el.addEventListener('click', () => {
        if (tooltip) tooltip.style.display = 'none';
        if (this.callbacks.onSelectLevel) {
          this.callbacks.onSelectLevel(levelNum);
        } else {
          const lvlData = this.rawLevels.find((l) => l.level === levelNum);
          if (lvlData) {
            this.showLevelPreview(lvlData);
          }
        }
      });
    });
  }

  /**
   * TỔNG HỢP TOÀN BỘ MECHANICS TRONG 1 LEVEL THEO MA TRẬN ĐỀ XUẤT (PROPOSED BLUEPRINT)
   * Đồng bộ 100% với logic computeProposedLevelPhases (bao gồm cả Density Cap & Core Combo).
   */
  getAllProposedMechanicsInLevel(levelNum) {
    const map = this.computeProposedLevelPhases([levelNum]);
    const activeList = map.get(levelNum) || [];
    return activeList.map((entry) => {
      let phaseLabel = '';
      if (entry.phase === 'teach') phaseLabel = 'TEACH (Giới thiệu cô lập)';
      else if (entry.phase === 'practice') phaseLabel = 'PRACTICE (Luyện tập)';
      else if (entry.phase === 'test') phaseLabel = 'TEST (Kiểm tra Mastery)';
      else if (entry.phase === 'combine') phaseLabel = 'COMBINE (Phối hợp)';

      return {
        ...entry.mech,
        phase: entry.phase,
        phaseLabel,
        phaseClass: entry.phaseClass,
        phaseBadge: entry.phaseText
      };
    });
  }

  /**
   * ATTACH BLUEPRINT EVENTS (HOVER INSPECTOR & CLICK) TRÊN PROPOSED BLUEPRINT
   */
  attachBlueprintEvents(containerEl) {
    const tooltip = this.container.querySelector('#mmapTooltip') || document.getElementById('mmapTooltip');
    const cellsAndHeaders = containerEl.querySelectorAll('.blueprint-cell, .blueprint-header-cell, .blueprint-num-cell');

    // Nút Reset tất cả edits trên banner
    const btnResetAll = containerEl.querySelector('#btnResetAllEdits');
    if (btnResetAll) {
      btnResetAll.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Bạn có chắc chắn muốn xóa tất cả chỉnh sửa (edits) đã thực hiện?')) {
          if (this.callbacks.onClearAllEdits) {
            this.callbacks.onClearAllEdits();
          }
        }
      });
    }

    cellsAndHeaders.forEach((el) => {
      const levelNum = parseInt(el.getAttribute('data-level'), 10);
      if (isNaN(levelNum)) return;

      // Click cell mở Edit Modal CHỈ KHI Edit Mode đang bật
      if (el.classList.contains('blueprint-cell')) {
        el.addEventListener('click', (e) => {
          if (!this.editMode) return; // Ở Chế độ Xem: Không làm gì / Giữ Read-only
          e.stopPropagation();
          const mechId = el.getAttribute('data-mech-id');
          if (!mechId) return;

          // Tìm mechanic definition
          const allMechs = [...PROPOSED_MECHANIC_BLUEPRINT, ...PROPOSED_BOOSTER_BLUEPRINT];
          const mech = allMechs.find(m => m.id === mechId);
          const mechName = mech ? mech.name : mechId;

          this.openCommentModal(levelNum, mechId, mechName);
        });
      }

      el.addEventListener('mouseenter', (e) => {
        this.cancelHideTooltip();
        const badgeEl = el.querySelector ? el.querySelector('.blueprint-phase-badge') : null;
        const targetBadge = el.classList?.contains('blueprint-phase-badge') ? el : badgeEl;

        const proposedMechs = this.getAllProposedMechanicsInLevel(levelNum);
        const lvlData = this.rawLevels.find((l) => l.level === levelNum);
        const actualMechs = this.getAllMechanicsInLevel(lvlData);

        // Xác định Độ khó Đề xuất Mới bằng Helper (rút gọn 1 badge)
        const diffInfo = getProposedLevelDifficultyInfo(levelNum);
        let proposedDiffBadge = '';
        if (diffInfo.type === 'PEAK' || diffInfo.isSuperHard) {
          proposedDiffBadge = '<span class="tip-badge" style="background: rgba(239, 68, 68, 0.25); color: #f87171; border: 1px solid #ef4444; font-weight: 800;">🔴 SUPER HARD</span>';
        } else if (diffInfo.isHard) {
          proposedDiffBadge = '<span class="tip-badge" style="background: rgba(245, 158, 11, 0.25); color: #fbbf24; border: 1px solid #f59e0b; font-weight: 700;">🟠 HARD</span>';
        } else if (diffInfo.type === 'RELIEF') {
          proposedDiffBadge = '<span class="tip-badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981;">🟢 NORMAL (Teach / Relief)</span>';
        } else {
          proposedDiffBadge = '<span class="tip-badge" style="background: rgba(255, 255, 255, 0.1); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.2);">🟢 NORMAL</span>';
        }

        // Xác định Milestone / Pacing Tag cho Level này
        let milestoneTag = '';
        if (levelNum === 8) milestoneTag = '🎯 D1 Core Debut (Hidden Truck)';
        else if (levelNum === 10) milestoneTag = '💀 Super Hard L10 (Solo Hidden Practice)';
        else if (levelNum === 14) milestoneTag = '⭐ D1 Retain Core (Connected Trucks)';
        else if (levelNum === 15) milestoneTag = '🔥 Hard Level L15 (Connected Practice)';
        else if (levelNum === 18) milestoneTag = '🔥 Hard Level L18 (Connected Test)';
        else if (levelNum === 20) milestoneTag = '💀 Super Hard L20 Climax (Core Combine)';
        else if (levelNum === 21) milestoneTag = '⭐ D7 WOW / Relief (Loader Stack Teach)';
        else if (levelNum === 25) milestoneTag = '🔥 Hard Level L25 (Loader Test)';
        else if (levelNum === 30) milestoneTag = '💀 Super Hard L30 (Loader Climax)';
        else if (levelNum === 35) milestoneTag = '🧱 Hard Block Debut (2x2 Teach)';
        else if (levelNum === 40) milestoneTag = '💀 Super Hard L40 (Hard Parcel Climax — 3x3 Test)';
        else if (levelNum === 50) milestoneTag = '⚡ PEAK L50 Mega-Challenge Climax (Act 1 Finale)';
        else if (levelNum === 51) milestoneTag = '🛡️ Solid Wood Wall Debut (Teach Spatial Routing)';
        else if (levelNum === 55) milestoneTag = '🔥 Hard Level L55 (Wood Wall Test)';
        else if (levelNum === 60) milestoneTag = '💀 Super Hard L60 (Wood Wall Climax)';
        else if (levelNum === 63) milestoneTag = '❓ Mystery Block Debut (Dọn biên mở lõi)';
        else if (levelNum === 68) milestoneTag = '🔥 Hard Level L68 (Mystery Test)';
        else if (levelNum === 70) milestoneTag = '💀 Super Hard L70 (Mystery Climax)';
        else if (levelNum === 76) milestoneTag = '❄️ Frozen Truck Debut (Tactile Crunch)';
        else if (levelNum === 80) milestoneTag = '💀 Super Hard L80 (Frozen Climax)';
        else if (levelNum === 92) milestoneTag = '💣 Bomb Protocol Debut (Emergency Teach)';
        else if (levelNum === 98) milestoneTag = '🔥 Hard Level L98 (Bomb Test)';
        else if (levelNum === 100) milestoneTag = '💀 Super Hard L100 CLIMAX (Pipe + Bomb)';
        else if (levelNum === 108) milestoneTag = '🗝️ Long Key Debut (Dependency Chain)';
        else if (levelNum === 113) milestoneTag = '🔥 Hard Level L113 (Long Key Test — Pattern Break)';
        else if (levelNum === 119) milestoneTag = '💀 Super Hard L119 (Long Key Climax — Pattern Break)';
        else if (levelNum === 120) milestoneTag = '🟢 Relief Level L120 (Breathing Space)';
        else if (levelNum === 124) milestoneTag = '🧪 Truck Pipe Debut (FIFO Queue Stream)';
        else if (levelNum === 128) milestoneTag = '🔥 Hard Level L128 (Truck Pipe Test)';
        else if (levelNum === 135) milestoneTag = '💀 Super Hard L135 (Truck Pipe Climax)';
        else if (levelNum === 141) milestoneTag = '🎪 Curtains Debut (Visual Relief Teach)';
        else if (levelNum === 144) milestoneTag = '🔥 Hard Level L144 (Curtains Test)';
        else if (levelNum === 150) milestoneTag = '⚡ PEAK L150 (Mega Challenge Sink)';
        else if (levelNum === 151) milestoneTag = '⭐ WOW / Relief L151 (Post PEAK)';
        else if (levelNum === 163) milestoneTag = '🔑 Key Hunt Debut (Lock & Key Pair)';
        else if (levelNum === 167) milestoneTag = '🔥 Hard Level L167 (Key Hunt Test)';
        else if (levelNum === 172) milestoneTag = '💀 Super Hard L172 (Key Hunt Climax)';
        else if (levelNum === 197) milestoneTag = '🔥 Hard Level L197 (Pre-Climax Spike)';
        else if (levelNum === 200) milestoneTag = '⚡ MEGA PEAK L200 Mega-Challenge (Act 2 Finale)';
        else if (levelNum === 201) milestoneTag = '🚇 Truck Tunnel Debut (Underground Routing Teach)';
        else if (levelNum === 205) milestoneTag = '🔥 Hard Level L205 (Truck Tunnel Test)';
        else if (diffInfo.isSuperHard) milestoneTag = `💀 Super Hard L${levelNum}`;
        else if (diffInfo.isHard) milestoneTag = `🔥 Hard Level L${levelNum}`;
        else if (diffInfo.type === 'RELIEF') milestoneTag = `🌱 Teach / Relief Window (L${levelNum})`;
        else if (levelNum < 8) milestoneTag = '🌱 Standard Onboarding (1-7)';

        // Spotlight nếu trỏ trực tiếp vào 1 Badge cụ thể
        let spotlightHtml = '';
        if (targetBadge && targetBadge.getAttribute('data-mech-name')) {
          const mName = targetBadge.getAttribute('data-mech-name');
          const mPhase = targetBadge.getAttribute('data-phase');
          const mIntent = targetBadge.getAttribute('data-intent');
          const mBehavior = targetBadge.getAttribute('data-behavior');
          const mPacing = targetBadge.getAttribute('data-pacing');
          const phaseName = mPhase === 'teach' ? '📘 TEACH (Giới thiệu)' : (mPhase === 'practice' ? '📗 PRACTICE (Luyện tập)' : (mPhase === 'test' ? '📙 TEST (Kiểm tra Mastery)' : '🔮 COMBINE (Phối hợp)'));

          spotlightHtml = `
            <div class="tip-spotlight-card">
              <div class="spotlight-title">
                <strong>🎯 Đang trỏ: ${mName}</strong>
                <span class="tip-badge">${phaseName}</span>
              </div>
              <div class="spotlight-desc"><em>${mIntent || ''}</em></div>
              <div class="spotlight-behavior"><strong>Hành vi:</strong> ${mBehavior || ''}</div>
              <div class="spotlight-pacing">💡 ${mPacing || ''}</div>
            </div>
          `;
        }

        const allAvailableMechs = [...PROPOSED_MECHANIC_BLUEPRINT, ...PROPOSED_BOOSTER_BLUEPRINT];
        
        let tooltipHtml = '';

        if (this.editMode) {
          // --- KHI EDIT MODE BẬT: Render Quick Level Checklist Editor ---
          const checklistRowsHtml = allAvailableMechs.map((m) => {
            const compositeKey = `${levelNum}_${m.id}`;
            const userEdit = this.editsMap.get(compositeKey);
            const computedEntry = proposedMechs.find((p) => p.id === m.id);

            let isChecked = false;
            let currentPhase = 'combine';

            if (userEdit) {
              if (userEdit.overrideType === 'removed') {
                isChecked = false;
                currentPhase = computedEntry ? computedEntry.phase : 'combine';
              } else {
                isChecked = true;
                currentPhase = userEdit.overridePhase || (computedEntry ? computedEntry.phase : 'combine');
              }
            } else if (computedEntry) {
              isChecked = true;
              currentPhase = computedEntry.phase;
            }

            const iconImg = this.renderMechIcon(m, true);

            return `
              <div class="tip-chk-item">
                <input type="checkbox" class="tip-mech-chk" id="chk_${levelNum}_${m.id}" data-mech-id="${m.id}" data-mech-name="${m.name}" ${isChecked ? 'checked' : ''}>
                <label for="chk_${levelNum}_${m.id}" class="tip-chk-label ${isChecked ? 'checked' : 'unchecked'}" id="lbl_${levelNum}_${m.id}">
                  ${iconImg}
                  <span>${m.name}</span>
                  <span style="font-size: 9px; color: var(--text-muted); opacity: 0.7;">(${m.tier})</span>
                </label>
                <select id="sel_${levelNum}_${m.id}" class="tip-phase-select" style="${isChecked ? 'display:inline-block;' : 'display:none;'}">
                  <option value="teach" ${currentPhase === 'teach' ? 'selected' : ''}>Teach (T)</option>
                  <option value="practice" ${currentPhase === 'practice' ? 'selected' : ''}>Practice (P)</option>
                  <option value="test" ${currentPhase === 'test' ? 'selected' : ''}>Test (Tst)</option>
                  <option value="combine" ${currentPhase === 'combine' ? 'selected' : ''}>Combine (C)</option>
                </select>
              </div>
            `;
          }).join('');

          // Lấy comment hiện tại của level này (nếu có)
          const currentLevelNote = this.getLevelComment(levelNum);

          tooltipHtml = `
            <div class="tip-header edit-mode-header" style="background: rgba(234, 179, 8, 0.15); margin: -12px -16px 8px -16px; padding: 8px 12px; border-bottom: 1px solid rgba(234, 179, 8, 0.3);">
              <strong style="color: #fbbf24; font-size: 13px;">✏️ Quick Edit Mechanics — Level ${levelNum}</strong>
              <span style="font-size: 10px; color: var(--text-secondary); display: block;">Tích chọn mechanic có mặt & chọn Phase</span>
            </div>
            <div class="tip-edit-checklist" style="max-height: 240px; overflow-y: auto; padding-right: 2px;">
              ${checklistRowsHtml}
            </div>
            <div style="margin-top: 8px;">
              <textarea id="tipLevelNoteInput_${levelNum}" class="form-control form-control-sm" rows="2" placeholder="💬 Ghi chú ý đồ thiết kế cho Level ${levelNum}..." style="width: 100%; font-size: 11px; resize: vertical; border-color: rgba(234, 179, 8, 0.4);">${currentLevelNote}</textarea>
            </div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 8px; justify-content: space-between; align-items: center;">
              <button id="btnResetQuickLvl_${levelNum}" class="btn btn-sm btn-danger" style="font-size: 10px; padding: 2px 6px;">Reset Lvl ${levelNum}</button>
              <button id="btnSaveQuickLvl_${levelNum}" class="btn btn-sm btn-primary" style="font-size: 11px; padding: 4px 12px; background: #eab308; color: #0f172a; border: none; font-weight: 700; cursor: pointer;">💾 Lưu & Cập nhật Level ${levelNum}</button>
            </div>
          `;
        } else {
          // --- KHI EDIT MODE TẮT: Render Read-Only Inspector Thuần Túy ---
          let proposedListHtml = '';
          if (proposedMechs.length > 0) {
            proposedListHtml = proposedMechs.map((m) => {
              const color = MECHANIC_COLORS[m.id]?.dot || '#3b82f6';
              const iconImg = this.renderMechIcon(m, true);
              const tierBadge = `<span class="mmap-cat-pill ${m.tier.toLowerCase()}" style="font-size: 9px; padding: 1px 4px;">${m.tier}</span>`;
              const phaseBadge = `<span class="blueprint-phase-badge ${m.phaseClass}" style="width: 16px; height: 16px; font-size: 9px; display: inline-flex; align-items: center; justify-content: center;">${m.phaseBadge}</span>`;

              return `
                <div class="tip-mech-row blueprint-tip-row">
                  <span class="tip-mech-dot" style="background: ${color};"></span>
                  ${iconImg}
                  <span class="tip-mech-label"><strong>${m.name}</strong>:</span>
                  <span class="tip-phase-group">${phaseBadge} <span>${m.phaseLabel}</span></span>
                  ${tierBadge}
                </div>
              `;
            }).join('');
          } else {
            proposedListHtml = '<div class="tip-mech-empty">🌱 Màn chơi Onboarding cơ bản</div>';
          }

          // Kiểm tra xem có comment nào của Game Designer cho Level này không
          const levelComment = this.getLevelComment(levelNum);

          let commentsCardHtml = '';
          if (levelComment) {
            commentsCardHtml = `
              <div class="tip-user-comments" style="margin: 6px 0; padding: 6px 10px; background: rgba(234, 179, 8, 0.12); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 6px; font-size: 11px; color: #fef08a; white-space: pre-wrap; word-break: break-word;">💬 ${levelComment}</div>
            `;
          }

          // Đối chiếu với dữ liệu thực tế nếu có
          let actualCompareHtml = '';
          if (lvlData) {
            let actualList = actualMechs.map((m) => m.name).join(', ');
            if (!actualList) actualList = 'Core level (Không có gimmick)';
            actualCompareHtml = `
              <div class="tip-actual-compare">
                <div>📊 <strong>Thực tế hiện tại (L${levelNum}):</strong> ${actualList}</div>
              </div>
            `;
          }

          const boosterDef = BOOSTER_DEFINITIONS[levelNum];
          let boosterCard = '';
          if (boosterDef) {
            boosterCard = `<div class="tip-booster-card" style="margin: 6px 0; padding: 4px 8px; background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 4px; font-size: 11px; color: #fbbf24;">🚀 <strong>Mở khóa Booster Tutorial:</strong> ${boosterDef.icon} ${boosterDef.name} — <em>${boosterDef.desc}</em></div>`;
          }

          const activeCluster = getActiveClusterForLevel(levelNum);
          let clusterInfo = '';
          if (activeCluster) {
            clusterInfo = `<div style="font-size: 11px; color: #94a3b8; margin: 4px 0;">📦 <strong>Cụm chủ đề:</strong> Cluster ${activeCluster.id} (${activeCluster.name})</div>`;
          }

          tooltipHtml = `
            <div class="tip-header">
              <strong>📐 Ma Trận Đề Xuất — Level ${levelNum}</strong>
              <div style="display: flex; gap: 4px; align-items: center;">
                ${proposedDiffBadge}
                ${milestoneTag ? `<span class="tip-milestone-pill">${milestoneTag}</span>` : ''}
              </div>
            </div>
            ${boosterCard}
            ${commentsCardHtml}
            ${spotlightHtml}
            ${clusterInfo}
            <div class="tip-mechs-section">
              <div class="tip-mechs-title">Thống kê Mechanics trong Level ${levelNum} (${proposedMechs.length}):</div>
              ${proposedListHtml}
            </div>
            ${actualCompareHtml}
            <div class="tip-hint">👉 Click vào Level để xem chi tiết & chỉnh sửa Ý đồ trong Side Panel</div>
          `;
        }

        if (tooltip) {
          tooltip.innerHTML = tooltipHtml;
          tooltip.style.display = 'block';

          const rect = el.getBoundingClientRect();
          tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
          tooltip.style.top = `${rect.top + window.scrollY - 10}px`;
        }
      });

      el.addEventListener('mouseleave', () => {
        this.cancelHideTooltip();
        if (tooltip) tooltip.style.display = 'none';
      });

      el.addEventListener('click', () => {
        if (tooltip) tooltip.style.display = 'none';
        if (this.callbacks.onSelectLevel) {
          this.callbacks.onSelectLevel(levelNum);
        } else {
          const lvlData = this.rawLevels.find((l) => l.level === levelNum);
          if (lvlData) {
            this.showLevelPreview(lvlData);
          }
        }
      });
    });
  }

  showLevelPreview(lvlData) {
    this.selectedLevelForPreview = lvlData.level;
    const panel = this.container.querySelector('#mmapPreviewPanel');
    const title = this.container.querySelector('#mmapPreviewTitle');
    const stats = this.container.querySelector('#mmapPreviewStats');
    const canvas = this.container.querySelector('#mmapPreviewCanvas');

    if (!panel || !title || !stats || !canvas) return;

    title.textContent = `Level ${lvlData.level} (ID: ${lvlData.id || lvlData.level})`;
    panel.style.display = 'flex';

    // Render pixel art on mini canvas
    this.renderPreviewCanvas(canvas, lvlData);

    const invIcon = lvlData.invariant_valid ? '✅ Hợp lệ' : '❌ Mất cân bằng';
    const allMechs = this.getAllMechanicsInLevel(lvlData);

    let mechsBreakdown = '';
    if (allMechs.length > 0) {
      mechsBreakdown = allMechs.map((m) => {
        const iconImg = this.renderMechIcon(m, true);
        const countText = m.detailText ? m.detailText : `${m.count} ${m.unit}`;

        return `
          <div class="preview-stat-item" style="border-left: 3px solid ${MECHANIC_COLORS[m.id]?.dot || '#3b82f6'}; padding-left: 8px;">
            <span class="stat-name" style="display: flex; align-items: center; gap: 6px;">${iconImg} ${m.name}</span>
            <span class="stat-count">${countText}</span>
          </div>
        `;
      }).join('');
    } else {
      mechsBreakdown = `
        <div class="preview-stat-item">
          <span class="stat-name">Gimmick Mechanics</span>
          <span class="stat-count">None (Core loop)</span>
        </div>
      `;
    }

    stats.innerHTML = `
      <div class="preview-stat-header">📊 Thống kê Tổng quan</div>
      <div class="preview-stat-item">
        <span class="stat-name">Grid & Cells</span>
        <span class="stat-count">${lvlData.girdSizeX}×${lvlData.girdSizeY} (${lvlData.total_cells} cells)</span>
      </div>
      <div class="preview-stat-item">
        <span class="stat-name">Active Blocks / Fill</span>
        <span class="stat-count">${lvlData.active_blocks} (${lvlData.fill_ratio_pct}%)</span>
      </div>
      <div class="preview-stat-item">
        <span class="stat-name">Shooter Cols / Slots</span>
        <span class="stat-count">${lvlData.num_shooters} cols (${lvlData.active_slots || lvlData.total_slots} slots)</span>
      </div>
      <div class="preview-stat-item">
        <span class="stat-name">Invariant Check</span>
        <span class="stat-count">${invIcon}</span>
      </div>
      <div class="preview-stat-header" style="margin-top: 10px;">🧩 Mechanics trong Level (${allMechs.length})</div>
      ${mechsBreakdown}
    `;
  }

  renderPreviewCanvas(canvas, lvlData) {
    if (!canvas || !lvlData || !lvlData.rawJson || !lvlData.rawJson.blockData) return;
    const ctx = canvas.getContext('2d');
    const raw = lvlData.rawJson;
    const bounds = calculatePixelArtBounds(raw);
    const { minX, maxX, minY, maxY, width: cropW, height: cropH } = bounds;

    const canvasW = canvas.width || 240;
    const canvasH = canvas.height || 240;
    const maxDim = Math.max(cropW, cropH, 1);
    const cellSize = Math.max(3, Math.floor((canvasW - 20) / maxDim));
    const renderW = cropW * cellSize;
    const renderH = cropH * cellSize;
    const offsetX = Math.floor((canvasW - renderW) / 2);
    const offsetY = Math.floor((canvasH - renderH) / 2);

    ctx.clearRect(0, 0, canvasW, canvasH);

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasW, canvasH);

    for (let x = minX; x <= maxX; x++) {
      const col = raw.blockData[x]?.d || [];
      for (let y = minY; y <= maxY; y++) {
        const cell = col[y];
        const type = cell?.type;
        const px = offsetX + (x - minX) * cellSize;
          const py = offsetY + (maxY - y) * cellSize;

        if (type !== undefined && type !== -1 && type !== null) {
          ctx.fillStyle = getColor(type);
          ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }
  }

  /**
   * Mở modal ghi chú và override cho 1 cell trong Proposed Blueprint
   */
  openCommentModal(levelNum, mechId, mechName) {
    const modal = document.getElementById('mmapCommentModal');
    if (!modal) return;

    const titleEl = document.getElementById('mmapCommentModalTitle');
    const metaEl = document.getElementById('mmapCommentCellMeta');
    const inputEl = document.getElementById('mmapCommentInput');
    const selectEl = document.getElementById('mmapOverridePhaseSelect');

    const btnClose = document.getElementById('mmapCommentModalClose');
    const btnCancel = document.getElementById('mmapCommentBtnCancel');
    const btnSave = document.getElementById('mmapCommentBtnSave');
    const btnReset = document.getElementById('mmapCommentBtnReset');

    const compositeKey = `${levelNum}_${mechId}`;
    const existingEdit = this.editsMap.get(compositeKey);

    if (titleEl) titleEl.innerHTML = `💬 Edit & Comment — Level ${levelNum}`;
    if (metaEl) metaEl.innerHTML = `<strong>${mechName}</strong> (ID: <code>${mechId}</code>)`;
    if (inputEl) inputEl.value = existingEdit ? (existingEdit.comment || '') : '';

    if (selectEl) {
      if (existingEdit) {
        if (existingEdit.overrideType === 'removed') selectEl.value = 'removed';
        else if (existingEdit.overridePhase) selectEl.value = existingEdit.overridePhase;
        else selectEl.value = 'default';
      } else {
        selectEl.value = 'default';
      }
    }

    modal.classList.add('show');

    const closeModal = () => modal.classList.remove('show');

    if (btnClose) btnClose.onclick = () => closeModal();
    if (btnCancel) btnCancel.onclick = () => closeModal();

    if (btnReset) {
      btnReset.onclick = async () => {
        if (this.callbacks.onRemoveEdit) {
          await this.callbacks.onRemoveEdit(compositeKey);
        }
        closeModal();
      };
    }

    if (btnSave) {
      btnSave.onclick = async () => {
        const commentVal = inputEl ? inputEl.value.trim() : '';
        const phaseVal = selectEl ? selectEl.value : 'default';

        if (phaseVal === 'default' && !commentVal) {
          if (this.callbacks.onRemoveEdit) {
            await this.callbacks.onRemoveEdit(compositeKey);
          }
        } else {
          let overrideType = 'phase_changed';
          let overridePhase = phaseVal;

          if (phaseVal === 'removed') {
            overrideType = 'removed';
            overridePhase = null;
          } else if (phaseVal === 'default') {
            overrideType = 'added';
            overridePhase = null;
          }

          const record = {
            key: compositeKey,
            levelNum,
            mechId,
            mechName,
            overrideType,
            overridePhase,
            comment: commentVal
          };

          if (this.callbacks.onSaveEdit) {
            await this.callbacks.onSaveEdit(record);
          }
        }
        closeModal();
      };
    }
  }

  setGroupBy(mode) {
    this.groupBy = mode;
    const sel = this.container.querySelector('#mmapGroupBy');
    if (sel) sel.value = mode;
    this.render();
  }

  setZoomRange(min, max) {
    this.minLevel = min;
    this.maxLevel = max;
    const minInp = this.container.querySelector('#mmapMinLevel');
    const maxInp = this.container.querySelector('#mmapMaxLevel');
    if (minInp) minInp.value = min;
    if (maxInp) maxInp.value = max;
    this.render();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

